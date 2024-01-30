import { transformEditorContent } from './transform-editor-content.js';
import { jsParser } from './js-parser.js';
import { TOKEN_TYPE } from './token-type.js';
import { AppClientSocket } from './client-socket.js';

const colors = {
    [TOKEN_TYPE.KEYWORD]: 'red',
    [TOKEN_TYPE.VARIABLE]: 'white',
    [TOKEN_TYPE.OPERATOR]: 'blue',
    [TOKEN_TYPE.PARENTHESIS]: 'yellow',
    [TOKEN_TYPE.NUMBER]: 'purple',
    [TOKEN_TYPE.STRING]: 'orange',
    [TOKEN_TYPE.COMMENT]: 'green',
}

const editor = document.getElementById('editor')
const range = document.createRange()
const ws = new AppClientSocket('localhost:3000/ws')

ws.onMessage(data => {
    console.log(data)
})

document.addEventListener('load', () => {
    editor.focus()

    ws.send()
})

editor.addEventListener('keyup', e => {
    if (e.key.startsWith('Arrow') || e.altKey === 'Control' || e.altKey === 'Alt') {
        return
    }

    e.target.innerHTML = transformEditorContentDebounced(e.target.innerText, jsParser, colors)
    setCaretToEnd()
})

const transformEditorContentDebounced = debounce(transformEditorContent, 500)

function debounce(f, time) {
    let timeoutId;
    return function(...args) {
        window.clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => f(...args), time)
    }
}

function setCaretToEnd() {
    range.setStart(editor, editor.childNodes.length)
    range.collapse(true)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
}