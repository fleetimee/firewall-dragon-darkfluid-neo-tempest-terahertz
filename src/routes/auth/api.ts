import express from 'express';
import { Resend } from 'resend';

import { RESEND_KEY } from '../../config';
import { rateLimiterStrict } from '../../middlewares/rate-limiter';
import { validate } from '../../middlewares/validate-request';
import { ConflictError } from '../../utils/errors';
import { generateVerificationCode } from '../../utils/lib';
import { getUser, registerUser, verifyLogin } from './repository';
import { loginSchema, registerSchema } from './schema';
import { createAccessToken, createRefreshToken, setRefreshCookie, verifyToken } from './utils';

const router = express.Router();

const resend = new Resend(RESEND_KEY);

router.post('/register', validate(registerSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        const user = await getUser(email);
        if (user) throw new ConflictError('A user with that email already exists');

        // Generate a verification token and send an email to the user
        const verificationToken = generateVerificationCode();

        await registerUser(email, password, name, verificationToken);

        // Send verification email
        const { error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: ['hello@fleetime.my.id'],
            subject: 'JKT48 - Verification Code',
            text: `Hello, ${name}! Your verification code is ${verificationToken}`,
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/login', validate(loginSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await verifyLogin(email, password);
        const accessToken = createAccessToken(user.id, user.email, user.name);
        const refreshToken = createRefreshToken(user.id, user.email, user.name);
        setRefreshCookie(res, refreshToken);

        res.status(200).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const { id, email, name } = verifyToken(refreshToken);
        const accessToken = createAccessToken(id, email, name);

        res.status(200).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

export default router;
