import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Please enter your email').email(),
        password: z.string().min(1, 'Please enter your password'),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Please enter your email').email(),
        name: z.string().min(1, 'Please enter your name'),
        nickName: z.string().min(1, 'Please enter your nickname'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        birthday: z.string().refine(value => !isNaN(new Date(value).getTime()), {
            message: 'Please enter a valid date',
            path: ['birthday'],
        }),
    }),
});

export const verifySchema = z.object({
    body: z.object({
        verificationToken: z.string().min(1, 'Please enter your verification token'),
    }),
});

export const resendVerificationSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Please enter your email').email(),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Please enter your email').email(),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Please enter token for reset password'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
});
