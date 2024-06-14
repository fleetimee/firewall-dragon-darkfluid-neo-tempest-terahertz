export enum Role {
    USER = 'user',
    ADMIN = 'admin',
    MEMBER = 'member',
}

export enum AppleNotificationType {
    CONSUMPTION_REQUEST = 'CONSUMPTION_REQUEST',
    DID_CHANGE_RENEWAL_PREF = 'DID_CHANGE_RENEWAL_PREF',
    DID_CHANGE_RENEWAL_STATUS = 'DID_CHANGE_RENEWAL_STATUS',
    DID_FAIL_TO_RENEW = 'DID_FAIL_TO_RENEW',
    DID_RENEW = 'DID_RENEW',
    EXPIRED = 'EXPIRED',
    EXTERNAL_PURCHASE_TOKEN = 'EXTERNAL_PURCHASE_TOKEN',
    GRACE_PERIOD_EXPIRED = 'GRACE_PERIOD_EXPIRED',
    OFFER_REDEEMED = 'OFFER_REDEEMED',
    PRICE_INCREASE = 'PRICE_INCREASE',
    REFUND = 'REFUND',
    REFUND_DECLINED = 'REFUND_DECLINED',
    REFUND_REVERSED = 'REFUND_REVERSED',
    RENEWAL_EXTENDED = 'RENEWAL_EXTENDED',
    RENEWAL_EXTENSION = 'RENEWAL_EXTENSION',
    REVOKE = 'REVOKE',
    SUBSCRIBED = 'SUBSCRIBED',
    TEST = 'TEST',
}

export enum AppleNotificationSubType {
    ACCEPTED = 'ACCEPTED',
    AUTO_RENEW_DISABLED = 'AUTO_RENEW_DISABLED',
    AUTO_RENEW_ENABLED = 'AUTO_RENEW_ENABLED',
    BILLING_RECOVERY = 'BILLING_RECOVERY',
    BILLING_RETRY = 'BILLING_RETRY',
    DOWNGRADE = 'DOWNGRADE',
    FAILURE = 'FAILURE',
    GRACE_PERIOD = 'GRACE_PERIOD',
    INITIAL_BUY = 'INITIAL_BUY',
    PENDING = 'PENDING',
    PRICE_INCREASE = 'PRICE_INCREASE',
    PRODUCT_NOT_FOR_SALE = 'PRODUCT_NOT_FOR_SALE',
    RESUBSCRIBE = 'RESUBSCRIBE',
    SUMMARY = 'SUMMARY',
    UPGRADE = 'UPGRADE',
    UNREPORTED = 'UNREPORTED',
    VOLUNTARY = 'VOLUNTARY',
}

export enum GoogleNotificationType {
    SUBSCRIPTION_RECOVERED = 1,
    SUBSCRIPTION_RENEWED = 2,
    SUBSCRIPTION_CANCELED = 3,
    SUBSCRIPTION_PURCHASED = 4,
    SUBSCRIPTION_ON_HOLD = 5,
    SUBSCRIPTION_IN_GRACE_PERIOD = 6,
    SUBSCRIPTION_RESTARTED = 7,
    SUBSCRIPTION_PRICE_CHANGE_CONFIRMED = 8,
    SUBSCRIPTION_DEFERRED = 9,
    SUBSCRIPTION_PAUSED = 10,
    SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED = 11,
    SUBSCRIPTION_REVOKED = 12,
    SUBSCRIPTION_EXPIRED = 13,
    SUBSCRIPTION_PENDING_PURCHASE_CANCELED = 20,
}
