import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { NotFoundError } from '../../utils/errors';
import { formatResponse, formatResponsePaginated } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { getOrderById } from '../order/repository';
import {
    cancelSubscription,
    checkUserSubscription,
    checkUserSubscriptionOderIdol,
    countActiveSubscriptionsUsers,
    countRegisteredUsers,
    getUserById,
    getUserConversationList,
    getUserConversationMessages,
    getUserTransactionDetail,
    getUserTransactionList,
    updateUser,
} from './repository';
import { updateUserSchema } from './schema';

const router = express.Router();

router.get('/me', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        res.status(StatusCodes.OK).send({ user });
    } catch (error) {
        next(error);
    }
});

router.get('/me/checkSubscription', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const subscription = await checkUserSubscription(id);
        if (!subscription) throw new NotFoundError('Subscription not found');

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Subscription status checked',
                data: subscription,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/cancelSubscription', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const checkSubscription = await checkUserSubscription(id);
        if (!checkSubscription) throw new NotFoundError('User does not have an active subscription');

        const subscription = await cancelSubscription(id);
        if (!subscription) throw new NotFoundError('Subscription not found');

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Subscription canceled',
                data: subscription,
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/me/transactionList', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const transactionList = await getUserTransactionList(id);

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'User transaction list',
                data: transactionList,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/transactionDetail/:orderId', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;
        const orderId = req.params.orderId;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const order = await getOrderById(orderId);
        if (!order) throw new NotFoundError('Order not found');

        const transactionDetail = await getUserTransactionDetail(id, orderId);
        if (!transactionDetail) throw new NotFoundError('Transaction not found');

        // Parse callback_data from stringified JSON to object
        if (transactionDetail.callback_data) {
            transactionDetail.callback_data = JSON.parse(transactionDetail.callback_data as string);
        }

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'User transaction detail',
                data: transactionDetail,
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/me/conversationList', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const conversationList = await getUserConversationList(id);

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'User conversation list',
                data: conversationList,
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/me/conversation/:conversationId', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;
        const conversationId = req.params.conversationId;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const conversation = await getUserConversationMessages(id, conversationId, 10, 0);
        if (!conversation) throw new NotFoundError('Conversation not found');

        // From the conversation list, get the first item to get idol id
        const idolId = conversation[0]?.idol_id;

        // Check if the user is the idol in the conversation
        if (!idolId) throw new NotFoundError('User not subscribed to this idol');

        // Check if the user subscripted to this idol
        const subscription = await checkUserSubscriptionOderIdol(id, idolId as string);

        if (!subscription) throw new NotFoundError('User does not have an active subscription to this idol');

        res.status(StatusCodes.OK).send(
            formatResponsePaginated({
                code: StatusCodes.OK,
                message: 'User conversation',
                data: conversation,
                meta: {
                    page: 1,
                    pageSize: 10,
                    orderBy: 'created_at',
                    orderDirection: 'DESC',
                },
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/countRegistered', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const count = await countRegisteredUsers();

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Count of registered users',
                data: count,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/countActiveSubscriptions', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const count = await countActiveSubscriptionsUsers();

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Count of active subscriptions users',
                data: count,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.patch('/me', validateSchema(updateUserSchema), authenticateUser, async (req, res, next) => {
    try {
        const isValidUuid = validateUuid(req.user.id);
        if (!isValidUuid) throw new NotFoundError('UserId not valid (uuid)');

        const id = req.user.id;
        const { name, email, nickName, birthday, profileImage } = req.body;

        const user = await updateUser(id, email, nickName, name, birthday, profileImage);

        res.status(StatusCodes.OK).send({ user });
    } catch (error) {
        next(error);
    }
});

export default router;
