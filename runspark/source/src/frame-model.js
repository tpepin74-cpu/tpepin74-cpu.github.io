import * as THREE from 'three';

/**
 * A physical reconstruction of the supplied marathon frame.
 * Every visible front surface is sampled from the original 1152 × 1536 photo:
 * the moulding, its miters and imperfections, the cut mat and the keepsakes.
 * One common projective transform rectifies the complete photographic assembly.
 * The source image is never cropped, repainted, generated or flattened into a
 * single billboard: every surface keeps its own silhouette and physical body.
 * Source texture ownership stays with the caller.
 */
export const PARTS = [
  { id: 'frame', label: 'Le cadre', short: 'Bois noir', description: 'Une structure noire satinée, assemblée en onglet, qui donne sa profondeur au souvenir.', index: 0 },
  { id: 'glass', label: 'La vitre', short: 'Protection', description: 'Une surface transparente qui laisse toute leur place aux souvenirs.', index: 1 },
  { id: 'mat', label: 'Le passe-partout', short: 'Cinq ouvertures', description: 'Cinq découpes et leurs filets clairs organisent chaque pièce dans le cadre.', index: 2 },
  { id: 'route', label: 'Le parcours & le temps', short: '42,195 km', description: 'Le tracé de New York et la plaque qui garde le nom et le temps de course.', index: 3 },
  { id: 'bib', label: 'Le dossard', short: '67027', description: 'Le numéro de course original, avec le nom et les détails du départ.', index: 4 },
  { id: 'medal', label: 'La médaille', short: 'New York 2025', description: 'La récompense de la course, accompagnée de son ruban violet d’origine.', index: 5 },
  { id: 'event', label: 'La plaque événement', short: '2 novembre 2025', description: 'La signature de cette édition du marathon, dans son emplacement dédié.', index: 6 },
  { id: 'foam', label: 'Le fond de maintien', short: 'Support en relief', description: 'Un support noir épais reçoit les différents éléments de la composition.', index: 7 },
  { id: 'back', label: 'Le panneau arrière', short: 'Dos & attaches', description: 'Un revers kraft, un dispositif d’accroche et des attaches de maintien complètent le cadre.', index: 8 },
];

export const MODEL_BOUNDS = {
  assembled: { width: 3.9, height: 4.9, depth: 0.65 },
  exploded: { width: 4.3, height: 5.1, depth: 5.5 },
};

const PHOTO_WIDTH = 1152;
const PHOTO_HEIGHT = 1536;

const FRAME_PHOTO = {
  outer: [[231, 165], [974, 201], [947, 1054], [211, 1043]],
  aperture: [[303, 248], [902, 271], [882, 979], [292, 969]],
  board: [[327, 254], [899, 276], [879, 978], [307, 966]],
};

// Coordinates measured in the supplied original photograph, not the generated
// exploded-view reference. These retain the real names, logos and race number.
const ART = {
  route: [[339, 289], [560, 298], [551, 638], [333, 632]],
  name: [[333, 652], [551, 660], [550, 726], [330, 719]],
  bib: [[330, 741], [578, 748], [572, 941], [324, 935]],
  event: [[621, 800], [830, 806], [825, 932], [617, 925]],
  ribbonLeft: [[597, 309], [671, 312], [759, 509], [678, 514]],
  ribbonRight: [[784, 315], [850, 318], [765, 508], [735, 456]],
  clasp: [[674, 512], [767, 509], [769, 540], [673, 543]],
  medal: [[686, 535], [721, 532], [755, 532], [777, 549], [798, 573], [810, 599], [815, 626], [809, 652], [797, 677], [779, 699], [755, 715], [730, 725], [701, 724], [675, 714], [651, 695], [633, 673], [622, 648], [619, 620], [623, 595], [637, 572], [657, 551]],
};

const CUTOUTS = [
  [[344, 294], [555, 302], [546, 633], [337, 626]],
  [[337, 658], [546, 665], [545, 720], [334, 714]],
  [[334, 745], [574, 752], [568, 936], [329, 930]],
  [[594, 305], [854, 318], [841, 733], [585, 726]],
  [[626, 805], [825, 811], [820, 926], [622, 920]],
];

// Connected silhouette cut out of the real background so the backing plate
// never displays a second medal or ribbon during the explosion animation.
const MEDAL_SILHOUETTE = [
  [597, 309], [671, 312], [735, 456], [784, 315], [850, 318],
  [765, 508], [767, 509], [769, 540], [777, 549], [798, 573],
  [810, 599], [815, 626], [809, 652], [797, 677], [779, 699],
  [755, 715], [730, 725], [701, 724], [675, 714], [651, 695],
  [633, 673], [622, 648], [619, 620], [623, 595], [637, 572],
  [657, 551], [673, 543], [674, 512], [678, 514],
];

