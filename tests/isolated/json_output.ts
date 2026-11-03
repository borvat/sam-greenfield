/** Output parsing checks only; no database, no network. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseModelJson} from '../../apps/command-center/src/jsonOutput';

test('a fenced JSON object is parsed, with or without a language tag', () => {
  assert.deepEqual(parseModelJson('```json\n{"a":1}\n```'), {a: 1});
  assert.deepEqual(parseModelJson('```\n{"a":1}\n```'), {a: 1});
});

test('a bare object and an object wrapped in prose are both recovered', () => {
  assert.deepEqual(parseModelJson('{"a":1}'), {a: 1});
  assert.deepEqual(parseModelJson('Here is the brief:\n{"a":1}\nEnd.'), {a: 1});
});

test('anything that is not a JSON object is rejected', () => {
  assert.equal(parseModelJson('not json at all'), null);
  assert.equal(parseModelJson('[1,2,3]'), null);
  assert.equal(parseModelJson('{"a":'), null);
  assert.equal(parseModelJson(undefined), undefined);
  assert.deepEqual(parseModelJson({a: 1}), {a: 1});
});
