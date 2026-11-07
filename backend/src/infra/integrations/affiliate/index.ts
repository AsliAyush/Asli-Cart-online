import { IAffiliateLinkProvider } from './affiliate.interface.js';
import { CuelinksAffiliateProvider } from './cuelinks.provider.js';
import { MockAffiliateProvider } from './mock.provider.js';

export * from './affiliate.interface.js';
export * from './cuelinks.provider.js';
export * from './mock.provider.js';

export const getAffiliateProvider = (): IAffiliateLinkProvider => {
  if (process.env.NODE_ENV === 'test') {
    return new MockAffiliateProvider();
  }
  return new CuelinksAffiliateProvider();
};

export const defaultAffiliateProvider = getAffiliateProvider();