const MOTION = {
  frame: { x: 0.16, y: 0.10, z: 2.45, start: 0, end: 0.83, ry: 0.015 },
  glass: { x: 0.12, y: 0.055, z: 1.58, start: 0.025, end: 0.87 },
  mat: { x: 0.065, y: 0.015, z: 0.76, start: 0.05, end: 0.91 },
  route: { x: -0.105, y: 0.135, z: 0.11, start: 0.075, end: 0.93, rz: 0.01 },
  bib: { x: -0.13, y: -0.09, z: -0.12, start: 0.075, end: 0.93, rz: -0.014 },
  medal: { x: 0.17, y: 0.105, z: -0.27, start: 0.075, end: 0.93, rz: -0.012 },
  event: { x: 0.145, y: -0.105, z: -0.42, start: 0.075, end: 0.93, rz: 0.012 },
  foam: { x: -0.115, y: -0.02, z: -1.36, start: 0.05, end: 0.96 },
  back: { x: -0.18, y: -0.075, z: -2.40, start: 0, end: 1, ry: -0.012 },
};

function solveLinear(matrix, values) {
  const a = matrix.map((row, i) => [...row, values[i]]);
  for (let column = 0; column < a.length; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < a.length; row += 1) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    }
    [a[column], a[pivot]] = [a[pivot], a[column]];
    const divisor = a[column][column];
    for (let k = column; k <= a.length; k += 1) a[column][k] /= divisor;
    for (let row = 0; row < a.length; row += 1) {
      if (row === column) continue;
      const factor = a[row][column];
      for (let k = column; k <= a.length; k += 1) a[row][k] -= factor * a[column][k];
    }
  }
  return a.map((row) => row[a.length]);
}

function createPhotoProjection() {
  // Every part uses the exterior corners as its common registration reference.
  const source = FRAME_PHOTO.outer;
  const target = [[-1.95, 2.45], [1.95, 2.45], [1.95, -2.45], [-1.95, -2.45]];
  const matrix = [];
  const values = [];
  source.forEach(([x, y], i) => {
    const [u, v] = target[i];
    matrix.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    values.push(u);
    matrix.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    values.push(v);
  });
  const h = solveLinear(matrix, values);
  const forward = new THREE.Matrix3().set(h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1);
  const inverse = forward.clone().invert();
  const project = (x, y, transform) => {
    const point = new THREE.Vector3(x, y, 1).applyMatrix3(transform);
    return [point.x / point.z, point.y / point.z];
  };
  return {
    toModel: (point) => project(point[0], point[1], forward),
    toPhoto: (x, y) => project(x, y, inverse),
  };
}

function shapeFromPoints(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  return shape;
}

function rectPoints(width, height) {
  return [[-width / 2, -height / 2], [width / 2, -height / 2], [width / 2, height / 2], [-width / 2, height / 2]];
}

function ringShape(outerWidth, outerHeight, innerWidth, innerHeight) {
  const shape = shapeFromPoints(rectPoints(outerWidth, outerHeight));
  shape.holes.push(new THREE.Path(rectPoints(innerWidth, innerHeight).reverse().map(([x, y]) => new THREE.Vector2(x, y))));
  return shape;
}

function polygonRing(outer, inner) {
  const shape = shapeFromPoints(outer);
  shape.holes.push(new THREE.Path(inner.map(([x, y]) => new THREE.Vector2(x, y))));
  return shape;
}

function smoothstep(value) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

