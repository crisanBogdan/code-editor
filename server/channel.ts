import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import { ChangeNameMessage, CodeTextChangeMessage, JoinedMessage, Message, MessageType, UserChangedNameMessage, UserDisconnectedMessage, UserJoinedMessage } from '../message.js';
import {
    AppSocketConnection,
} from './socket-connection.js';
import { AppConfig } from './config.js';
import { ILogger } from './logger.js';
import { config } from 'node:process';

export enum AppChannelEvents {
    Empty = 'empty',
}

export class AppChannel {
    private connections: AppSocketConnection[] = [];
    private eventEmitter = new EventEmitter();
    // map<ip, string>
    private previousMsg: Map<string, string> = new Map()
    private sameMsgCount: Map<string, number> = new Map()

    private lastTextChange: string = '';    

    get numberOfConnections() {
        return this.connections.length;
    }

    constructor(
        public id: string,
        private config: AppConfig,
        private logger: ILogger,
    ) {
        assert.ok(id.length > 0);
    }

    addConnection(connection: AppSocketConnection) {
        const existing_connection = this.connections.find(
            (c) => c.id === connection.id
        );

        if (existing_connection) {
            this.logger.error(
                connection.ip +
                'tried to access a connection with an already existing username'
            );
        }

        this.connections.forEach((c) =>
            c.send(
                new UserJoinedMessage(connection.username) 
            )
        );
        this.connections.push(connection);
        connection.channel = this

        connection.on('message', data => this.handleMessage(connection, data));
        connection.on('close', () => {
            this.removeConnection(connection.id);
        });

        connection.send(
            new JoinedMessage({ channelId: this.id, text: this.lastTextChange })
        );
    }

    removeConnection(id: string) {
        const connection = this.connections.find((c) => c.id === id);

        if (!connection) {
            console.warn('No connection with id ' + id + ' was found.');
            return;
        }

        this.connections = this.connections.filter((c) => c.id !== id);
        this.connections.forEach((c) =>
            c.send(
                new UserDisconnectedMessage(connection.username)
            )
        );

        if (this.connections.length === 0) {
            this.eventEmitter.emit(AppChannelEvents.Empty);
        }
    }

    on(...args: Parameters<typeof EventEmitter.prototype.on>) {
        this.eventEmitter.on(...args);
    }

    private handleMessage = (connection: AppSocketConnection, data: string) => {
        const { ip } = connection

        if (data.length > this.config.maxWsMessageLength) {
            this.logger.error(
                `${ip} sent message with longer than allowed length: ${data.length}`
            )
            connection.close()
            return
        }
        if (data === this.previousMsg.get(ip)) {
            this.sameMsgCount.set(ip, this.sameMsgCount.get(ip) ?? 0 + 1)
        }
        else {
            this.sameMsgCount.set(ip, 0)
        }
        if (this.sameMsgCount.get(ip) === this.config.maxSameMsgAllowed) {
            this.logger.error(
                `${ip} sent the same message ${this.config.maxSameMsgAllowed} times in a row: ${data.slice(0,this.config.maxWsMessageLength)}` 
            )

            connection.close()
            return
        }
    
        let message: Message<unknown>
        try {
            message = Message.fromJSON(data);
        }
        catch(e) {
            // close if user tried sending something that wasn't json
            this.logger.error(`${ip} has sent message that wasn't JSON.`) 
            connection.close()
            return
        }

        const otherConnections = this.connections.filter(
            (c) => c.id !== connection.id
        );
        const { type } = message
        switch (type) {
            case MessageType.ChangeName: {
                const payload = (message as ChangeNameMessage).payload
                otherConnections.forEach((c) => {
                    c.send(new UserChangedNameMessage({
                        from: connection.username,
                        to: payload 
                    }))
                });
                connection.username = payload 
                break;
            }
            case MessageType.CodeTextChange: {
                const payload = (message as CodeTextChangeMessage).payload
                this.lastTextChange = payload
                otherConnections.forEach((c) =>
                    c.send(new CodeTextChangeMessage(payload))
                );
                break;
            }
            default: {
                this.logger.log(
                    `Unknown message type: ${type} with payload: ` + 
                    message.payload + ` from ${ip}`
                );
                break;
            }
        }
    }
}
