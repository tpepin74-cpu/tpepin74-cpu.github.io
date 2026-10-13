import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createFrameModel } from './frame-model.js';

const TAU = Math.PI * 2;
const INITIAL_YAW = 0;
const INITIAL_PITCH = 0;
const EXPLODED_PRESENTATION_YAW = 0.5;
const MAX_PITCH = 0.7;
const DPR_LIMIT = 1.7;
const TEXTURE_URL = '/assets/cadre-original.jpeg';
const clamp = THREE.MathUtils.clamp;

function readExplosion(value) {
  const number = typeof value?.get === 'function' ? value.get() : value;
  return Number.isFinite(number) ? clamp(number, 0, 1) : 0;
}

function smoothTurn(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Motion owns scroll progress; this component owns the independent 3D view.
 * ref: resetView(), rotateBy(radians), demoTurn(). onRotate receives yaw radians.
 */
const FrameScene = forwardRef(function FrameScene(
  {
    explosion,
    selectedPart = null,
    reducedMotion = false,
    onReady,
    onError,
    onRotate,
    textureUrl = TEXTURE_URL,
    className = '',
    style,
  },
  forwardedRef,
) {
  const hostRef = useRef(null);
  const runtimeRef = useRef(null);
  const latestRef = useRef(null);
  latestRef.current = { explosion, selectedPart, reducedMotion, onReady, onError, onRotate };

  useImperativeHandle(forwardedRef, () => ({
    resetView: () => runtimeRef.current?.resetView(),
    rotateBy: (radians) => runtimeRef.current?.rotateBy(radians),
    demoTurn: () => runtimeRef.current?.demoTurn(),
  }), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let disposed = false;
    let failed = false;
    let readyNotified = false;
    let renderer;
    let model;
    let sourceTexture;
    let environmentTarget;
    let frameRequest = 0;
    let previousTime = 0;
    let intersectsViewport = true;
    let isPageVisible = !document.hidden;
    let geometryDirty = true;
    let drag = null;
    let turn = null;
    let lastRotationNotice = 0;
    let lastNotifiedYaw = null;
    let viewWidth = 1;
    let viewHeight = 1;
    let modelRadius = 3.2;

    const view = {
      yaw: INITIAL_YAW,
      targetYaw: INITIAL_YAW,
      pitch: INITIAL_PITCH,
      targetPitch: INITIAL_PITCH,
      explosion: readExplosion(latestRef.current.explosion),
      selectedPart: latestRef.current.selectedPart,
    };

    const stopFrame = () => {
      if (frameRequest) cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      previousTime = 0;
    };

    const fail = (reason) => {
      if (disposed || failed) return;
      failed = true;
      stopFrame();
      const error = reason instanceof Error ? reason : new Error('L’aperçu 3D est indisponible.');
      latestRef.current.onError?.(error);
    };

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      fail(error);
      return undefined;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const canvas = renderer.domElement;
    canvas.className = 'frame-scene__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      touchAction: 'pan-y pinch-zoom',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      cursor: 'grab',
    });
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.08, 100);
    const rotationRoot = new THREE.Group();
    const centerRoot = new THREE.Group();
    rotationRoot.rotation.order = 'YXZ';
    rotationRoot.add(centerRoot);
    scene.add(rotationRoot);

    scene.add(new THREE.HemisphereLight(0xfffbf1, 0x66707d, 1.45));
    const key = new THREE.DirectionalLight(0xfff3df, 2.9);
    key.position.set(-5, 7, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe1eaff, 1.15);
    fill.position.set(5, 1, 5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xfff0d5, 2.2);
    rim.position.set(2, 5, -6);
    scene.add(rim);

    // A small generated environment gives the metal and frame real reflections.
    let room;
    let pmrem;
    try {
      room = new RoomEnvironment();
      pmrem = new THREE.PMREMGenerator(renderer);
      environmentTarget = pmrem.fromScene(room, 0.04);
      scene.environment = environmentTarget.texture;
      scene.environmentIntensity = 0.65;
    } catch {
      // Direct gallery lights remain usable if an environment cannot be created.
      environmentTarget?.dispose();
      environmentTarget = undefined;
      scene.environment = null;
    } finally {
      room?.dispose();
      pmrem?.dispose();
    }

    const localBounds = new THREE.Box3();
    const geometryBounds = new THREE.Box3();
    const rootInverse = new THREE.Matrix4();
    const localMatrix = new THREE.Matrix4();
    const modelCenter = new THREE.Vector3();
    const modelSphere = new THREE.Sphere();

    const fitCamera = () => {
      const aspect = viewWidth / viewHeight;
      const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const limitingHalfFov = Math.atan(Math.tan(verticalHalfFov) * Math.min(1, aspect));
      const distance = (modelRadius * 1.055) / Math.sin(limitingHalfFov);
      camera.aspect = aspect;
      camera.position.set(0, 0, distance);
      camera.far = Math.max(100, distance + modelRadius * 5);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    const updateModelBounds = () => {
      if (!model) return;
      // Bounds are measured in model space so dragging cannot make the zoom pump.
      model.group.updateWorldMatrix(true, true);
      rootInverse.copy(model.group.matrixWorld).invert();
      localBounds.makeEmpty();
      model.group.traverseVisible((object) => {
        const geometry = object.geometry;
        if (!geometry?.isBufferGeometry) return;
        if (!geometry.boundingBox) geometry.computeBoundingBox();
        if (!geometry.boundingBox) return;
        localMatrix.multiplyMatrices(rootInverse, object.matrixWorld);
        geometryBounds.copy(geometry.boundingBox).applyMatrix4(localMatrix);
        localBounds.union(geometryBounds);
      });
      if (localBounds.isEmpty()) return;
      localBounds.getCenter(modelCenter);
      localBounds.getBoundingSphere(modelSphere);
      centerRoot.position.copy(modelCenter).multiplyScalar(-1);
      modelRadius = Math.max(0.5, modelSphere.radius);
      fitCamera();
    };

    const requestRender = () => {
      if (disposed || failed || !model || frameRequest || !intersectsViewport || !isPageVisible) return;
      frameRequest = requestAnimationFrame(render);
    };

    const notifyRotation = (time, force = false) => {
      const displayedYaw = view.yaw + view.explosion * EXPLODED_PRESENTATION_YAW;
      if (lastNotifiedYaw !== null && Math.abs(displayedYaw - lastNotifiedYaw) < 0.0001) return;
      if (force || time - lastRotationNotice > 100) {
        lastRotationNotice = time;
        lastNotifiedYaw = displayedYaw;
        latestRef.current.onRotate?.(displayedYaw);
      }
    };

    function render(time) {
      frameRequest = 0;
      if (disposed || failed || !model || !intersectsViewport || !isPageVisible) return;
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
      previousTime = time;
      const reduced = Boolean(latestRef.current.reducedMotion);

      if (turn) {
        turn.elapsed += delta * 1000;
        const progress = reduced ? 1 : Math.min(turn.elapsed / turn.duration, 1);
        view.yaw = turn.from + (turn.to - turn.from) * smoothTurn(progress);
        view.targetYaw = view.yaw;
        if (progress === 1) turn = null;
      }

      const damping = reduced || drag?.rotating ? 1 : 1 - Math.exp(-delta * 16);
      view.yaw += (view.targetYaw - view.yaw) * damping;
      view.pitch += (view.targetPitch - view.pitch) * damping;
      if (Math.abs(view.targetYaw - view.yaw) < 0.0002) view.yaw = view.targetYaw;
      if (Math.abs(view.targetPitch - view.pitch) < 0.0002) view.pitch = view.targetPitch;

      try {
        if (geometryDirty) {
          model.update(view.explosion, view.selectedPart);
          updateModelBounds();
          geometryDirty = false;
        }

        // Show the rectified real photograph head-on when assembled. A small
        // presentation turn exposes the layers; user rotation stays independent.
        rotationRoot.rotation.set(view.pitch, view.yaw + view.explosion * EXPLODED_PRESENTATION_YAW, 0, 'YXZ');
        renderer.render(scene, camera);
      } catch (error) {
        fail(error);
        return;
      }
      if (!readyNotified) {
        readyNotified = true;
        latestRef.current.onReady?.();
      }
      const moving = Boolean(turn)
        || Math.abs(view.targetYaw - view.yaw) > 0.0002
        || Math.abs(view.targetPitch - view.pitch) > 0.0002;
      notifyRotation(time, !moving);
      if (moving) requestRender();
      else previousTime = 0;
    }

    const resize = () => {
      if (disposed || failed) return;
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      viewWidth = rect.width;
      viewHeight = rect.height;
      const pixelRatio = Math.min(
        DPR_LIMIT,
        window.devicePixelRatio || 1,
        Math.sqrt(3000000 / (viewWidth * viewHeight)),
      );
      const width = Math.max(1, Math.round(viewWidth * pixelRatio));
      const height = Math.max(1, Math.round(viewHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) renderer.setSize(width, height, false);
      fitCamera();
      requestRender();
    };

    const endPointer = (event) => {
      if (!drag || (event?.pointerId !== undefined && event.pointerId !== drag.id)) return;
      const pointerId = drag.id;
      drag = null;
      canvas.style.cursor = 'grab';
      delete host.dataset.dragging;
      if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
      requestRender();
    };

    const pointerDown = (event) => {
      if (!model || failed) return;
      if (event.pointerType === 'touch' && !event.isPrimary) {
        endPointer();
        return;
      }
      if (event.pointerType !== 'touch' && event.button !== 0) return;
      turn = null;
      view.targetYaw = view.yaw;
      view.targetPitch = view.pitch;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        yaw: view.yaw,
        pitch: view.pitch,
        touch: event.pointerType === 'touch',
        rotating: event.pointerType !== 'touch',
      };
      if (drag.rotating) {
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = 'grabbing';
        host.dataset.dragging = 'true';
      }
    };

    const pointerMove = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (drag.touch && !drag.rotating) {
        // Let the browser keep vertical swipes and pinch zoom; own horizontal turns.
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
          endPointer(event);
          return;
        }
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
        drag.rotating = true;
        canvas.setPointerCapture(event.pointerId);
        host.dataset.dragging = 'true';
      }
      const dragDistanceForTurn = Math.max(250, Math.min(780, viewWidth * 0.9));
      view.targetYaw = drag.yaw + (dx / dragDistanceForTurn) * TAU;
      if (!drag.touch) {
        view.targetPitch = clamp(drag.pitch + dy * 0.0035, -MAX_PITCH, MAX_PITCH);
      }
      requestRender();
    };

    const resetView = () => {
      endPointer();
      turn = null;
      // Preserve accumulated turns and choose the shortest path back to the hero view.
      const difference = ((view.yaw - INITIAL_YAW + Math.PI) % TAU + TAU) % TAU - Math.PI;
      view.targetYaw = view.yaw - difference;
      view.targetPitch = INITIAL_PITCH;
      requestRender();
    };

    const rotateBy = (radians) => {
      if (!Number.isFinite(radians)) return;
      endPointer();
      turn = null;
      view.targetYaw += radians;
      requestRender();
    };

    const demoTurn = () => {
      endPointer();
      turn = { from: view.yaw, to: view.yaw + TAU, elapsed: 0, duration: 1850 };
      requestRender();
    };

    runtimeRef.current = {
      resetView,
      rotateBy,
      demoTurn,
      setExplosion: (value) => {
        const next = readExplosion(value);
        if (next === view.explosion) return;
        view.explosion = next;
        geometryDirty = true;
        requestRender();
      },
      setSelectedPart: (value) => {
        view.selectedPart = value;
        geometryDirty = true;
        requestRender();
      },
      refresh: requestRender,
    };

    const pageVisibility = () => {
      isPageVisible = !document.hidden;
      if (!isPageVisible) {
        endPointer();
        stopFrame();
      } else {
        previousTime = 0;
        requestRender();
      }
    };
    const windowBlur = () => endPointer();
    const contextLost = (event) => {
      event.preventDefault();
      fail(new Error('Le contexte graphique a été interrompu.'));
    };

    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('lostpointercapture', endPointer);
    canvas.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', pageVisibility);
    window.addEventListener('blur', windowBlur);
    window.addEventListener('resize', resize, { passive: true });

    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(host);
    const visibilityObserver = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => {
        intersectsViewport = entry.isIntersecting;
        if (intersectsViewport) {
          previousTime = 0;
          requestRender();
        } else {
          endPointer();
          stopFrame();
        }
      }, { rootMargin: '120px 0px' })
      : null;
    visibilityObserver?.observe(host);

    resize();
    sourceTexture = new THREE.TextureLoader().load(
      textureUrl,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        texture.needsUpdate = true;
        try {
          model = createFrameModel({ texture });
          centerRoot.add(model.group);
          geometryDirty = true;
          requestRender();
        } catch (error) {
          fail(error);
        }
      },
      undefined,
      () => fail(new Error('La photographie du cadre n’a pas pu être chargée.')),
    );

    return () => {
      disposed = true;
      runtimeRef.current = null;
      stopFrame();
      endPointer();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', endPointer);
      canvas.removeEventListener('pointercancel', endPointer);
      canvas.removeEventListener('lostpointercapture', endPointer);
      canvas.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', pageVisibility);
      window.removeEventListener('blur', windowBlur);
      window.removeEventListener('resize', resize);
      model?.dispose();
      sourceTexture?.dispose();
      scene.environment = null;
      environmentTarget?.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [textureUrl]);

  useEffect(() => {
    runtimeRef.current?.setExplosion(explosion);
    if (typeof explosion?.on !== 'function') return undefined;
    return explosion.on('change', (value) => runtimeRef.current?.setExplosion(value));
  }, [explosion]);

  useEffect(() => {
    runtimeRef.current?.setSelectedPart(selectedPart);
  }, [selectedPart]);

  useEffect(() => {
    runtimeRef.current?.refresh();
  }, [reducedMotion]);

  return (
    <div
      ref={hostRef}
      className={`frame-scene ${className}`.trim()}
      role="img"
      aria-label="Cadre souvenir en trois dimensions. Des boutons sous le cadre permettent de le faire tourner."
      style={{ width: '100%', height: '100%', position: 'relative', ...style }}
    />
  );
});

export default FrameScene;