export function createFrameModel({ texture }) {
  if (!texture?.isTexture) throw new TypeError('createFrameModel requires the original photograph as a Three.js Texture.');

  const group = new THREE.Group();
  group.name = 'Marathon frame · original photograph';
  const geometries = new Set();
  const materials = new Set();
  const roots = new Map();
  const accents = new Map();
  const projection = createPhotoProjection();
  let disposed = false;

  const trackGeometry = (geometry) => { geometries.add(geometry); return geometry; };
  const trackMaterial = (material) => { materials.add(material); return material; };
  const standard = (options) => trackMaterial(new THREE.MeshStandardMaterial(options));
  const basic = (options) => trackMaterial(new THREE.MeshBasicMaterial(options));

  const frameSide = standard({ color: '#171a1d', roughness: 0.47, metalness: 0.08 });
  const innerBlack = standard({ color: '#0c1014', roughness: 0.54, metalness: 0.08 });
  const matBlack = standard({ color: '#242833', roughness: 0.98, metalness: 0 });
  const matEdge = standard({ color: '#e2dac9', roughness: 0.92, metalness: 0 });
  const foamBlack = standard({ color: '#12171c', roughness: 1, metalness: 0 });
  const foamEdge = standard({ color: '#1e2328', roughness: 0.98, metalness: 0 });
  const kraft = standard({ color: '#a48b68', roughness: 0.94, metalness: 0 });
  const kraftEdge = standard({ color: '#8d7455', roughness: 1, metalness: 0 });
  const paper = standard({ color: '#e4e1d8', roughness: 0.94, metalness: 0 });
  const silver = standard({ color: '#9fa7a8', roughness: 0.34, metalness: 0.77 });
  const medalMetal = standard({ color: '#958254', roughness: 0.37, metalness: 0.78 });
  const ribbonEdge = standard({ color: '#393451', roughness: 0.96, metalness: 0 });
  const hardware = standard({ color: '#34383a', roughness: 0.36, metalness: 0.82 });
  const hardwareDark = standard({ color: '#151a1d', roughness: 0.56, metalness: 0.62 });

  // Unlit, untinted faces preserve the actual photographic colors and details.
  const artwork = basic({ map: texture, color: 0xffffff, toneMapped: false, side: THREE.FrontSide });
  const glassMaterial = standard({ color: '#e5f1f2', transparent: true, opacity: 0, roughness: 0.05, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide });

  PARTS.forEach((part) => {
    const root = new THREE.Group();
    root.name = part.label;
    root.userData.partId = part.id;
    roots.set(part.id, root);
    accents.set(part.id, []);
    group.add(root);
  });

  function addMesh(root, geometry, material, z = 0) {
    const mesh = new THREE.Mesh(trackGeometry(geometry), material);
    mesh.position.z = z;
    mesh.castShadow = material !== glassMaterial && material !== artwork;
    mesh.receiveShadow = material !== glassMaterial && material !== artwork;
    root.add(mesh);
    return mesh;
  }

  function addSolid(root, shape, depth, frontZ, material, bevel = 0) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 2,
      curveSegments: 8,
      steps: 1,
    });
    // Bevels extend the cap above depth. Anchor the actual top at frontZ so no
    // opaque support can pass in front of its own photographic surface.
    return addMesh(root, geometry, material, frontZ - depth - bevel);
  }

  function addOutline(root, points, z, id) {
    const material = trackMaterial(new THREE.LineBasicMaterial({ color: '#00f0ff', transparent: true, opacity: 0, depthWrite: false }));
    const vertices = points.map(([x, y]) => new THREE.Vector3(x, y, z));
    const line = new THREE.LineLoop(trackGeometry(new THREE.BufferGeometry().setFromPoints(vertices)), material);
    line.raycast = () => {};
    line.renderOrder = 8;
    root.add(line);
    accents.get(id).push(material);
  }

  function addPhotoFace(root, sourcePoints, frontZ, divisions = 2, sourceHoles = [], depthOffset = null) {
    const modelPoints = sourcePoints.map(projection.toModel);
    const shape = shapeFromPoints(modelPoints);
    sourceHoles.forEach((hole) => {
      shape.holes.push(new THREE.Path(hole.map(projection.toModel).map(([x, y]) => new THREE.Vector2(x, y))));
    });
    const sourceGeometry = new THREE.ShapeGeometry(shape);
    const position = sourceGeometry.getAttribute('position');
    const indices = sourceGeometry.index?.array || Array.from({ length: position.count }, (_, i) => i);
    const vertices = [];
    const uvs = [];
    const append = (point) => {
      vertices.push(point[0], point[1], depthOffset ? depthOffset(point) : 0);
      const [u, v] = projection.toPhoto(point[0], point[1]);
      uvs.push(u / PHOTO_WIDTH, 1 - v / PHOTO_HEIGHT);
    };
    const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const subdivide = (a, b, c, level) => {
      if (level === 0) { append(a); append(b); append(c); return; }
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      subdivide(a, ab, ca, level - 1);
      subdivide(ab, b, bc, level - 1);
      subdivide(ca, bc, c, level - 1);
      subdivide(ab, bc, ca, level - 1);
    };
    for (let i = 0; i < indices.length; i += 3) {
      const triangle = [indices[i], indices[i + 1], indices[i + 2]].map((index) => [position.getX(index), position.getY(index)]);
      subdivide(triangle[0], triangle[1], triangle[2], divisions);
    }
    sourceGeometry.dispose();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    const face = addMesh(root, geometry, artwork, frontZ + 0.0015);
    face.name = 'Original photographic surface';
    face.userData.photoSurface = true;
    face.userData.photoSampling = 'registered-projective-uv';
    face.userData.photoFrontZ = frontZ;
    return face;
  }

  function addKeepsake(id, sourcePoints, frontZ, thickness, material, divisions = 3) {
    const root = roots.get(id);
    const points = sourcePoints.map(projection.toModel);
    addSolid(root, shapeFromPoints(points), thickness, frontZ, material, thickness > 0.025 ? 0.002 : 0);
    const face = addPhotoFace(root, sourcePoints, frontZ, divisions);
    addOutline(root, points, frontZ + 0.006, id);
    return face;
  }

  // Four real photographic rail faces, sharing the source frame's true miters.
  const frame = roots.get('frame');
  const outerPoints = FRAME_PHOTO.outer.map(projection.toModel);
  const aperturePoints = FRAME_PHOTO.aperture.map(projection.toModel);
  const boardPoints = FRAME_PHOTO.board.map(projection.toModel);
  addSolid(frame, polygonRing(outerPoints, aperturePoints), 0.48, 0.18, frameSide, 0.003);
  const rails = FRAME_PHOTO.outer.map((point, i) => {
    const next = (i + 1) % 4;
    return [point, FRAME_PHOTO.outer[next], FRAME_PHOTO.aperture[next], FRAME_PHOTO.aperture[i]];
  });
  rails.forEach((sourcePoints, i) => {
    const rail = addSolid(frame, shapeFromPoints(sourcePoints.map(projection.toModel)), 0.095, 0.265, frameSide, 0.003);
    rail.name = `Mitered rail ${i + 1}`;
    addPhotoFace(frame, sourcePoints, 0.265, 3);
  });
  // The photographed inner rebate slopes from the moulding towards the mat.
  FRAME_PHOTO.aperture.forEach((point, i) => {
    const next = (i + 1) % 4;
    const source = [point, FRAME_PHOTO.aperture[next], FRAME_PHOTO.board[next], FRAME_PHOTO.board[i]];
    const frontA = aperturePoints[i];
    const frontB = aperturePoints[next];
    const backA = boardPoints[i];
    const backB = boardPoints[next];
    const distanceToLine = (p, a, b) => Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / Math.hypot(b[0] - a[0], b[1] - a[1]);
    addPhotoFace(frame, source, 0.265, 3, [], (p) => {
      const frontDistance = distanceToLine(p, frontA, frontB);
      const backDistance = distanceToLine(p, backA, backB);
      return -0.182 * frontDistance / Math.max(0.00001, frontDistance + backDistance);
    });
  });
  addSolid(frame, ringShape(3.29, 4.20, 3.17, 4.08), 0.04, -0.265, innerBlack);
  addOutline(frame, outerPoints, 0.270, 'frame');

  // Thin glazing with real edge geometry; no opaque rectangle over the artwork.
  const glass = roots.get('glass');
  const glassBox = addSolid(glass, shapeFromPoints(boardPoints), 0.009, 0.162, glassMaterial);
  glassBox.renderOrder = 6;
  glassBox.castShadow = false;
  glassBox.receiveShadow = false;
  const edgeMaterial = trackMaterial(new THREE.LineBasicMaterial({ color: '#b9dadd', transparent: true, opacity: 0, depthWrite: false }));
  const glassEdges = new THREE.LineSegments(trackGeometry(new THREE.EdgesGeometry(glassBox.geometry)), edgeMaterial);
  glassEdges.position.copy(glassBox.position);
  glassEdges.raycast = () => {};
  glassEdges.renderOrder = 7;
  glass.add(glassEdges);
  const sheen = basic({ color: '#eefcff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const sheenShape = shapeFromPoints([[-1.585, 1.95], [-1.45, 2.04], [1.58, -1.28], [1.58, -1.61]]);
  const glassSheen = addMesh(glass, new THREE.ShapeGeometry(sheenShape), sheen, 0.162);
  glassSheen.castShadow = false;
  glassSheen.receiveShadow = false;
  glassSheen.renderOrder = 7;
  glassSheen.raycast = () => {};
  addOutline(glass, boardPoints, 0.165, 'glass');

  // The real mat retains its photographed white borders, grain and tiny marks.
  const mat = roots.get('mat');
  const matShape = shapeFromPoints(boardPoints);
  CUTOUTS.forEach((cutout) => {
    const points = cutout.map(projection.toModel);
    matShape.holes.push(new THREE.Path(points.map(([x, y]) => new THREE.Vector2(x, y))));
  });
  addSolid(mat, matShape, 0.046, 0.078, [matBlack, matEdge]);
  addPhotoFace(mat, FRAME_PHOTO.board, 0.078, 3, CUTOUTS);
  addOutline(mat, boardPoints, 0.083, 'mat');

  // Five original keepsakes, each with its own physical surface and plain back.
  addKeepsake('route', ART.route, 0.014, 0.019, paper);
  addKeepsake('route', ART.name, 0.016, 0.025, silver);
  addKeepsake('bib', ART.bib, 0.013, 0.011, paper);
  addKeepsake('event', ART.event, 0.015, 0.028, paper);

  // Ribbon branches and medal are individually silhouetted from the photograph.
  addKeepsake('medal', ART.ribbonRight, 0.020, 0.008, ribbonEdge, 2);
  addKeepsake('medal', ART.ribbonLeft, 0.028, 0.009, ribbonEdge, 2);
  addKeepsake('medal', ART.clasp, 0.054, 0.031, medalMetal, 2);
  addKeepsake('medal', ART.medal, 0.074, 0.057, medalMetal, 2);

  // A restrained, unlettered cast-metal reverse is visible during the 360° turn.
  const medalCenter = projection.toModel([717, 631]);
  const reverseRing = addMesh(roots.get('medal'), new THREE.TorusGeometry(0.438, 0.005, 5, 48), medalMetal, 0.014);
  reverseRing.position.x = medalCenter[0];
  reverseRing.position.y = medalCenter[1];
  reverseRing.scale.y = 1.10;

  const foam = roots.get('foam');
  addSolid(foam, shapeFromPoints(boardPoints), 0.18, -0.042, [foamBlack, foamEdge]);
  // Fill the normally concealed support with a clean dark region of the REAL
  // photograph. Mirrored geometry UV tiles repeat only that region, never the
  // entire image or a souvenir. No bitmap is generated or edited for this.
  const foamVertices = [];
  const foamUvs = [];
  const sample = [[597, 429], [625, 430], [624, 516], [594, 515]];
  const quadAt = (quad, x, y) => [
    (1 - y) * ((1 - x) * quad[0][0] + x * quad[1][0]) + y * ((1 - x) * quad[3][0] + x * quad[2][0]),
    (1 - y) * ((1 - x) * quad[0][1] + x * quad[1][1]) + y * ((1 - x) * quad[3][1] + x * quad[2][1]),
  ];
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      const corners = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => {
        const point = quadAt(boardPoints, (column + x) / 9, (row + y) / 4);
        const uv = quadAt(sample, column % 2 ? 1 - x : x, row % 2 ? 1 - y : y);
        return { point, uv };
      });
      [0, 2, 1, 0, 3, 2].forEach((index) => {
        const { point, uv } = corners[index];
        foamVertices.push(point[0], point[1], 0);
        foamUvs.push(uv[0] / PHOTO_WIDTH, 1 - uv[1] / PHOTO_HEIGHT);
      });
    }
  }
  const foamPhotoGeometry = new THREE.BufferGeometry();
  foamPhotoGeometry.setAttribute('position', new THREE.Float32BufferAttribute(foamVertices, 3));
  foamPhotoGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(foamUvs, 2));
  foamPhotoGeometry.computeVertexNormals();
  const foamPhoto = addMesh(foam, foamPhotoGeometry, artwork, -0.0405);
  foamPhoto.name = 'Original dark photograph sample';
  foamPhoto.userData.photoSurface = true;
  foamPhoto.userData.photoSampling = 'mirrored-clean-source-region';
  // The area visible around the medal uses the source pixels at their precise
  // registered locations. Its souvenir-shaped hole reveals the tiled support.
  addPhotoFace(foam, CUTOUTS[3], -0.038, 3, [MEDAL_SILHOUETTE]);
  addOutline(foam, boardPoints, -0.034, 'foam');

  const back = roots.get('back');
  addSolid(back, shapeFromPoints(rectPoints(3.19, 4.085)), 0.066, -0.226, [kraft, kraftEdge], 0.006);
  // Three slender edge laminations suggest the MDF thickness without a bitmap.
  [-0.239, -0.256, -0.275].forEach((z) => {
    const edge = new THREE.LineLoop(trackGeometry(new THREE.BufferGeometry().setFromPoints(rectPoints(3.195, 4.09).map(([x, y]) => new THREE.Vector3(x, y, z)))), trackMaterial(new THREE.LineBasicMaterial({ color: '#907555', transparent: true, opacity: 0.32 })));
    edge.raycast = () => {};
    back.add(edge);
  });

  function addScrew(root, x, y, z, radius = 0.025) {
    const screw = addMesh(root, new THREE.CylinderGeometry(radius, radius, 0.012, 16), hardware, z);
    screw.rotation.x = Math.PI / 2;
    screw.position.x = x;
    screw.position.y = y;
    const slot = addMesh(root, new THREE.BoxGeometry(radius * 1.28, 0.004, 0.002), hardwareDark, z - 0.007);
    slot.position.set(x, y, z - 0.007);
    slot.rotation.z = 0.42;
  }

  // Sawtooth hanger on the outward-facing rear surface.
  const hangerPoints = [[-0.40, 0.065], [0.40, 0.065], [0.40, -0.065], [0.32, -0.065]];
  for (let x = 0.29; x >= -0.29; x -= 0.065) {
    hangerPoints.push([x, -0.033], [x - 0.031, -0.065]);
  }
  hangerPoints.push([-0.40, -0.065]);
  const hanger = addSolid(back, shapeFromPoints(hangerPoints), 0.023, -0.303, hardware);
  hanger.position.y = 1.69;
  addScrew(back, -0.347, 1.69, -0.333, 0.025);
  addScrew(back, 0.347, 1.69, -0.333, 0.025);

  // Four rounded swivel retaining clips, only on the rear of the assembly.
  const clipLocations = [[-1.39, 1.33, -0.45], [1.39, 1.33, 0.45], [-1.39, -1.38, 0.45], [1.39, -1.38, -0.45]];
  clipLocations.forEach(([x, y, angle]) => {
    const clipGroup = new THREE.Group();
    clipGroup.position.set(x, y, 0);
    clipGroup.rotation.z = angle;
    back.add(clipGroup);
    const shape = new THREE.Shape();
    shape.moveTo(-0.043, -0.09);
    shape.lineTo(-0.043, 0.09);
    shape.quadraticCurveTo(-0.043, 0.133, 0, 0.133);
    shape.quadraticCurveTo(0.043, 0.133, 0.043, 0.09);
    shape.lineTo(0.043, -0.09);
    shape.quadraticCurveTo(0.043, -0.133, 0, -0.133);
    shape.quadraticCurveTo(-0.043, -0.133, -0.043, -0.09);
    addSolid(clipGroup, shape, 0.017, -0.302, hardwareDark, 0.004);
    addScrew(clipGroup, 0, -0.069, -0.33, 0.018);
  });
  addOutline(back, rectPoints(3.205, 4.10), -0.30, 'back');

  roots.forEach((root, id) => {
    root.traverse((child) => { child.userData.partId = id; });
  });

  function update(explosion = 0, selectedId = null) {
    if (disposed) return;
    const amount = Number.isFinite(explosion) ? THREE.MathUtils.clamp(explosion, 0, 1) : 0;
    roots.forEach((root, id) => {
      const target = MOTION[id];
      const progress = smoothstep((amount - target.start) / (target.end - target.start));
      const selected = selectedId === id;
      root.position.set(target.x * progress, target.y * progress, target.z * progress);
      root.rotation.set(0, (target.ry || 0) * progress, (target.rz || 0) * progress);
      accents.get(id).forEach((material) => { material.opacity = selected ? 0.86 : 0; });
    });
    // The original photograph already contains glass reflections. At the fully
    // assembled state no synthetic veil is allowed to wash out those pixels.
    const glassVisibility = smoothstep(amount);
    glassMaterial.opacity = (selectedId === 'glass' ? 0.07 : 0.022) * glassVisibility;
    edgeMaterial.opacity = 0.30 * glassVisibility;
    sheen.opacity = 0.013 * glassVisibility;
    group.updateMatrixWorld(true);
  }

  function getPartPositions() {
    group.updateMatrixWorld(true);
    return Object.fromEntries([...roots].map(([id, root]) => [id, root.getWorldPosition(new THREE.Vector3())]));
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    geometries.clear();
    materials.clear();
    group.clear();
    // Do not dispose the original texture: it belongs to the scene / caller.
  }

  update(0, null);
  return { group, update, getPartPositions, dispose };
}
