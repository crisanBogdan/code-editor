import assert from 'node:assert'
import { describe, it, mock } from 'node:test'
import { AppChannel } from '../channel.js';
import { AppSocketConnection } from '../socket-connection.js';
import { MESSAGE_TYPE, createMessage } from '../../message.js';
import EventEmitter from 'node:events';

describe('AppChannel', () => {
    it('should fail if a new connection has the same username' 
        + ' as an existing connection', () => {
        const channel = new AppChannel('test')
        const ws = { on: () => {}, send: () => {} }
        const connection1 = new AppSocketConnection('1', 'test', ws)
        const connection2 = new AppSocketConnection('2', 'test', ws)
        channel.addConnection(connection1)
        // assert.throws(() => channel.addConnection(connection2), Error)
    })

    it('should send a message to all connections when someone new joins',() => {
        const channel = new AppChannel('test')
        const ws = { on: mock.fn(), send: mock.fn() }
        const connection1 = new AppSocketConnection('1', 'test1', ws)
        const connection2 = new AppSocketConnection('2', 'test2', ws)
        channel.addConnection(connection1)
        channel.addConnection(connection2)

        const expectedMessage = JSON.stringify(createMessage(
            MESSAGE_TYPE.SERVER.USER_JOINED,
            connection2.username,
        ))
        
        assert.ok(ws.send.mock.calls[0].arguments
            .includes(expectedMessage))
    })

    it('should send the message to all other connections when someone writes'
        + ' a message', () => {
        const channel = new AppChannel('test')
        const on = new EventEmitter()
        const send = mock.fn() 
        const connection1 = new AppSocketConnection('1', 'test1', 
            { on, send }
        )
        const connection2 = new AppSocketConnection('2', 'test2', 
            { on, send }
        )
        channel.addConnection(connection1)
        channel.addConnection(connection2)
        
        on.emit('message', createMessage(
            MESSAGE_TYPE.SERVER.USER_MESSAGE,
            'test msg',
        ))
        const expected = createMessage(
            MESSAGE_TYPE.SERVER.USER_MESSAGE,
            { message: 'test msg', username: connection2.username }
        )
        
        assert.ok(ws.send.mock.calls[0].arguments
            .includes(JSON.stringify(expected)))
    })

    it('should send a message to all connections when someone changes' +
        + ' their username', () => {

    })


    it('should send a message to all connections when someone disconnects',
        () => {

        }
    )

    it('should emit an empty event when there aren\'t any connections left',
        () => {
            
        }
    )

})