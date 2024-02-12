import assert from 'node:assert';
import { Message } from '../message.js';
import { WebSocket } from 'ws';
import { AppChannel } from './channel.js';

type IAppWebSocketOn = {
    (ev: AppSocketConnectionEvents, cb: (...data: any[]) => void): void;
};

export interface IAppWebSocket {
    on: IAppWebSocketOn;
    send: (data: string) => void;
    close: (errorCode?: number, msg?: string) => void;
}

export type AppSocketConnectionEvents = 'message' | 'close' | 'error';

export class AppSocketConnection {
    channel?: AppChannel;

    constructor(
        public id: string,
        public username: string,
        public ip: string,
        private wsInterface: IAppWebSocket
    ) {
        assert.ok(id.length > 0);
        assert.ok(username.length > 0);
        assert.ok(ip.length > 0);
    }

    on(ev: AppSocketConnectionEvents, cb: IAppWebSocketOn) {
        this.wsInterface.on(ev, cb);
    }

    send(msg: Message<any>) {
        this.wsInterface.send(msg.toJSON());
    }

    close(msg?: string) {
        this.wsInterface.close(undefined, msg);
    }
}
