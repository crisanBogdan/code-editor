import { v4 as uuid, validate as validate_uuid } from 'uuid';
import { AppChannel, AppChannelEvents } from './channel.js';
import { AppConfig } from './config.js';
import { ILogger } from './logger.js';
import { AppSocketConnection, IAppWebSocket } from './socket-connection.js';

let channels: AppChannel[] = [];
// limit ws connections
const wsConnectionsByIp = new Map<string, number>();

export function handleWebSocket({
    ws,
    config,
    logger,
    ip,
    username,
    requestedChannelId,
}: {
    ws: IAppWebSocket;
    config: AppConfig;
    logger: ILogger;
    ip?: string;
    username?: string;
    requestedChannelId?: string;
}): AppSocketConnection | null {
    if (!ip) {
        ws.close();
        return null;
    }

    const connectionsByIp = wsConnectionsByIp.get(ip) ?? 0;
    if (connectionsByIp > config.maxWsConnectionsPerIp) {
        logger.error(`${ip} websocket connection limit reached.`);
        ws.close(undefined, 'Maximum connection limit reached');
        return null;
    } else {
        wsConnectionsByIp.set(ip, connectionsByIp + 1);
    }

    if (!username) {
        logger.error(`${ip} no username provided.`);
        ws.close(undefined, 'No username provided');
        return null;
    }

    const connection = new AppSocketConnection(uuid(), username, ip, ws);

    let channel = channels.find((c) => c.id == requestedChannelId);
    if (channel) {
        channel.addConnection(connection);
    } else {
        channel = new AppChannel(
            validate_uuid(String(requestedChannelId))
                ? String(requestedChannelId)
                : uuid(),
            config,
            logger
        );
        channels.push(channel);
        channel.on(AppChannelEvents.Empty, () => {
            channels = channels.filter((c) => c.id != channel!.id);
        });
        channel.addConnection(connection);
    }

    ws.on('close', () => {
        wsConnectionsByIp.set(ip, wsConnectionsByIp.get(ip) ?? 0 - 1);
    });
    ws.on('error', (e) => {
        logger.error(`${ip} general ws error: ${e}`);
    });

    return connection;
}
