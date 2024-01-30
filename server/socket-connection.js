import assert from 'node:assert'

export class AppSocketConnection {
    id = ''
    username = ''
    #wsInterface = {}

    constructor(id, username, wsInterface) {
        assert.equal(typeof id, 'string')
        assert.ok(id.length > 0)
        
        assert.equal(typeof username, 'string')

        assert.ok(wsInterface.send)
        assert.equal(typeof wsInterface.send, 'function')
        assert.ok(wsInterface.on)
        assert.equal(typeof wsInterface.on, 'function')

        this.id = id
        this.username = username
        this.#wsInterface = wsInterface
    }

    on(ev, cb) {
        assert.equal(typeof ev, 'string')
        assert.equal(typeof cb, 'function')

        assert.ok(ev.length > 0)

        this.#wsInterface.on(ev, cb)
    }

    send(msg) {
        this.#wsInterface.send(JSON.stringify(msg))
    }
}