import { strictEqual } from 'node:assert'
import { describe, it, mock } from 'node:test'
import { AppSocketConnection } from '../socket-connection.js'

describe('AppSocketConnection', () => {
    it('should send JSON to wsInterface', () => {
        const send = mock.fn()
        const con = new AppSocketConnection(
            '1', 
            'asd',
            { on: () => {}, send }
        )

        const o = { a: ['asd'] }

        con.send(o)
        strictEqual(send.mock.calls[0].arguments[0], JSON.stringify(o))

        con.send(1)
        strictEqual(send.mock.calls[1].arguments[0], '1')

        
        con.send('a')
        strictEqual(send.mock.calls[2].arguments[0], '"a"')

        con.send([])
        strictEqual(send.mock.calls[3].arguments[0], '[]')
    })
})