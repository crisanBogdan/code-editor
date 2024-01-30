import assert from 'node:assert'
import { EventEmitter } from 'node:events'
import { MESSAGE_TYPE, parseMessage, createMessage } from '../message.js'
import { AppSocketConnection } from './socket-connection.js'

export class AppChannel {
    id = ''
    #connections = []
    #eventEmitter = new EventEmitter()

    constructor(id) {
        assert.ok(id)
        assert.equal(typeof id, 'string')
        this.id = id
    }

    addConnection(connection) {
        assert.ok(connection instanceof AppSocketConnection)

        const existing_connection = this.#connections
            .find(c => c.id === connection.id)

        if (existing_connection) {
            throw Error('A user with this username already exists '
                + 'in this channel.')
        }

        this.#connections.forEach(c => c.send(createMessage( 
            MESSAGE_TYPE.SERVER.USER_JOINED,
            connection.username,
        )))
        this.#connections.push(connection)

        const _this = this

        connection.on('message', data => {
            const { type, payload } = parseMessage(data)
            const otherConnections = _this.#connections
                .filter(c => c.id !== connection.id)

            switch (type) {
                case MESSAGE_TYPE.CLIENT.SET_USERNAME: {
                    connection.username = payload
                    otherConnections.forEach(c => c.send(createMessage(
                        MESSAGE_TYPE.SERVER.USER_CHANGED_NAME,
                        payload
                    )))
                    break
                }
                case MESSAGE_TYPE.CLIENT.MESSAGE: {
                    otherConnections.forEach(c => c.send(createMessage(
                        MESSAGE_TYPE.SERVER.USER_MESSAGE,
                        { username: connection.username, message: payload }
                    )))
                    break
                }
            }
        })

        connection.on('close', () => {
            this.removeConnection(connection.id)
        })
    }

    removeConnection(id) {
        const connection = this.#connections.find(c => c.id === id)

        if (!connection) {
            console.warn('No connection with id ' + id + ' was found.')
            return
        }
        
        this.connections = this.#connections.filter(c => c.id !== id)
        this.#connections.forEach(c => c.callback({ 
            type: MESSAGE_TYPE.SERVER.USER_DISCONNECTED, 
            data: connection.username,
        }))

        if (this.#connections.length === 0) {
            this.#eventEmitter.emit('empty')
        }
    }

    on = this.#eventEmitter.on
}