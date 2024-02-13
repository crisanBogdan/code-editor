import { IParser } from './iparser.js';
import { stripHtmlTags } from './strip-html-tags.js';
import { TokenType } from './token.js';

export function transformEditorContent(
    text: string,
    parser: IParser,
    cssClasses: Record<TokenType, string>
): string {
    text = stripHtmlTags(text);
    const tokens = parser.getTokens(text);

    const used = new Set();
    const spanOpenTag = '<span',
        spanClosedTag = '</span>';

    for (const t of tokens) {
        const { value, type } = t;

        if (used.has(value)) {
            continue;
        }

        used.add(value);
        let i = 0;

        while (i < text.length) {
            // replace value with a span
            if (text[i] === value[0]) {
                if (text.slice(i, i + value.length) === value) {
                    const replacement = `<span class="${cssClasses[type]}">${value}</span>`;
                    const newText =
                        text.slice(0, i) +
                        replacement +
                        text.slice(i + value.length);
                    text = newText;
                    i += replacement.length;
                } else {
                    i++;
                }
            }
            // if encountered a span go past it
            else if (text[i] === '<') {
                if (text.slice(i, i + spanOpenTag.length) === spanOpenTag) {
                    i += spanOpenTag.length;
                    while (i < text.length) {
                        if (
                            text[i] === '<' &&
                            text.slice(i, i + spanClosedTag.length) ===
                                spanClosedTag
                        ) {
                            i += spanClosedTag.length;
                            break;
                        }
                        i++;
                    }
                }
            } else {
                i++;
            }
        }
    }

    text = text.replaceAll('\n', '<br>');

    return text;
}
