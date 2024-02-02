import assert from 'node:assert'
import { describe, it } from 'node:test'
import { transformEditorContent } from '../transform-editor-content.js';
import { TokenType } from '../token.js';
import { JsParser } from '../js-parser.js';

const colors = {
    [TokenType.Keyword]: 'red',
    [TokenType.Variable]: 'white',
    [TokenType.Operator]: 'blue',
    [TokenType.Parenthesis]: 'yellow',
    [TokenType.Number]: 'purple',
    [TokenType.String]: 'orange',
    [TokenType.Comment]: 'green',
}

describe('transformEditorContent', () => {
    const jsParser = new JsParser()
    it('should transform a simple string', () => {
        const text = 'var x = (1 + 2), y = \'a\' // comment'
        assert.equal(
            transformEditorContent(text, jsParser, colors), 
            `<span style="color: ${colors[TokenType.Keyword]};">var</span> ` +
            `<span style="color: ${colors[TokenType.Variable]};">x</span> ` +
            `<span style="color: ${colors[TokenType.Operator]};">=</span> ` + 
            `<span style="color: ${colors[TokenType.Parenthesis]};">(</span>` + 
            `<span style="color: ${colors[TokenType.Number]};">1</span> ` + 
            `<span style="color: ${colors[TokenType.Operator]};">+</span> ` + 
            `<span style="color: ${colors[TokenType.Number]};">2</span>` + 
            `<span style="color: ${colors[TokenType.Parenthesis]};">)</span>` + 
            `<span style="color: ${colors[TokenType.Operator]};">,</span> ` + 
            `<span style="color: ${colors[TokenType.Variable]};">y</span> ` +
            `<span style="color: ${colors[TokenType.Operator]};">=</span> ` + 
            `<span style="color: ${colors[TokenType.String]};">'a'</span> ` + 
            `<span style="color: ${colors[TokenType.Comment]};">// comment</span>` 
        )
    })

    it('should correctly transform an already transformed string with new input added', () => {
        const original = `<span style="color: ${colors[TokenType.Keyword]};">var</span> ` +
            `<span style="color: ${colors[TokenType.Variable]};">x</span> ` +
            `<span style="color: ${colors[TokenType.Operator]};">=</span> ` + 
            `<span style="color: ${colors[TokenType.Number]};">1</span> ` + 
            `<span style="color: ${colors[TokenType.Operator]};">;</span> ` +
            `<span style="color: ${colors[TokenType.Comment]};">// comment</span>` 
        const extra = '\nconst y = {}'

        assert.equal(
            transformEditorContent(original + extra, jsParser, colors), 
            original +
            `\n<span style="color: ${colors[TokenType.Keyword]};">const</span> ` +
            `<span style="color: ${colors[TokenType.Variable]};">y</span> ` +
            `<span style="color: ${colors[TokenType.Operator]};">=</span> ` + 
            `<span style="color: ${colors[TokenType.Parenthesis]};">{</span>` + 
            `<span style="color: ${colors[TokenType.Parenthesis]};">}</span>`
        )
    })
})