// BACKEND INTEGRATION: POST /api/v1/notifications/email
// Email notification service for customer-facing events triggered by admin actions

export type EmailNotificationType =
  | 'deposit_confirmed' |'withdrawal_pending' |'withdrawal_approved' |'withdrawal_rejected' |'profile_updated' |'kyc_approved' |'kyc_rejected' |'account_activated' |'account_suspended';

export interface EmailNotificationPayload {
  customerId: string;
  customerEmail: string;
  customerName: string;
  type: EmailNotificationType;
  data?: Record<string, string | number>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// In-app notification record
export interface InAppNotification {
  id: string;
  userId: string;
  type: EmailNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const EMAIL_TEMPLATES: Record<EmailNotificationType, { subject: string; body: (data: Record<string, string | number>, name: string) => string }> = {
  deposit_confirmed: {
    subject: '✅ Deposit Confirmed — CryonFX',
    body: (data, name) => `Hi ${name},\n\nYour deposit of ${data.amount} ${data.currency || 'USDC'} has been confirmed and credited to your account.\n\nTransaction ID: ${data.txId || 'N/A'}\n\nYou can now use these funds for trading.\n\nBest regards,\nCryonFX Team`,
  },
  withdrawal_pending: {
    subject: '🔄 Withdrawal Pending — CryonFX',
    body: (data, name) => `Hi ${name},\n\nYour withdrawal request of ${data.amount} ${data.currency || 'USDC'} is currently pending review.\n\nExpected processing time: 1–3 business days.\n\nWe will notify you once it has been processed.\n\nBest regards,\nCryonFX Team`,
  },
  withdrawal_approved: {
    subject: '✅ Withdrawal Approved — CryonFX',
    body: (data, name) => `Hi ${name},\n\nYour withdrawal of ${data.amount} ${data.currency || 'USDC'} has been approved and is being processed.\n\nExpected arrival: 1–2 business days.\n\nBest regards,\nCryonFX Team`,
  },
  withdrawal_rejected: {
    subject: '❌ Withdrawal Rejected — CryonFX',
    body: (data, name) => `Hi ${name},\n\nUnfortunately your withdrawal request of ${data.amount} ${data.currency || 'USDC'} has been rejected.\n\nReason: ${data.reason || 'Please contact support for details.'}\n\nPlease contact our support team if you have any questions.\n\nBest regards,\nCryonFX Team`,
  },
  profile_updated: {
    subject: '📝 Profile Updated — CryonFX',
    body: (data, name) => `Hi ${name},\n\nYour account profile has been updated by our team.\n\nUpdated fields: ${data.fields || 'Account information'}\n\nIf you did not request this change, please contact support immediately.\n\nBest regards,\nCryonFX Team`,
  },
  kyc_approved: {
    subject: '🎉 KYC Approved — Account Fully Activated',
    body: (data, name) => `Hi ${name},\n\nCongratulations! Your identity verification (KYC) has been approved by our compliance team.\n\nYour CryonFX account is now fully activated with complete trading access.\n\nYou can now:\n• Trade all available instruments\n• Make deposits and withdrawals\n• Access all platform features\n\nWelcome to CryonFX!\n\nBest regards,\nCryonFX Compliance Team`,
  },
  kyc_rejected: {
    subject: '⚠️ KYC Requires Attention — CryonFX',
    body: (data, name) => `Hi ${name},\n\nWe were unable to verify your identity documents.\n\nReason: ${data.reason || 'Documents could not be verified.'}\n\nPlease re-submit your KYC with clear, valid documents. If you need assistance, contact our support team.\n\nBest regards,\nCryonFX Compliance Team`,
  },
  account_activated: {
    subject: '✅ Account Activated — CryonFX',
    body: (data, name) => `Hi ${name},\n\nYour CryonFX account has been activated. You now have full access to the platform.\n\nBest regards,\nCryonFX Team`,
  },
  account_suspended: {
    subject: '⚠️ Account Suspended — CryonFX',
    body: (data, name) => `Hi ${name},\n\nYour CryonFX account has been temporarily suspended.\n\nReason: ${data.reason || 'Please contact support for details.'}\n\nPlease contact our support team to resolve this.\n\nBest regards,\nCryonFX Team`,
  },
};

export const notificationService = {
  /**
   * Send email notification to customer
   * BACKEND INTEGRATION: POST /api/v1/notifications/email
   */
  async sendEmail(payload: EmailNotificationPayload): Promise<NotificationResult> {
    const template = EMAIL_TEMPLATES[payload.type];
    if (!template) return { success: false, error: 'Unknown notification type' };

    const emailData = {
      to: payload.customerEmail,
      subject: template.subject,
      body: template.body(payload.data || {}, payload.customerName),
    };

    // BACKEND INTEGRATION: Replace with actual email API call
    // e.g., await fetch('/api/v1/notifications/email', { method: 'POST', body: JSON.stringify(emailData) })
    console.log('[Email Notification]', emailData);
    return { success: true, messageId: `msg-${Date.now()}` };
  },

  /**
   * Create in-app notification for customer
   * BACKEND INTEGRATION: POST /api/v1/notifications/in-app
   */
  async createInAppNotification(
    userId: string,
    type: EmailNotificationType,
    title: string,
    message: string
  ): Promise<NotificationResult> {
    // BACKEND INTEGRATION: POST /api/v1/notifications/in-app
    const notification: InAppNotification = {
      id: `notif-${Date.now()}`,
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    console.log('[In-App Notification]', notification);
    return { success: true };
  },

  /**
   * Notify customer of deposit confirmation (called by admin when confirming deposit)
   */
  async notifyDepositConfirmed(customer: { id: string; email: string; name: string }, amount: number, currency = 'USDC'): Promise<void> {
    await Promise.all([
      this.sendEmail({
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        type: 'deposit_confirmed',
        data: { amount, currency, txId: `TXN-${Date.now()}` },
      }),
      this.createInAppNotification(
        customer.id,
        'deposit_confirmed',
        'Deposit Confirmed',
        `Your deposit of ${amount} ${currency} has been confirmed and credited to your account.`
      ),
    ]);
  },

  /**
   * Notify customer of withdrawal status change (called by admin)
   */
  async notifyWithdrawalStatus(
    customer: { id: string; email: string; name: string },
    status: 'pending' | 'approved' | 'rejected',
    amount: number,
    currency = 'USDC',
    reason?: string
  ): Promise<void> {
    const type: EmailNotificationType = status === 'pending' ? 'withdrawal_pending' : status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected';
    const titles: Record<string, string> = {
      pending: 'Withdrawal Pending',
      approved: 'Withdrawal Approved',
      rejected: 'Withdrawal Rejected',
    };
    await Promise.all([
      this.sendEmail({
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        type,
        data: { amount, currency, reason: reason || '' },
      }),
      this.createInAppNotification(
        customer.id,
        type,
        titles[status],
        `Your withdrawal of ${amount} ${currency} is ${status}.`
      ),
    ]);
  },

  /**
   * Notify customer of profile update by admin
   */
  async notifyProfileUpdated(customer: { id: string; email: string; name: string }, fields: string): Promise<void> {
    await Promise.all([
      this.sendEmail({
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        type: 'profile_updated',
        data: { fields },
      }),
      this.createInAppNotification(
        customer.id,
        'profile_updated',
        'Profile Updated',
        `Your account profile has been updated: ${fields}.`
      ),
    ]);
  },

  /**
   * Notify customer of KYC approval — account fully activated
   */
  async notifyKYCApproved(customer: { id: string; email: string; name: string }): Promise<void> {
    await Promise.all([
      this.sendEmail({
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        type: 'kyc_approved',
        data: {},
      }),
      this.createInAppNotification(
        customer.id,
        'kyc_approved',
        '🎉 Account Fully Activated!',
        'Your KYC has been approved. Your account is now fully activated with complete trading access.'
      ),
    ]);
  },

  /**
   * Notify customer of KYC rejection
   */
  async notifyKYCRejected(customer: { id: string; email: string; name: string }, reason: string): Promise<void> {
    await Promise.all([
      this.sendEmail({
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        type: 'kyc_rejected',
        data: { reason },
      }),
      this.createInAppNotification(
        customer.id,
        'kyc_rejected',
        'KYC Requires Attention',
        `Your KYC submission requires attention: ${reason}`
      ),
    ]);
  },
};
