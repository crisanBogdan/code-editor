import e from 'express';
import { v4 as uuid, validate as validate_uuid } from 'uuid';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import expressWs from 'express-ws';
import { AppSocketConnection } from './socket-connection';
import { MESSAGE_TYPE, createMessage } from '../message';
import { AppChannel } from './channel';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = e();
expressWs(app)

app.use(e.static(join(__dirname, '../client')))

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/index.html'))
})

const channels = []

app.ws('/ws', (ws, req) => {
    handleWebSocket(ws)
})

export function handleWebSocket(ws) {
    const connection = new AppSocketConnection(uuid(), '', ws)
    
    ws.on('message', msg => {
        const { type, payload } = AppSocketConnection.parseMessage(msg)
        switch (type) {
            case MESSAGE_TYPE.CLIENT.JOIN: {
                let channel = channels.find(c => c.id == payload)
                if (channel) {
                    channel.addConnection(connection)
                }
                else {
                    channel = new AppChannel(
                        validate_uuid(payload) ? payload : uuid()
                    )
                    channels.push(channel)
                    channel.on('empty', () => {
                        channels = channels.filter(c => c.id != channel.id)
                    })
                    channel.addConnection(connection)
                }
                connection.send(createMessage(
                    MESSAGE_TYPE.SERVER.JOINED_CHANNEL, 
                    channel.id,
                ))
                break
            }
        }
    })
    ws.on('close', console.log)
    ws.on('error', console.error)
}

app.listen(3000, () => console.log('listening on 3000'))