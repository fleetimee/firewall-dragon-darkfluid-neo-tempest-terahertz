import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { UnprocessableEntityError } from '../../utils/errors';
import { formatResponsePaginated } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { approveMessage, createMessage, getMessages } from './repository';
import { approveOrRejectMessageSchema, createMessageSchema } from './schema';

const router = express.Router();

router.get('/:id', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const conversationId = req.params.id;
        if (!validateUuid(conversationId)) throw new UnprocessableEntityError('The conversation ID is not valid UUID');

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;

        const offset = (page - 1) * pageSize;

        const messages = await getMessages(conversationId, pageSize, offset);

        res.status(StatusCodes.OK).send(
            formatResponsePaginated({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetch messages',
                data: messages,
                meta: {
                    page,
                    pageSize,
                    orderBy: 'created_at',
                    orderDirection: 'DESC',
                },
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/', validateSchema(createMessageSchema), authenticateUser, async (req, res, next) => {
    try {
        const { conversationId, messages, attachments } = req.body;

        const formattedAttachments = attachments?.map(
            (attachment: { file_path: string; file_type: string; file_size: number; checksum: string }) => ({
                filePath: attachment.file_path,
                fileType: attachment.file_type,
                fileSize: attachment.file_size,
                checksum: attachment.checksum,
            }),
        );

        const userId = req.user.id;

        const sendMessage = await createMessage(conversationId, userId, messages, formattedAttachments);

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success create message',
            data: {
                sendMessage,
            },
        });
    } catch (error) {
        console.error(error);

        next(error);
    }
});

router.patch(
    '/:id/approveOrReject',
    validateSchema(approveOrRejectMessageSchema),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const conversationId = req.params.id;
            if (!validateUuid(conversationId)) throw new UnprocessableEntityError('The message is not valid UUID');

            const { isApproved } = req.body;

            await approveMessage(conversationId, isApproved);

            res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: isApproved === true ? 'Success approve message' : 'Success reject message',
                data: null,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
);

export default router;
