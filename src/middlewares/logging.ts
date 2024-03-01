import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../routes/auth/utils';
import logger from '../utils/winston';

const loggingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let user = 'unauthenticated';
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>
        try {
            const payload = verifyToken(token);
            user = `${payload.name} - ${payload.email} - ${payload.roles}`;
            logger.info({
                level: 'info',
                message: `Authenticated user: ${user}`,
                service: 'jkt48-pm',
            });
        } catch (err) {
            // Token is invalid or user not found, log as unauthenticated
            logger.warn({
                level: 'warn',
                message: `Unauthenticated access attempt: ${err}`,
                service: 'jkt48-pm',
            });
        }
    }

    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
        timeZone: 'Asia/Jakarta',
    });
    const time = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Jakarta',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    });

    logger.info({
        level: 'info',
        message: [
            `Date: ${date}`,
            `Time: ${time}`,
            `User: ${user}`,
            `IP: ${req.ip}`,
            `User Agent: ${req.headers['user-agent']}`,
            `Route: ${req.method} ${req.url}`,
        ],
        service: 'jkt48-pm',
    });
    next();
};

export default loggingMiddleware;
