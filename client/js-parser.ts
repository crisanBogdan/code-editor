import { IParser } from './iparser.js';
import { Token, TokenType } from './token.js';

export class JsParser implements IParser {
    static keywords = {
        while: true,
        let: true,
        await: true,
        yield: true,
        static: true,
        enum: true,
        implements: true,
        interface: true,
        package: true,
        private: true,
        protected: true,
        public: true,
        case: true,
        async: true,
        catch: true,
        class: true,
        const: true,
        continue: true,
        debugger: true,
        get: true,
        set: true,
        from: true,
        of: true,
        default: true,
        delete: true,
        do: true,
        else: true,
        export: true,
        extends: true,
        false: true,
        finally: true,
        for: true,
        function: true,
        'function*': true,
        if: true,
        import: true,
        in: true,
        instanceof: true,
        new: true,
        null: true,
        return: true,
        super: true,
        switch: true,
        this: true,
        throw: true,
        true: true,
        try: true,
        typeof: true,
        var: true,
        void: true,
        break: true,
    };

    private start = 0;
    private current = 0;
    private tokens: Token[] = [];
    private text = '';

    getTokens(text = ''): Token[] {
        this.start = 0;
        this.current = 0;
        this.tokens = [];
        this.text = text;

        while (!this.atEnd()) {
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
                    this.tokens.push({
                        type: TokenType.Operator,
                        value: this.text[this.current],
                    });
                    break;
                }
                case '/': {
                    if (this.peekNext() === '*' || this.peekNext() === '/') {
                        this.start = this.current;
                        this.parseComment();
                    } else {
                        this.tokens.push({
                            type: TokenType.Operator,
                            value: this.text[this.current],
                        });
                    }
                    break;
                }
                case '.': {
                    if (/\d/.test(this.peekNext())) {
                        this.start = this.current;
                        this.parseNumber();
                    } else {
                        this.tokens.push({
                            type: TokenType.Operator,
                            value: this.text[this.current],
                        });
                    }
                    break;
                }
                case '(':
                case ')':
                case '[':
                case ']':
                case '{':
                case '}': {
                    this.tokens.push({
                        type: TokenType.Parenthesis,
                        value: this.text[this.current],
                    });
                    break;
                }
                case ' ':
                case '\r':
                case '\n':
                case '\t': {
                    break;
                }
                case "'":
                case '"':
                case '`': {
                    this.start = this.current;
                    this.parseString();
                }
                default: {
                    this.start = this.current;
                    if (/\d/.test(this.text[this.current])) this.parseNumber();
                    else if (/[\w_]/.test(this.text[this.current]))
                        this.parseWord();
                }
            }
            this.advance();
        }

        return this.tokens;
    }

    private parseString() {
        this.advance();
        while (!this.atEnd() && !/['"`]/.test(this.peek())) this.advance();
        this.tokens.push({
            type: TokenType.String,
            value: this.text.slice(this.start, this.current + 1),
        });
    }

    private parseWord() {
        while (!this.atEnd() && /[\w_]/.test(this.peek())) this.advance();
        let w = this.text.slice(this.start, this.current);
        if (w == 'function' && this.peek() == '*') w += this.peek();
        this.tokens.push({
            type: JsParser.keywords[w as keyof typeof JsParser.keywords]
                ? TokenType.Keyword
                : TokenType.Variable,
            value: w,
        });
        this.goBack();
    }

    private parseNumber() {
        while (!this.atEnd() && /[\d\.]/.test(this.peek())) this.advance();
        this.tokens.push({
            type: TokenType.Number,
            value: this.text.slice(this.start, this.current),
        });
        this.goBack();
    }

    private parseComment() {
        this.advance();
        if (this.peek() == '/') {
            // '//' comment
            while (!this.atEnd() && !/\n/.test(this.peekNext())) {
                this.advance();
            }
        } else {
            // /* comment
            while (!this.atEnd() && this.peek() !== '/') {
                this.advance();
            }
        }
        this.tokens.push({
            type: TokenType.Comment,
            value: this.text.slice(this.start, this.current + 1),
        });
    }

    private atEnd() {
        return this.current >= this.text.length;
    }
    private peek() {
        return this.text[this.current];
    }
    private peekNext() {
        return this.text[this.current + 1];
    }
    private advance() {
        return this.text[this.current++];
    }
    private goBack() {
        return this.text[this.current--];
    }
}
