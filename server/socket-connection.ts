import assert from 'node:assert'
import { Message } from '../message.js'

type IAppWebSocketOn = {
    (ev: AppSocketConnectionEvents, cb: (...data: any[]) => void): void;
}

export interface IAppWebSocket {
    on: IAppWebSocketOn;
    send: (data: string) => void;
}

export type AppSocketConnectionEvents = 'message' | 'close' | 'error'

export class AppSocketConnection {
    id = ''
    username = ''
    #wsInterface: IAppWebSocket

    constructor(id: string, username: string, wsInterface: IAppWebSocket) {
        assert.ok(id.length > 0)
        
        this.id = id
        this.username = username
        this.#wsInterface = wsInterface
    }

    on(ev: AppSocketConnectionEvents, cb: IAppWebSocketOn) {

        this.#wsInterface.on(ev, cb)
    }

    send(msg: Message<any>) {
        this.#wsInterface.send(msg.toJSON())
    }
}