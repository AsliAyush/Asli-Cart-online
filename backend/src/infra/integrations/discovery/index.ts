import { IProductDiscoveryProvider } from './discovery.interface.js';
import { MockProductDiscoveryProvider } from './mockDiscovery.provider.js';

export * from './discovery.interface.js';
export * from './mockDiscovery.provider.js';

export const getDiscoveryProvider = (): IProductDiscoveryProvider => {
  return new MockProductDiscoveryProvider();
};

export const defaultDiscoveryProvider = getDiscoveryProvider();

