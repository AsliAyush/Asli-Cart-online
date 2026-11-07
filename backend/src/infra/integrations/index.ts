// External Provider Adapters Preparation (Affiliate Networks, Email, SMS, Payment gateways)

export interface IAffiliateNetworkAdapter {
  name: string;
  fetchDeals(): Promise<any[]>;
  generateTrackingLink(targetUrl: string, subId?: string): string;
}

export interface IEmailService {
  sendEmail(to: string, subject: string, html: string): Promise<boolean>;
}

export class MockEmailService implements IEmailService {
  async sendEmail(_to: string, _subject: string, _html: string): Promise<boolean> {
    return true;
  }
}

export const emailService = new MockEmailService();

