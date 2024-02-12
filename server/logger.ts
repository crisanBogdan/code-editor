import { createWriteStream } from 'fs';

const output = createWriteStream('./stdout.log', { flags: 'a' });
const errorOutput = createWriteStream('./stderr.log', { flags: 'a' });

export interface ILogger {
    log(msg: string): void;
    error(msg: string): void;
}

class Logger implements ILogger {
    private logger = new console.Console(output, errorOutput);

    log(msg: string) {
        this.logger.log(new Date().toISOString() + ' ' + msg);
    }

    error(msg: string) {
        this.logger.error(new Date().toISOString() + ' ' + msg);
    }
}

export const logger = new Logger();
