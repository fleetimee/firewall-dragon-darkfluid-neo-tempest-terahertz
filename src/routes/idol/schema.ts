import { z } from 'zod';

export const updateIdolSchema = z.object({
    body: z.object({
        email: z.string().email().min(1),
        fullName: z.string().min(1),
        nickName: z.string().min(1),
        birthday: z.string().refine(value => !isNaN(new Date(value).getTime()), {
            message: 'Please enter a valid date',
            path: ['birthday'],
        }),
        height: z.number(),
        bloodType: z.string(),
        horoscope: z.string(),
    }),
});
