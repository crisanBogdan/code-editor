import { Token } from './token.js';

export interface IParser {
    getTokens(text: string): Token[];
}
