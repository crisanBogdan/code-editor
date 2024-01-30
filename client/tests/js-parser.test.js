import assert from 'node:assert'
import { describe, it } from 'node:test'
import { jsParser } from '../js-parser.js';
import { TOKEN_TYPE } from '../token-type.js';


describe('jsParser', () => {
    it('should parse variables', () => {
        const tokens = jsParser.getTokens(`
            var x = 1, y = 2;
            const z = 'asd', b = .2;
            let a = o.x;
        `)
        const variables = new Set(
            tokens.filter(t => t.type === TOKEN_TYPE.VARIABLE).map(t => t.value))

        assert.equal(variables.has('x'), true)
        assert.equal(variables.has('y'), true)  
        assert.equal(variables.has('z'), true)  
        assert.equal(variables.has('b'), true)  
        assert.equal(variables.has('a'), true)  
        assert.equal(variables.has('o'), true)  
        assert.equal(variables.size == 6, true, 'should be 6 variables')  
    })

    it('should parse numbers', () => {
        const tokens = jsParser.getTokens('var x = 1 + 2 / 3.5 * 4 - .25;')
        const numbers = new Set(
            tokens.filter(t => t.type === TOKEN_TYPE.NUMBER).map(t => t.value))

        assert.equal(numbers.has('1'), true)
        assert.equal(numbers.has('2'), true)  
        assert.equal(numbers.has('3.5'), true)  
        assert.equal(numbers.has('4'), true)  
        assert.equal(numbers.has('.25'), true)  
        assert.equal(numbers.size == 5, true, 'should be 5 numbers')  
    })
    it('should parse strings', () => {
        const s = `looooooooooooooooooooooooooo
        oooooooooooooool`
        const tokens = jsParser.getTokens(`
            var x = "xxxxxxxxxxxxxxx", y = 'sdsdsdssd', z=\`${s}\`;
            ('123' + '345')
        `)
        const strings = new Set(
            tokens.filter(t => t.type === TOKEN_TYPE.STRING).map(t => t.value))
        
        assert.equal(strings.has('"xxxxxxxxxxxxxxx"'), true)
        assert.equal(strings.has("'sdsdsdssd'"), true)  
        assert.equal(strings.has(`\`${s}\``), true)  
        assert.equal(strings.has("'123'"), true)  
        assert.equal(strings.has("'345'"), true)  
        assert.equal(strings.size == 5, true, 'should be 5 strings')  
    })
    it('should parse all operators', () => {
        const tokens = jsParser.getTokens(`
            let o = { a: 1, b: 3 };
            o.a = o.a * 2 / 3 + 1 % 2 - 4;
            if (!o.a || o.b) { console.log('hmm'); }
            else if (o.a && o.b) { }
            else if (o.a ^ o.b & ~o.a) {}
            else if (o.a <= o.b || o.b >= o.a && o.a !== o.b) {}

        `)
        const operators = new Set(
            tokens.filter(t => t.type === TOKEN_TYPE.OPERATOR).map(t => t.value))
        
        assert.equal(operators.has('='), true)
        assert.equal(operators.has(':'), true)
        assert.equal(operators.has(';'), true)
        assert.equal(operators.has('.'), true)
        assert.equal(operators.has('*'), true)
        assert.equal(operators.has('/'), true)
        assert.equal(operators.has('+'), true)
        assert.equal(operators.has('-'), true)
        assert.equal(operators.has('%'), true)
        assert.equal(operators.has('!'), true)
        assert.equal(operators.has('|'), true)
        assert.equal(operators.has('&'), true)
        assert.equal(operators.has('^'), true)
        assert.equal(operators.has('~'), true)
        assert.equal(operators.has('<'), true)
        assert.equal(operators.has('>'), true)
        assert.equal(operators.size == 17, true, 'should be 17 operators')  
    })
    it('should parse all parenthesis', () => {
        const tokens = jsParser.getTokens(`
            let x = ((1 + 2)), y = [];
            if (x) { }
        `)
        const parenthesis = tokens.filter(t => t.type === TOKEN_TYPE.PARENTHESIS).map(t => t.value)
        
        assert.equal(parenthesis.includes('('), true)
        assert.equal(parenthesis.includes(')'), true)
        assert.equal(parenthesis.includes('['), true)
        assert.equal(parenthesis.includes(']'), true)
        assert.equal(parenthesis.includes('{'), true)
        assert.equal(parenthesis.includes('}'), true)
        assert.equal(parenthesis.length == 10, true, 'should be 10 parenthesis')  
    })

    it('should parse all keywords', () => {
        const tokens = jsParser.getTokens(`
            const x = 1;
            let y = 2;
            var z = 3;
            async function a() { return await 1; }
            async function* b() { yield 1; }
            for (const u of [1,2,3]) {
                do {} while (true);
                continue
            }
            class Test extends Supertest {
                constructor() { super(false); }
                static t() {}
            }
            try { switch (x) { case 1: break } } catch(e) { }
        `)
        const keywords = new Set(tokens.filter(t => t.type === TOKEN_TYPE.KEYWORD).map(t => t.value))

        assert.equal(keywords.has('const'), true)
        assert.equal(keywords.has('let'), true)
        assert.equal(keywords.has('var'), true)
        assert.equal(keywords.has('async'), true)
        assert.equal(keywords.has('await'), true)
        assert.equal(keywords.has('function'), true)
        assert.equal(keywords.has('function*'), true)
        assert.equal(keywords.has('yield'), true)
        assert.equal(keywords.has('return'), true)
        assert.equal(keywords.has('of'), true)
        assert.equal(keywords.has('do'), true)
        assert.equal(keywords.has('while'), true)
        assert.equal(keywords.has('continue'), true)
        assert.equal(keywords.has('for'), true)
        assert.equal(keywords.has('true'), true)
        assert.equal(keywords.has('class'), true)
        assert.equal(keywords.has('extends'), true)
        assert.equal(keywords.has('constructor'), true)
        assert.equal(keywords.has('super'), true)
        assert.equal(keywords.has('false'), true)
        assert.equal(keywords.has('static'), true)
        assert.equal(keywords.has('try'), true)
        assert.equal(keywords.has('switch'), true)
        assert.equal(keywords.has('case'), true)
        assert.equal(keywords.has('catch'), true)
        assert.equal(keywords.has('break'), true)

        assert.equal(keywords.size == 26, true, 'should be 26 keywords')  
    })
    
    it('should parse comments', () => {
        const examples = [
            '// this variable is quite important i must say\n',
            `/**
            * brilliant documentation
            * yes indeed
            * hmm quite
            * */`,
            `/*
                multiline madness
                ssss
            */`,
        ]
        const tokens = jsParser.getTokens(`
            ${examples[0]}
            var x = true;
            ${examples[1]}
            ${examples[2]}
        `)

        const comments = new Set(tokens.filter(t => t.type === TOKEN_TYPE.COMMENT).map(t => t.value))

        assert.equal(comments.has(examples[0]), true)
        assert.equal(comments.has(examples[1]), true)
        assert.equal(comments.has(examples[2]), true)
        assert.equal(comments.size == 3, true, 'should be 3 comments')
    })
})
