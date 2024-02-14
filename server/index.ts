import e, { Request } from 'express';
import WebSocket from 'ws';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import expressWs from 'express-ws';
import toobusy from 'toobusy-js';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { config } from './config.js';
import { handleWebSocket } from './handle-websocket.js';
import { logger } from './logger.js';
import { exit } from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = e();
expressWs(app);

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(function (req, res, next) {
    if (toobusy()) {
        res.status(503).send('Server too busy');
    } else {
        next();
    }
});
app.use(function (req, res, next) {
    res.setHeader('Content-Security-Policy', "default-src 'self'; ");
    next();
});
app.use(e.static(join(__dirname, '../..')));

app.get('/:id', rateLimit({ limit: 10 }), (req, res) => {
    res.sendFile(join(__dirname, '../../index.html'));
});

(app as any).ws(config.path.ws, (ws: WebSocket, req: Request) => {
    handleWebSocket({
        ws,
        config,
        logger,
        ip: req.ip,
        username: String(req.query.username),
        requestedChannelId: String(req.query.channel_id),
    });
});

let port = 3000;
const portArgIndex = process.argv.findIndex((x) => x == '-p');
if (portArgIndex !== -1) {
    const portArg = Number(process.argv[portArgIndex + 1]);
    if (!Number.isInteger(portArg)) {
        console.error('Specified port is not a valid number.');
        exit(1);
    }
    port = portArg;
}

app.listen(port, () => console.log(`listening on ${port}`));
