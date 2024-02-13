import { transformEditorContent } from './transform-editor-content.js';
import { JsParser } from './js-parser.js';
import { TokenType } from './token.js';
import { AppClientSocket } from './client-socket.js';
import { CodeTextChangeMessage, ChangeNameMessage, MessageHandler, MessageType } from '../message.js';
import { debounce } from '../utils.js';
import { handleSocketMessage } from './handle-socket-message.js';
import { CaretPosition } from './caret-position.js';

const editor = document.getElementById('editor');

if (!editor) {
    throw new Error("Missing element with id 'editor'");
}

const usernameInput = document.getElementById(
    'username'
) as HTMLInputElement | null;

if (!usernameInput) {
    throw new Error("Missing element with id 'username'");
} else {
    usernameInput.value = `Anon ${Math.random().toString().slice(2, 8)}`;
}

const ws = new AppClientSocket(
    'localhost:3000/ws?' +
        `username=${encodeURIComponent(usernameInput.value)}` +
        `&channel_id=${encodeURIComponent(window.location.pathname.slice(1))}`
);
const jsParser = new JsParser();
const caretPosition = new CaretPosition(editor, jsParser);

const cssClasses = {
    [TokenType.Keyword]: 'keyword',
    [TokenType.Variable]: 'variable',
    [TokenType.Operator]: 'operator',
    [TokenType.Parenthesis]: 'parenthesis',
    [TokenType.Number]: 'number',
    [TokenType.String]: 'string',
    [TokenType.Comment]: 'comment',
};

ws.onMessage((data) => {
    handleSocketMessage(
        data,
        (path: string) => {
            window.history.pushState('', '', String(path));
        },
        displayMessage,
        (text: string) => {
            caretPosition.save();
            editor.innerHTML = String(
                transformEditorContent(text, jsParser, cssClasses)
            );
            caretPosition.restore();
        }
    );
});

usernameInput.addEventListener('click', () => {
    usernameInput.select();
});

usernameInput.addEventListener('change', () => {
    updateUsernameDebounced(ws, usernameInput);
});

window.addEventListener('load', () => {
    editor.focus();
});

let previousText = '';
editor.addEventListener('keyup', (e) => {
    // if Space, Tab etc. was clicked
    if (e.key.length > 1 || e.key === ' ') return;
    if (editor.innerHTML === previousText) return;

    transformEditorContentDebounced((content) => {
        previousText = content;
        handleEditorContent(content, ws);
    });
});

const transformEditorContentDebounced = debounce(
    (onFinish: (newContent: string) => void) => {
        caretPosition.save();
        const newContent = transformEditorContent(
            editor.innerText,
            jsParser,
            cssClasses
        );
        editor.innerHTML = newContent;
        caretPosition.restore();
        onFinish(newContent);
    },
    500
);

const updateUsernameDebounced = debounce(
    (ws: AppClientSocket, usernameInput: HTMLInputElement) => {
        ws.send(MessageHandler.toJSON({
            type: MessageType.ChangeName,
            payload: usernameInput.value
        }))
    },
    500
);

function handleEditorContent(content: string, socket: AppClientSocket) {
    if (!content) return;
    socket.send(MessageHandler.toJSON({
        type: MessageType.CodeTextChange,
        payload: content
    }))
}

function displayMessage(text: string) {
    const dialog = document.getElementById(
        'message-display'
    ) as HTMLDialogElement;
    const textEl = document.getElementById('message-display-text');
    if (!dialog || !textEl) {
        throw new Error(
            `Missing el with id: 'message-display' or with id: 'message-display-text'.`
        );
    }
    if (!(dialog instanceof HTMLDialogElement)) {
        throw new Error('Not a dialog.');
    }
    textEl.textContent = text;
    dialog.showModal();
}
