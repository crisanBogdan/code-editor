import assert from 'node:assert'
import { EventEmitter } from 'node:events'
import { ClientMessageType, Message, ServerMessageType } from '../message.js'
import { 
    AppSocketConnection,
    AppSocketConnectionEvents
} from './socket-connection.js'

export enum AppChannelEvents {
    Empty = 'empty',
}

export class AppChannel {
    id = ''
    #connections: AppSocketConnection[] = []
    #eventEmitter = new EventEmitter()

    get numberOfConnections() {
        return this.#connections.length
    }

    constructor(id: string) {
        assert.ok(id.length > 0)
        this.id = id
    }

    addConnection(connection: AppSocketConnection) {
        const existing_connection = this.#connections
            .find(c => c.id === connection.id)

        if (existing_connection) {
            throw Error('A user with this username already exists '
                + 'in this channel.')
        }

        this.#connections.forEach(c => c.send(new Message( 
            ServerMessageType.UserJoined,
            connection.username,
        )))
        this.#connections.push(connection)

        const _this = this

        connection.on('message', data => {
            const { type, payload } = Message.fromJSON(data)
            const otherConnections = _this.#connections
                .filter(c => c.id !== connection.id)

            switch (type) {
                case ClientMessageType.SetUsername: {
                    const p = {
                        from: connection.username,
                        to: payload as string
                    }
                    connection.username = payload as string
                    otherConnections.forEach(c => c.send(
                        new Message(ServerMessageType.UserChangedName, p)
                    ))
                    break
                }
                case ClientMessageType.CodeText: { 
                    otherConnections.forEach(c => c.send(
                        new Message(
                            ServerMessageType.UserCodeText,
                            { username: connection.username, message: payload }
                        )
                    ))
                    break
                }
                default: {
                    console.log(`Unknown message type: ${type} with payload: `
                     + payload)
                    break
                }
            }
        })

        connection.on('close', () => {
            this.removeConnection(connection.id)
        })
    }

    removeConnection(id: string) {
        const connection = this.#connections.find(c => c.id === id)

        if (!connection) {
            console.warn('No connection with id ' + id + ' was found.')
            return
        }
        
        this.#connections = this.#connections.filter(c => c.id !== id)
        this.#connections.forEach(c => c.send(new Message( 
            ServerMessageType.UserDisconnected, 
            connection.username,
        )))
        
        if (this.#connections.length === 0) {
            this.#eventEmitter.emit(AppChannelEvents.Empty)
        }
    }

    on(...args: Parameters<typeof EventEmitter.prototype.on>) {
        this.#eventEmitter.on(...args)
    }
}