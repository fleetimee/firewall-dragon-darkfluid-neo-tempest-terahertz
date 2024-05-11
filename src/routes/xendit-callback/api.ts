import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { updateOrderStatusXenditCallback, updateOrderStatusXenditSubscriptionCallback } from './repository';

const router = express.Router();

export enum XenditRecurringStatus {
    ACTIVATED = 'recurring.plan.activated',
    INACTIVATED = 'recurring.plan.inactivated',
    CYCLE_SUCCEED = 'recurring.cycle.succeeded',
    CYCLE_CREATED = 'recurring.cycle.created',
    CYCLE_RETRY = 'recurring.cycle.retrying',
    CYCLE_FAILED = 'recurring.cycle.failed',
    PAYMENT_ACTIVATED = 'payment_method.activated',
}

router.post('/', async (req, res, next) => {
    try {
        const { body } = req;

        // Check if body is empty
        if (!body) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        if (body.status === 'PAID') {
            await updateOrderStatusXenditCallback(body.external_id, 'success', body);

            res.status(StatusCodes.OK).send({
                message: 'Xendit callback received',
            });
        } else if (body.status === 'FAILED') {
            await updateOrderStatusXenditCallback(body.external_id, 'failed', body);
        }

        res.status(StatusCodes.BAD_REQUEST).send({
            message: 'Invalid status',
        });
    } catch (error) {
        next(error);
    }
});

router.post('/handleRecurringPayment', async (req, res, next) => {
    const webhookToken = 'yPA3KQkzCl7lPNNTrGy2dmOOwmH18FPb4P9XUole67Q0UrvA';

    try {
        const { body } = req;

        const xCallbackToken = req.headers['x-callback-token'];
        const webhookId = req.headers['webhook-id'];

        if (!body) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        if (!xCallbackToken || xCallbackToken !== webhookToken) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid x-callback-token',
            });
        }

        if (!webhookId) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid webhook-id',
            });
        }

        if (
            body.event === XenditRecurringStatus.ACTIVATED ||
            body.event === XenditRecurringStatus.INACTIVATED ||
            body.event === XenditRecurringStatus.CYCLE_SUCCEED ||
            body.event === XenditRecurringStatus.CYCLE_CREATED ||
            body.event === XenditRecurringStatus.CYCLE_RETRY ||
            body.event === XenditRecurringStatus.CYCLE_FAILED
        ) {
            await updateOrderStatusXenditSubscriptionCallback(body.data.reference_id, body.event, body);

            console.log(`Xendit callback received for order ${body.data.reference_id} with status ${body.event}`);

            res.status(StatusCodes.OK).send({
                message: 'Success Updating Order Status',
            });
        } else {
            throw new Error(`Invalid event: ${body.event}`);
        }
    } catch (error) {
        console.log(error);

        next(error);
    }
});

router.post('/handlePaymentMethod', async (req, res, next) => {
    try {
        const { body } = req;

        if (!body) {
            res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid body',
            });
        }

        if (body.event === XenditRecurringStatus.PAYMENT_ACTIVATED) {
            console.log(`Payment method created ${body.data.type}`);

            res.status(StatusCodes.OK).send({
                message: 'Payment Method Linked Successfully',
            });
        }
    } catch (error) {
        console.log(error);

        next(error);
    }
});

export default router;
