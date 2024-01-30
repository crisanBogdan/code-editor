export class AppClientSocket {
    #socket;

    constructor(url, prefix = 'ws://') {
        this.#socket = new WebSocket(`${prefix}${url}`)
        this.#socket.onerror = function(e) {
            throw Error(e)
        }
        this.#socket.onclose = console.log
        this.#socket.onopen = console.log
    }

    async send(text) {
        if (!(typeof text == 'string')) { 
            throw Error('Only strings can be sent.') 
        }
        if (this.#socket.readyState == WebSocket.OPEN) {
            this.#socket.send(text)
        }
        else return new Promise((res) => {
            this.#socket.onopen = function() {
                this.send(text)
                res()
            }
        })
    }

    onMessage(cb) {
        this.#socket.onmessage = function(e) {
            cb(e.data)
        }
    }

    close() { this.#socket.close() }
}
