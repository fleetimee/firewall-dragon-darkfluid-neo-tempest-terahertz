import 'winston-daily-rotate-file';

import winston from 'winston';

const fileTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'jkt48-pm' },
    transports: [
        fileTransport,
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

export default logger;
