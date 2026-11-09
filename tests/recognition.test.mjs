import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {predict} from '../app/recognition.mjs';
const model=JSON.parse(readFileSync(new URL('../app/models/digits.json',import.meta.url))),fixture=JSON.parse(readFileSync(new URL('./fixtures/digits.json',import.meta.url)));
test('exported JavaScript model recognizes held-out handwritten digits across all ten classes',()=>{let correct=0;fixture.images.forEach((image,i)=>{const p=predict(image.map(x=>x/255),model);if(p.digit===fixture.labels[i])correct++;assert(p.confidence>=0&&p.confidence<=1);});assert.equal(new Set(fixture.labels).size,10);assert(correct>=28,`${correct}/30 recognized`);});
