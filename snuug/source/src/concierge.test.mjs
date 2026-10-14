import assert from 'node:assert/strict';
import {answerQuestion,knowledge} from './concierge-knowledge.js';
for(const k of knowledge)assert.equal(answerQuestion(k.question).items[0]?.id,k.id,k.question);
for(const [q,id] of [
 ['Puis-je réserver avec mon chien ?','votre-suite-2'],
 ['Est-ce adapté à un fauteuil roulant ?','votre-suite-4'],
 ['Quels sont les prix ?','reservation-0'],
 ['Je souhaite annuler ma réservation','reservation-2'],
 ['Y a-t-il une caution ?','reservation-1'],
 ['À quelle heure est le départ ?','arrivee-0'],
 ['Le petit-déjeuner est-il inclus ?','prestations-1'],
 ['Une escapade en amoureux','amoureux'],
 ['Que faire dans la région ?','agenda'],
 ['Une nuit en août','reservation-3'],
 ['Où se trouve la SNUUG ?','lieu'],
 ])assert.equal(answerQuestion(q).items[0]?.id,id,q);
for(const q of ['Y a-t-il une piscine dans la suite ?','La suite a un jacuzzi ?','Quel temps demain ?','<script>alert(1)</script>'])assert.equal(answerQuestion(q).kind,'fallback',q);
assert.equal(answerQuestion('bonjour').kind,'greeting');
assert.match(answerQuestion('Puis-je annuler ?').items[0].answer,/non remboursables/);
console.log('Concierge: canonical questions, critical intents and unknown-answer fallbacks passed.');
