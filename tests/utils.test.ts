import assert from 'node:assert';
import { describe, it } from 'node:test';
import { deepEquals } from '../utils.js';

describe('deepEquals', () => {
    it('should correctly compare simple and nested structures', () => {
        assert.ok(deepEquals(null, null));
        assert.ok(deepEquals(undefined, undefined));
        assert.ok(deepEquals('', ''));
        assert.ok(deepEquals(0, 0));
        assert.ok(deepEquals(false, false));
        assert.ok(deepEquals(1, 1));
        assert.ok(deepEquals('asd', 'asd'));
        assert.ok(deepEquals([1, 2, 3], [1, 2, 3]));
        assert.ok(
            deepEquals(
                { a: [{ b: { c: 3, d: undefined } }, 1], b: 'asd', c: null },
                { c: null, b: 'asd', a: [{ b: { d: undefined, c: 3 } }, 1] }
            )
        );

        assert.ok(!deepEquals(null, undefined));
        assert.ok(!deepEquals('', 'a'));
        assert.ok(!deepEquals(0, 1));
        assert.ok(!deepEquals(false, true));
        assert.ok(!deepEquals(1, 2));
        assert.ok(!deepEquals('asd', 'asdf'));
        assert.ok(!deepEquals([1, 2, 3], [1, 2, 3, 4]));
        assert.ok(!deepEquals([1, 2, 3], [1, 2, 4]));
        assert.ok(
            !deepEquals(
                { a: [{ b: { c: 3, d: undefined } }, 1], b: 'asd', c: null },
                { c: null, b: 'asd', a: [{ b: { d: null, c: 3 } }, 1] }
            )
        );
    });
});

describe('throttling', () => {
    it('should block requests that are before the throttle limit', () => {});

    it('should allow requests again after the throttle limit', () => {});
});
