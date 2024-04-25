import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

import { authenticateUser, requireAdminRole, requireMemberRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { BadRequestError, NotFoundError, UnprocessableEntityError } from '../../utils/errors';
import { generateVerificationCode } from '../../utils/lib';
import { uploadMessage, uploadUserProfileMember } from '../../utils/multer';
import { formatResponsePaginated } from '../../utils/response-formatter';
import { validateMemberId, validateUuid } from '../../utils/validate';
import { getUser } from '../auth/repository';
import { getUserById } from '../user/repository';
import {
    createMember,
    createMemberMessage,
    deleteMemberById,
    getMemberById,
    getMemberIdByUserId,
    getMemberMessage,
    getMembers,
    updateLoggedMember,
    updateMemberById,
    updateProfileImageMemberById,
} from './repository';
import { createIdolSchema, updateIdolSchema, updateLoggedOnIdolSchema } from './schema';

const router = express.Router();

router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const orderBy = (req.query.orderBy as string) || 'created_at';
        const orderDirection = (req.query.orderDirection as string) || 'ASC';
        const searchQuery = req.query.searchQuery as string;

        const offset = (page - 1) * pageSize;

        const newsList = await getMembers(pageSize, offset, orderBy, orderDirection, searchQuery);

        res.status(StatusCodes.OK).send(
            formatResponsePaginated({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetch idol list',
                data: newsList,
                meta: {
                    page,
                    pageSize,
                    orderBy,
                    orderDirection,
                },
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/getIdolMessage', authenticateUser, requireMemberRole, async (req, res, next) => {
    try {
        const id = req.user.id;

        const idolId = await getMemberIdByUserId(id);

        const chat = await getMemberMessage(idolId.idol_id as string);

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success fetch member message',
            data: chat,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/getLoggedOnIdol', authenticateUser, requireMemberRole, async (req, res, next) => {
    try {
        const id = req.user.id;

        const idolId = await getMemberIdByUserId(id);

        const member = await getMemberById(idolId.idol_id as string);

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success fetch member',
            data: member,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!validateMemberId(id)) throw new UnprocessableEntityError('The member ID is not valid JKT48 member ID');

        const member = await getMemberById(id);
        if (!member) throw new NotFoundError('Member not found');

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success fetch member',
            data: member,
        });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/',
    uploadUserProfileMember.single('profileImage'),
    validateSchema(createIdolSchema),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const { email, password, fullName, nickname, birthday, height, bloodType, horoscope, instagramUrl, xUrl } =
                req.body;

            // Check if the email is already registered
            const user = await getUser(email);
            if (user) throw new UnprocessableEntityError('Email is already registered');

            // Generate verification token
            const verificationToken = generateVerificationCode();

            // File path image
            const ext = req.file?.originalname || '';
            const oldPath = `./static/profileImages/tmp/${req.file?.originalname}`;
            const destPath = `./static/profileImages/member/${nickname.toLowerCase()}`;
            const newPath = `./static/profileImages/member/${nickname.toLowerCase()}/${nickname + path.extname(ext)}`;
            const imgProfilePath = newPath.substring(1);
            const newMember = await createMember({
                email,
                fullName,
                nickname,
                birthday,
                height,
                bloodType,
                horoscope,
                password,
                verificationToken,
                instagramUrl,
                xUrl,
                imgProfilePath,
            });

            // Handle move image from tmp to specific folder by member nickname
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }

            fs.rename(oldPath, newPath, function (err) {
                if (err) throw err;
            });

            res.status(StatusCodes.CREATED).send({
                success: true,
                code: StatusCodes.CREATED,
                message: 'Success create new member',
                data: newMember,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.post(
    '/createMessage',
    authenticateUser,
    requireMemberRole,
    uploadMessage.array('attachments'),
    async (req, res, next) => {
        try {
            const userId = req.user.id;

            const { messages } = req.body;

            const attachments = req.files as Express.Multer.File[];

            const formattedAttachments = attachments?.map(attachment => {
                const fileBuffer = fs.readFileSync(attachment.path);
                const hashSum = crypto.createHash('sha1');
                hashSum.update(fileBuffer);
                const checksum = hashSum.digest('hex');

                return {
                    filePath: attachment.path, // path where the file is stored
                    fileType: attachment.mimetype, // file type
                    fileSize: attachment.size, // file size
                    originalName: attachment.originalname, // original file name
                    checksum: checksum, // checksum of the file
                };
            });

            const sendMessage = await createMemberMessage(userId, messages, formattedAttachments);

            res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'Success create message',
                data: sendMessage,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    '/getLoggedOnIdol/update',
    validateSchema(updateLoggedOnIdolSchema),
    authenticateUser,
    requireMemberRole,
    async (req, res, next) => {
        try {
            const id = req.user.id;

            const { fullName, bio } = req.body;

            const updatedMember = await updateLoggedMember(id, fullName, bio);

            res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'Success update member',
                data: updatedMember,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    '/:idolId',
    validateSchema(updateIdolSchema),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const idolId = req.params.idolId;

            if (!validateMemberId(idolId))
                throw new UnprocessableEntityError('The member ID is not valid JKT48 member ID');

            const { email, fullName, nickname, password, birthday, height, bloodType, horoscope } = req.body;

            const user = await getMemberById(idolId);
            if (!user) throw new NotFoundError('Idol not found');

            // const birthdayDate = new Date(birthday);

            const updatedMember = await updateMemberById(
                idolId,
                email,
                fullName,
                nickname,
                password,
                birthday,
                height,
                bloodType,
                horoscope,
            );

            res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'Success update member',
                data: updatedMember,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.patch(
    '/:idolId/profileImage',
    uploadUserProfileMember.single('profileImage'),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const idolId = req.params.idolId;

            if (!validateMemberId(idolId))
                throw new UnprocessableEntityError('The member ID is not valid JKT48 member ID');

            const member = await getMemberById(idolId);
            if (!member) throw new NotFoundError('User not found');

            const user = await getUserById(member.user_id as string);
            if (!user) throw new NotFoundError('User not found');

            if (user.nickname === null) throw new UnprocessableEntityError('User nickname is not set');

            if (!req.file) throw new BadRequestError('No file uploaded');

            const ext = req.file?.originalname || '';
            const oldPath = `./static/profileImages/tmp/${req.file?.originalname}`;
            const destPath = `./static/profileImages/member/${user.nickname.toLowerCase()}`;
            const newPath = `./static/profileImages/member/${user.nickname.toLowerCase()}/${
                user.nickname.toLowerCase() + path.extname(ext)
            }`;
            const imgProfilePath = newPath.substring(1);

            // Handle move image from tmp to specific folder by member nickname
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }

            fs.rename(oldPath, newPath, function (err) {
                if (err) throw err;
            });

            const updatedMember = await updateProfileImageMemberById(idolId, imgProfilePath);

            res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'Success update member profile image',
                data: updatedMember,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.delete('/:userId', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const userId = req.params.userId;

        if (!validateUuid(userId)) throw new UnprocessableEntityError('User id is not valid');

        const user = await getUserById(userId);
        if (!user) throw new NotFoundError('User not found');

        await deleteMemberById(userId);

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success delete member',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
