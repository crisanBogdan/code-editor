export enum TokenType {
    Keyword      = 0,
    Variable     = 1,
    Operator     = 2,
    Parenthesis  = 3,
    Comment      = 4,
    Number       = 5,
    String       = 6,
}

export interface Token {
    type: TokenType;
    value: string;
}