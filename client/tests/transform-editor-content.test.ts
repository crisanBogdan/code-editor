import assert from 'node:assert'
import { describe, it } from 'node:test'
import { transformEditorContent } from '../transform-editor-content.js';
import { TokenType } from '../token.js';
import { JsParser } from '../js-parser.js';

const cssClasses = {
    [TokenType.Keyword]: 'Keyword',
    [TokenType.Variable]: 'Variable',
    [TokenType.Operator]: 'Operator',
    [TokenType.Parenthesis]: 'Parenthesis',
    [TokenType.Number]: 'Number',
    [TokenType.String]: 'String',
    [TokenType.Comment]: 'Comment',
}

describe('transformEditorContent', () => {
    const jsParser = new JsParser()
    it('should transform a simple string', () => {
        const text = 'var x = (1 + 2), y = \'a\' // comment'
        assert.equal(
            transformEditorContent(text, jsParser, cssClasses), 
            `<span class="${cssClasses[TokenType.Keyword]}">var</span> ` +
            `<span class="${cssClasses[TokenType.Variable]}">x</span> ` +
            `<span class="${cssClasses[TokenType.Operator]}">=</span> ` + 
            `<span class="${cssClasses[TokenType.Parenthesis]}">(</span>` + 
            `<span class="${cssClasses[TokenType.Number]}">1</span> ` + 
            `<span class="${cssClasses[TokenType.Operator]}">+</span> ` + 
            `<span class="${cssClasses[TokenType.Number]}">2</span>` + 
            `<span class="${cssClasses[TokenType.Parenthesis]}">)</span>` + 
            `<span class="${cssClasses[TokenType.Operator]}">,</span> ` + 
            `<span class="${cssClasses[TokenType.Variable]}">y</span> ` +
            `<span class="${cssClasses[TokenType.Operator]}">=</span> ` + 
            `<span class="${cssClasses[TokenType.String]}">'a'</span> ` + 
            `<span class="${cssClasses[TokenType.Comment]}">// comment</span>` 
        )
    })

    it('should correctly transform an already transformed string with new input added', () => {
        const original = `<span class="${cssClasses[TokenType.Keyword]}">var</span> ` +
            `<span class="${cssClasses[TokenType.Variable]}">x</span> ` +
            `<span class="${cssClasses[TokenType.Operator]}">=</span> ` + 
            `<span class="${cssClasses[TokenType.Number]}">1</span> ` + 
            `<span class="${cssClasses[TokenType.Operator]}">;</span> ` +
            `<span class="${cssClasses[TokenType.Comment]}">// comment</span>` 
        const extra = '\nconst y = {}'

        assert.equal(
            transformEditorContent(original + extra, jsParser, cssClasses), 
            original +
            `<br><span class="${cssClasses[TokenType.Keyword]}">const</span> ` +
            `<span class="${cssClasses[TokenType.Variable]}">y</span> ` +
            `<span class="${cssClasses[TokenType.Operator]}">=</span> ` + 
            `<span class="${cssClasses[TokenType.Parenthesis]}">{</span>` + 
            `<span class="${cssClasses[TokenType.Parenthesis]}">}</span>`
        )
    })
})