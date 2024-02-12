export enum TokenType {
    Keyword,
    Variable,
    Operator,
    Parenthesis,
    Comment,
    Number,
    String,
}

export interface Token {
    type: TokenType;
    value: string;
}
