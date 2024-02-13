import assert from 'node:assert';
import { describe, it } from 'node:test';
import { stripHtmlTags } from '../strip-html-tags.js';

describe('stripHtmlTags', () => {
    it('empty string should return empty string', () => {
        assert.strictEqual(stripHtmlTags(''), '');
    });

    it('string without tags should return same string', () => {
        assert.strictEqual(stripHtmlTags('test asd dfgdfg'), 'test asd dfgdfg');
    });

    it('string with one tag should remove tag', () => {
        assert.strictEqual(stripHtmlTags('<span>Test</span>'), 'Test');
    });

    it('string with one tag and with properties should remove tag', () => {
        assert.strictEqual(
            stripHtmlTags(
                '<span style="color: red;" data-testid=\'test\'>Test</span>'
            ),
            'Test'
        );
    });

    it('string with multiple tags should remove all tags', () => {
        assert.strictEqual(
            stripHtmlTags(
                '<span style="color: text;">Test</span> <p class="test">paragraph</p>'
            ),
            'Test paragraph'
        );
    });

    it('should replace <br> tags with "\n"', () => {
        assert.strictEqual(stripHtmlTags('<br>'), '\n');
    });
});
