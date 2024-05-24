import {
    AppStoreServerAPIClient,
    Environment,
    HistoryResponse,
    Order,
    ProductType,
    ReceiptUtility,
    TransactionHistoryRequest,
} from '@apple/app-store-server-library';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import appleReceiptVerify from 'node-apple-receipt-verify';
import path from 'path';

import { APPLE_BUNDLE_ID, APPLE_ISSUER_ID, APPLE_KEY_ID } from '../../config';
import { validateSchema } from '../../middlewares/validate-request';
import { readP8File } from '../../utils/read-file';
import { formatResponse } from '../../utils/response-formatter';
import { appleVerifySchema } from './schema';

const router = express.Router();

router.post('/verify', async (req, res, next) => {
    try {
        const { body } = req;

        console.log('Apple Pay verify body', body);
    } catch (error) {
        next(error);
    }
});

router.post('/verifyApple', validateSchema(appleVerifySchema), async (req, res, next) => {
    try {
        const { receiptData } = req.body;

        const product = await appleReceiptVerify.validate({
            receipt: receiptData,
        });

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                data: product,
                message: 'Apple Pay verified successfully',
                success: true,
            }),
        );
    } catch (e) {
        if (e instanceof appleReceiptVerify.EmptyError) {
            // Return 400
            console.log('EmptyError');
        } else if (e instanceof appleReceiptVerify.ServiceUnavailableError) {
            // todo

            // Return 503
            throw new Error('ServiceUnavailableError');
        }

        next(e);
    }
});

router.post('/verifyAppleV2', async (req, res, next) => {
    try {
        const { receiptData } = req.body;

        const issuerId = APPLE_ISSUER_ID;
        const keyId = APPLE_KEY_ID;
        const bundleId = APPLE_BUNDLE_ID;
        const p8Path = path.join(__dirname, '../../config/SubscriptionKey_4X4DAUH7SH.p8');
        const encodedKey = readP8File(p8Path);

        const client = new AppStoreServerAPIClient(
            encodedKey,
            issuerId as string,
            keyId as string,
            bundleId as string,
            Environment.SANDBOX,
        );

        const receiptUtils = new ReceiptUtility();

        const transactionId = receiptUtils.extractTransactionIdFromAppReceipt(receiptData);

        if (transactionId != null) {
            const transactionHistoryRequest: TransactionHistoryRequest = {
                sort: Order.ASCENDING,
                revoked: false,
                productTypes: [ProductType.AUTO_RENEWABLE],
            };

            let response: HistoryResponse | null = null;
            let transactions: string[] = [];

            do {
                const revisionToken = response && response.revision ? response.revision : null;
                response = await client.getTransactionHistory(transactionId, revisionToken, transactionHistoryRequest);
                if (response.signedTransactions) {
                    transactions = transactions.concat(response.signedTransactions);
                }
            } while (response.hasMore);
            console.log(transactions);

            res.status(StatusCodes.OK).send(
                formatResponse({
                    code: StatusCodes.OK,
                    data: transactions,
                    message: 'Apple Pay verified successfully',
                    success: true,
                }),
            );
        }
    } catch (error) {
        next(error);
    }
});

export default router;