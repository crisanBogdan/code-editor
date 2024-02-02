import { transformEditorContent } from './transform-editor-content.js';
import { JsParser } from './js-parser.js';
import { TokenType } from './token.js';
import { AppClientSocket } from './client-socket.js';
import { ClientJoinMessage, ClientMessageType, Message } from '../message.js';

const editor = document.getElementById('editor')

if (!editor) {
    throw new Error('Missing element with id \'editor\'');
}

const usernameInput = 
    document.getElementById('username') as HTMLInputElement | null

if (!usernameInput) {
    throw new Error('Missing element with id \'username\'');
}

const changeUsernameBtn = document.getElementById('change-username')
const range = document.createRange()

const ws = new AppClientSocket('localhost:3000/ws')
const jsParser = new JsParser()

const colors = {
    [TokenType.Keyword]: 'red',
    [TokenType.Variable]: 'white',
    [TokenType.Operator]: 'blue',
    [TokenType.Parenthesis]: 'yellow',
    [TokenType.Number]: 'purple',
    [TokenType.String]: 'orange',
    [TokenType.Comment]: 'green',
}

if (usernameInput) {
    usernameInput.value = `Anon ${Math.random().toString().slice(2,8)}`
}

ws.onMessage(data => {
    console.log(data)
})

usernameInput?.addEventListener('click', () => {
    usernameInput?.select()
})

changeUsernameBtn?.addEventListener('click', e => {
    e.preventDefault()
    ws.send(new Message(
        ClientMessageType.SetUsername, 
        usernameInput?.value
    ).toJSON())
})

document.addEventListener('load', () => {
    editor.focus()
    debugger
    ws.send(new ClientJoinMessage({
        username: usernameInput.value,
        channelId: window.location.pathname.slice(1),
    }).toJSON())
})

editor.addEventListener('keyup', e => {
    if (e.key.startsWith('Arrow') || e.altKey) {
        return
    }

    transformEditorContentDebounced()
})

const transformEditorContentDebounced = debounce(
    () => {
        editor.innerHTML = transformEditorContent(
            editor.innerText,
            jsParser,
            colors,
        )
        setCaretToEnd()
    }, 
    500)

function debounce(f: (...args: any[]) => void, time: number) {
    let timeoutId: number;
    return function(...args: any[]) {
        window.clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => f(...args), time)
    }
}

function setCaretToEnd() {
    range.setStart(editor!, editor!.childNodes.length)
    range.collapse(true)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
}