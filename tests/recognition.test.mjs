import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {predict} from '../app/recognition.mjs';
const model=JSON.parse(readFileSync(new URL('../app/models/digits.json',import.meta.url))),fixture=JSON.parse(readFileSync(new URL('./fixtures/digits.json',import.meta.url)));
test('exported JavaScript model recognizes held-out handwritten digits across all ten classes',()=>{let correct=0;fixture.images.forEach((image,i)=>{const p=predict(image.map(x=>x/255),model);if(p.digit===fixture.labels[i])correct++;assert(p.confidence>=0&&p.confidence<=1);});assert.equal(new Set(fixture.labels).size,10);assert(correct>=28,`${correct}/30 recognized`);});

import {assessDigit,decodeShapes} from '../app/recognition.mjs';
model.shapes=decodeShapes(JSON.parse(readFileSync(new URL('../app/models/digit-shapes.json',import.meta.url))));
test('acceptance gate retains clear non-seven digits; sevens follow the crossbar policy',()=>{const accepted=fixture.images.map((x,i)=>({label:fixture.labels[i],...assessDigit(x.map(v=>v/255),model)})).filter(p=>p.accepted&&p.label!==7);assert(accepted.length>=21,`${accepted.length} accepted`);assert.equal(new Set(accepted.map(p=>p.digit)).size,9);assert(accepted.every(p=>p.digit===p.label));});
test('noise can score highly as a digit but must fail acceptance',()=>{let seed=3;const noise=Array.from({length:784},()=>{seed=seed*16807%2147483647;return seed/2147483647;});assert(predict(noise,model).confidence>.95);for(const input of [Array(784).fill(0),Array(784).fill(1),noise,Array.from({length:784},(_,i)=>(i+Math.floor(i/28))%2)])assert.equal(assessDigit(input,model).accepted,false);});
test('sparse disconnected noise also fails digit-shape checks',()=>{let seed=47;for(let n=0;n<10;n++){const input=Array.from({length:784},()=>{seed=seed*16807%2147483647;return seed/2147483647<.16?1:0;});assert.equal(assessDigit(input,model).accepted,false);}});

test('readable varied proportions rejected by the old shape limit are accepted',()=>{
 const samples=[9,18,25];
 for(const i of samples){const result=assessDigit(fixture.images[i].map(v=>v/255),model);assert.equal(result.digit,fixture.labels[i]);assert.equal(result.accepted,true,`digit ${fixture.labels[i]}: ${result.reason}`);}
});
