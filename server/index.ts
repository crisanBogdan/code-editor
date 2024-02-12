import e, { Request } from 'express';
import WebSocket from 'ws';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import expressWs from 'express-ws';
import toobusy from 'toobusy-js'
import rateLimit from 'express-rate-limit'
import cors from 'cors';
import { config } from './config.js';
import { handleWebSocket } from './handle-websocket.js';
import { logger } from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = e();
expressWs(app);

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(function (req, res, next) {
    if (toobusy()) {
        res.status(503).send('Server too busy')
    }
    else {
        next()
    }
})
app.use(function(req, res, next) {
    res.setHeader('Content-Security-Policy', "default-src 'self'; ")
    next()
})
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
})

app.listen(3000, () => console.log('listening on 3000'));