import assert from 'node:assert'
import { describe, it, mock } from 'node:test'
import EventEmitter from 'node:events';
import { AppChannel, AppChannelEvents } from '../channel.js';
import { 
    AppSocketConnection,
} from '../socket-connection.js';
import {
    ChangeNameMessage,
    CodeTextChangeMessage,
    JoinedMessage,
    Message,
    UserChangedNameMessage,
    UserDisconnectedMessage,
    UserJoinedMessage
} from '../../message.js';
import { noop } from '../../utils.js';
import { config } from '../config.js';
import { logger } from '../logger.js';

describe('AppChannel', () => {
    const emitter = new EventEmitter()
    const ip = '127.0.0.1'

    it('should fail if a new connection has the same username' 
        + ' as an existing connection', () => {
        const channel = new AppChannel('test', config, logger)
        const ws = { on: noop, send: noop, close: noop }
        const connection1 = new AppSocketConnection('1', 'test', ip, ws)
        const connection2 = new AppSocketConnection('2', 'test', ip, ws)
        channel.addConnection(connection1)
        // assert.throws(() => channel.addConnection(connection2), Error)
    })

    it('should send a message to all connections when someone new joins',() => {
        const channel = new AppChannel('test', config, logger)
        const ws = { on: mock.fn(), send: mock.fn(), close: noop }
        const connection1 = new AppSocketConnection('1', 'test1', ip, ws)
        const connection2 = new AppSocketConnection('2', 'test2', ip, ws)
        channel.addConnection(connection1)
        channel.addConnection(connection2)

        const expectedMessage = new UserJoinedMessage(connection2.username)
        assert.ok(ws.send.mock.calls
            .flatMap(x => x.arguments)
            .map(Message.fromJSON)
            .find(x => x.equals(expectedMessage)))
    })

    it('should send the last message to the newly joined user', () => {
        const channelId = 'test'
        const channel = new AppChannel(channelId, config, logger)
        const send = mock.fn() 

        const connection1 = new AppSocketConnection('1', 'test1', ip, 
            { on: emitter.on.bind(emitter), send, close: noop }
        )
        const connection2 = new AppSocketConnection('2', 'test2', ip, 
            { on: noop, send, close: noop }
        )

        channel.addConnection(connection1)
        
        const text = 'test msg'
        emitter.emit('message', new CodeTextChangeMessage(text).toJSON())

        channel.addConnection(connection2)

        const expected = new JoinedMessage({ channelId, text })
        assert.ok(send.mock.calls
            .flatMap(x => x.arguments)
            .map(Message.fromJSON)
            .find(x => x.equals(expected)))
    })

    it('should send the message to all other connections when someone writes'
        + ' a message', () => {
        const channel = new AppChannel('test', config, logger)
        const send = mock.fn() 

        const connection1 = new AppSocketConnection('1', 'test1', ip, 
            { on: noop, send, close: noop }
        )
        const connection2 = new AppSocketConnection('2', 'test2', ip, 
            { on: emitter.on.bind(emitter), send, close: noop }
        )
        const connection3 = new AppSocketConnection('3', 'test3', ip, 
            { on: noop, send, close: noop }
        )

        channel.addConnection(connection1)
        channel.addConnection(connection2)
        channel.addConnection(connection3)
        
        emitter.emit('message', new CodeTextChangeMessage(
            'test msg',
        ).toJSON())
        const expected = new CodeTextChangeMessage('test msg')

        assert.ok(send.mock.calls
            .flatMap(x => x.arguments)
            .map(Message.fromJSON)
            .find(x => x.equals(expected)))
    })

    it('should send a message to all connections when someone changes'
        + ' their username', () => {
        const channel = new AppChannel('test', config, logger)
        const send = mock.fn() 

        const connection1 = new AppSocketConnection('1', 'test1', ip, 
            { on: noop, send, close: noop }
        )
        const connection2 = new AppSocketConnection('2', 'test2', ip, 
            { on: emitter.on.bind(emitter), send, close: noop }
        )
        
        channel.addConnection(connection1)
        channel.addConnection(connection2)

        emitter.emit('message', new ChangeNameMessage('testX').toJSON())
        const expected = new UserChangedNameMessage(
            { from: 'test2', to: 'testX' }
        )

        console.dir(send.mock.calls.flatMap(x => x.arguments))
        assert.ok(send.mock.calls
            .flatMap(x => x.arguments)
            .map(Message.fromJSON)
            .find(x => x.equals(expected)))
    })


    it('should send a message to all connections when someone disconnects',
        () => {
            const channel = new AppChannel('test', config, logger)
            const send = mock.fn() 

            const connection1 = new AppSocketConnection('1', 'test1', ip, 
                { on: noop, send, close: noop }
            )
            const connection2 = new AppSocketConnection('2', 'test2', ip, 
                { on: emitter.on.bind(emitter), send, close: noop }
            )
            
            channel.addConnection(connection1)
            channel.addConnection(connection2)

            emitter.emit('close')

            const expected = new UserDisconnectedMessage(
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
            const channel = new AppChannel('test', config, logger)
            const cb = mock.fn() 
            const connection1 = new AppSocketConnection('1', 'test1', ip, 
                { on: noop, send: noop, close: noop }
            )
            channel.on(AppChannelEvents.Empty, cb)
            channel.addConnection(connection1)
            channel.removeConnection(connection1.id)

            assert.equal(cb.mock.calls.length, 1)
        }
    )
    
    it('should close a connection if the message length is above limit', () => {

    })

    it('should close a connection if the same message is sent more than the allowed limit', () => {
    })
})