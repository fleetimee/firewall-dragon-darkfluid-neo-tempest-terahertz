import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../routes/auth/utils';
import logger from '../utils/winston';

/**
 * Middleware function for logging request information.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
const loggingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let user = 'Unauthenticated';
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = verifyToken(token);
            user = `${payload.name} - ${payload.email} - ${payload.roles}`;
        } catch (err) {
            // Handle error if needed
        }
    }

    const now = new Date();
    const date = now.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Jakarta',
    });
    const time = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    });

    const userAgent = req.headers['user-agent'];
    if (userAgent && !userAgent.includes('Dart')) {
        logger.info({
            level: 'info',
            message: [
                `Date: ${date}`,
                `Time: ${time}`,
                `User: ${user}`,
                `IP: ${req.ip}`,
                `User Agent: ${userAgent}`,
                `Route: ${req.method} ${req.url}`,
            ],
            service: 'jkt48-pm',
        });
    } else {
        logger.info({
            level: 'info',
            message: [
                `Date: ${date}`,
                `Time: ${time}`,
                `User: ${user}`,
                `IP: ${req.ip}`,
                `Route: ${req.method} ${req.url}`,
                `User Agent: ${userAgent}`,
            ],
            service: 'jkt48-pm',
        });
    }
    next();
};

export default loggingMiddleware;
