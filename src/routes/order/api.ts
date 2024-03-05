import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { NotFoundError } from '../../utils/errors';
import { formatResponse } from '../../utils/response-formatter';
import { createOrder, getInquiryOrder, getInquiryOrderListIdol, getOrderById } from './repository';
import { createOrderSchema } from './schema';

const router = express.Router();

router.get('/:orderId', async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const order = await getOrderById(orderId);

        if (!order) throw new NotFoundError('Order not found');

        console.log('order', order);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Order fetched',
                data: order,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/inquiry/:orderId', async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const order = await getInquiryOrder(orderId);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Inquiry order fetched',
                data: order,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/inquiry/:orderId/idol', async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const order = await getInquiryOrderListIdol(orderId);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Inquiry order fetched',
                data: order,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/', validateSchema(createOrderSchema), authenticateUser, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { packageId, paymentMethod, subtotal, tax, total, idolIds } = req.body;

        // const checkPackageId = getPackage(packageId);

        const createOrderItem = await createOrder(userId, packageId, paymentMethod, subtotal, tax, total, idolIds);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Order created',
                data: createOrderItem,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
