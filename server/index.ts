import e, { Request } from 'express';
import { v4 as uuid, validate as validate_uuid } from 'uuid';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import expressWs from 'express-ws';
import { AppSocketConnection, IAppWebSocket } from './socket-connection.js';
import { ClientJoinMessage, ClientMessageType, Message, ServerMessageType } from '../message.js';
import { AppChannel, AppChannelEvents } from './channel.js';
import { WebSocket } from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = e();
expressWs(app)

// app.use(e.static('../..'))
app.use(e.static(join(__dirname, '../..')))

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../../index.html'))
})

const channels: AppChannel[] = [];

(app as any).ws('/ws', (ws: WebSocket, req: Request) => {
    handleWebSocket(ws, channels)
})

export function handleWebSocket(ws: IAppWebSocket, channels: AppChannel[]) {
    const connection = new AppSocketConnection(uuid(), '', ws)
    
    ws.on('message', (msg: string) => {
        const message = Message.fromJSON(msg)
        const { type, payload } = message
        switch (type) {
            case ClientMessageType.Join: {
                const { 
                    channelId,
                    username,
                } = (message as ClientJoinMessage).payload

                if (!channelId || !username) {
                    throw new Error('No channelId or username provided')
                }

                connection.username = username

                let channel = channels.find(c => c.id == channelId)
                if (channel) {
                    channel.addConnection(connection)
                }
                else {
                    channel = new AppChannel(
                        validate_uuid(String(channelId)) 
                            ? String(channelId)
                            : uuid()
                    )
                    channels.push(channel)
                    channel.on(AppChannelEvents.Empty, () => {
                        channels = channels.filter(c => c.id != channel!.id)
                    })
                    channel.addConnection(connection)
                }

                connection.send(new Message(
                    ServerMessageType.JoinedChannel, 
                    channel.id,
                ))
                break
            }
            default:
        }
    })
    ws.on('close', console.log)
    ws.on('error', console.error)
}

app.listen(3000, () => console.log('listening on 3000'))