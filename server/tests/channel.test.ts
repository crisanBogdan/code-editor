import assert from 'node:assert'
import { describe, it, mock } from 'node:test'
import EventEmitter from 'node:events';
import { AppChannel, AppChannelEvents } from '../channel.js';
import { 
    AppSocketConnection,
    AppSocketConnectionEvents
} from '../socket-connection.js';
import {
    ClientMessageType,
    Message,
    ServerMessageType
} from '../../message.js';

describe('AppChannel', () => {
    const noop = () => {}
    const emitter = new EventEmitter()

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

        const expectedMessage = new Message(
            ServerMessageType.UserJoined,
            connection2.username,
        )
        
        assert.ok(ws.send.mock.calls[0].arguments.includes(
            expectedMessage.toJSON()))
    })

    it('should send the message to all other connections when someone writes'
        + ' a message', () => {
        const channel = new AppChannel('test')
        const send = mock.fn() 

        const connection1 = new AppSocketConnection('1', 'test1', 
            { on: noop, send }
        )
        const connection2 = new AppSocketConnection('2', 'test2', 
            { on: emitter.on.bind(emitter), send }
        )
        const connection3 = new AppSocketConnection('3', 'test3', 
            { on: noop, send }
        )

        channel.addConnection(connection1)
        channel.addConnection(connection2)
        channel.addConnection(connection3)
        
        emitter.emit('message', new Message(
            ClientMessageType.CodeText,
            'test msg',
        ).toJSON())
        const expected = new Message(
            ServerMessageType.UserCodeText,
            { message: 'test msg', username: connection2.username }
        )

        assert.ok(send.mock.calls
            .flatMap(x => x.arguments)
            .map(Message.fromJSON)
            .find(x => x.equals(expected)))
    })

    it('should send a message to all connections when someone changes'
        + ' their username', () => {
        const channel = new AppChannel('test')
        const send = mock.fn() 

        const connection1 = new AppSocketConnection('1', 'test1', 
            { on: noop, send }
        )
        const connection2 = new AppSocketConnection('2', 'test2', 
            { on: emitter.on.bind(emitter), send }
        )
        
        channel.addConnection(connection1)
        channel.addConnection(connection2)

        emitter.emit('message', new Message(
            ClientMessageType.SetUsername,
            'testX',
        ).toJSON())
        const expected = new Message(
            ServerMessageType.UserChangedName,
            { from: 'test2', to: 'testX' }
        )

        assert.ok(send.mock.calls
            .flatMap(x => x.arguments)
            .map(Message.fromJSON)
            .find(x => x.equals(expected)))
    })


    it('should send a message to all connections when someone disconnects',
        () => {
            const channel = new AppChannel('test')
            const send = mock.fn() 

            const connection1 = new AppSocketConnection('1', 'test1', 
                { on: noop, send }
            )
            const connection2 = new AppSocketConnection('2', 'test2', 
                { on: emitter.on.bind(emitter), send }
            )
            
            channel.addConnection(connection1)
            channel.addConnection(connection2)

            emitter.emit('close')

            const expected = new Message(
                ServerMessageType.UserDisconnected,
                'test2'
            )

            assert.ok(send.mock.calls
                .flatMap(x => x.arguments)
                .map(Message.fromJSON)
                .find(x => x.equals(expected)))
        }
    )

    it('should emit an empty event when there aren\'t any connections left',
        () => {
            const channel = new AppChannel('test')
            const cb = mock.fn() 
            const connection1 = new AppSocketConnection('1', 'test1', 
                { on: noop, send: noop }
            )
            channel.on(AppChannelEvents.Empty, cb)
            channel.addConnection(connection1)
            channel.removeConnection(connection1.id)

            assert.equal(cb.mock.calls.length, 1)
        }
    )

})