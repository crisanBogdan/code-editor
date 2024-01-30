import { TOKEN_TYPE } from "./token-type.js"

export const jsParser = {
    keywords: { 'while': true, 'let': true, 'await': true, 'yield': true, 'static': true, 'enum': true, 'implements': true, 'interface': true, 'package': true, 'private': true, 'protected': true, 'public': true, 'case': true, 'async': true, 'catch': true, 'class': true, 'const': true, 'continue': true, 'debugger': true, 'get': true, 'set': true, 'from': true, 'of': true, 'default': true, 'delete': true, 'do': true, 'else': true, 'export': true, 'extends': true, 'false': true, 'finally': true, 'for': true, 'function': true, 'function*': true, 'if': true, 'import': true, 'in': true, 'instanceof': true, 'new': true, 'null': true, 'return': true, 'super': true, 'switch': true, 'this': true, 'throw': true, 'true': true, 'try': true, 'typeof': true, 'var': true, 'void': true, 'break': true, },
    getTokens(text = '') {
        this.start = 0
        this.current = 0
        this.tokens = []
        this.text = text

        while (!this._atEnd()) {
            switch (this.text[this.current]) {
                case '!':
                case '?':
                case '|':
                case '<':
                case '>':
                case '=':
                case '\\':
                case ';':
                case ':':
                case ',':
                case '@':
                case '%':
                case '^':
                case '&':
                case '~':
                case '*':
                case '-':
                case '+': { 
                    this.tokens.push({ type: TOKEN_TYPE.OPERATOR, value: this.text[this.current] });
                    break
                }
                case '/': {
                    if (this._peekNext() === '*' || this._peekNext() === '/') { 
                        this.start = this.current
                        this._parseComment() 
                    }   
                    else { this.tokens.push({ type: TOKEN_TYPE.OPERATOR, value: this.text[this.current] }); }
                    break
                }
                case '.': {
                    if (/\d/.test(this._peekNext())) { 
                        this.start = this.current
                        this._parseNumber()
                    }
                    else { this.tokens.push({ type: TOKEN_TYPE.OPERATOR, value: this.text[this.current] }); }
                    break
                }
                case '(':
                case ')':
                case '[':
                case ']':
                case '{':
                case '}': {
                    this.tokens.push({ type: TOKEN_TYPE.PARENTHESIS, value: this.text[this.current] });
                    break
                }
                case ' ':
                case '\r':
                case '\n':
                case '\t': { break }
                default: {
                    this.start = this.current
                    if (/['"`]/.test(this.text[this.current])) this._parseString()
                    else if (/\d/.test(this.text[this.current])) this._parseNumber()
                    else if (/[\w_]/.test(this.text[this.current])) this._parseWord()
                }
            }
            this._advance()
        }

        return this.tokens
    },
    _parseString() {
        this._advance()
        while (!this._atEnd() && !/['"`]/.test(this._peek())) this._advance()
        this.tokens.push({ type: TOKEN_TYPE.STRING, value: this.text.slice(this.start, this.current + 1) })
    },
    _parseWord() {
        while (!this._atEnd() && /[\w_]/.test(this._peek())) this._advance()
        let w = this.text.slice(this.start, this.current)
        if (w == 'function' && this._peek() == '*') w += this._peek()
        this.tokens.push({ type: this.keywords[w] ? TOKEN_TYPE.KEYWORD : TOKEN_TYPE.VARIABLE, value: w })
        this._goBack()
    },
    _parseNumber() {
        while (!this._atEnd() && /[\d\.]/.test(this._peek())) this._advance()
        this.tokens.push({ type: TOKEN_TYPE.NUMBER, value: this.text.slice(this.start, this.current) })
        this._goBack()
    },
    _parseComment() {
        this._advance()
        if (this._peek() == '/') {
            while (!this._atEnd() && !/\n/.test(this._peekNext())) { this._advance() }
        }
        else {
            while (!this._atEnd() && this._peek() !== '/') { this._advance() }
        }
        this.tokens.push({ type: TOKEN_TYPE.COMMENT, value: this.text.slice(this.start, this.current + 1) })
    },
    _atEnd() { return this.current >= this.text.length; },
    _peek() { return this.text[this.current] },
    _peekNext() { return this.text[this.current + 1] },
    _advance() { return this.text[this.current++] },
    _goBack() { return this.text[this.current--] },
}