import { sql } from 'drizzle-orm';

import db from '../../db';

export const sendTokenToServer = async (token: string, userId: string) => {
    const [existingToken] = await db.execute(
        sql`
        SELECT * FROM fcm_token WHERE user_id = ${userId}
        `,
    );

    if (existingToken) {
        // If the token already exists, update it
        await db.execute(
            sql`
            UPDATE fcm_token SET token = ${token} WHERE user_id = ${userId}
            `,
        );
    } else {
        // If the token doesn't exist, insert it into the database
        await db.execute(
            sql`
            INSERT INTO fcm_token (token, user_id)
            VALUES (${token}, ${userId})
            `,
        );
    }
};
