import assert from 'node:assert'
import { describe, it } from 'node:test'
import { transformEditorContent } from '../transform-editor-content.js';
import { TOKEN_TYPE } from '../token-type.js';
import { jsParser } from '../js-parser.js';

const colors = {
    [TOKEN_TYPE.KEYWORD]: 'red',
    [TOKEN_TYPE.VARIABLE]: 'white',
    [TOKEN_TYPE.OPERATOR]: 'blue',
    [TOKEN_TYPE.PARENTHESIS]: 'yellow',
    [TOKEN_TYPE.NUMBER]: 'purple',
    [TOKEN_TYPE.STRING]: 'orange',
    [TOKEN_TYPE.COMMENT]: 'green',
}

describe('transformEditorContent', () => {
    it('should transform a simple string', () => {
        const text = 'var x = (1 + 2), y = \'a\' // comment'
        assert.equal(
            transformEditorContent(text, jsParser, colors), 
            `<span style="color: ${colors[TOKEN_TYPE.KEYWORD]};">var</span> ` +
            `<span style="color: ${colors[TOKEN_TYPE.VARIABLE]};">x</span> ` +
            `<span style="color: ${colors[TOKEN_TYPE.OPERATOR]};">=</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.PARENTHESIS]};">(</span>` + 
            `<span style="color: ${colors[TOKEN_TYPE.NUMBER]};">1</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.OPERATOR]};">+</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.NUMBER]};">2</span>` + 
            `<span style="color: ${colors[TOKEN_TYPE.PARENTHESIS]};">)</span>` + 
            `<span style="color: ${colors[TOKEN_TYPE.OPERATOR]};">,</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.VARIABLE]};">y</span> ` +
            `<span style="color: ${colors[TOKEN_TYPE.OPERATOR]};">=</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.STRING]};">'a'</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.COMMENT]};">// comment</span>` 
        )
    })

    it('should correctly transform an already transformed string with new input added', () => {
        const original = `<span style="color: ${colors[TOKEN_TYPE.KEYWORD]};">var</span> ` +
            `<span style="color: ${colors[TOKEN_TYPE.VARIABLE]};">x</span> ` +
            `<span style="color: ${colors[TOKEN_TYPE.OPERATOR]};">=</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.NUMBER]};">1</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.OPERATOR]};">;</span> ` +
            `<span style="color: ${colors[TOKEN_TYPE.COMMENT]};">// comment</span>` 
        const extra = '\nconst y = {}'

        assert.equal(
            transformEditorContent(original + extra, jsParser, colors), 
            original +
            `\n<span style="color: ${colors[TOKEN_TYPE.KEYWORD]};">const</span> ` +
            `<span style="color: ${colors[TOKEN_TYPE.VARIABLE]};">y</span> ` +
            `<span style="color: ${colors[TOKEN_TYPE.OPERATOR]};">=</span> ` + 
            `<span style="color: ${colors[TOKEN_TYPE.PARENTHESIS]};">{</span>` + 
            `<span style="color: ${colors[TOKEN_TYPE.PARENTHESIS]};">}</span>`
        )
    })
})