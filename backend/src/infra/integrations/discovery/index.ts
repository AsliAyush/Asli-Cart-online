import { IProductDiscoveryProvider, DiscoveredItem } from './discovery.interface.js';
import { MockProductDiscoveryProvider } from './mockDiscovery.provider.js';

export * from './discovery.interface.js';
export * from './mockDiscovery.provider.js';

/**
 * Disabled discovery provider used in production when no live discovery provider is configured.
 * Prevents mock synthetic items from being silently served as live deals in production.
 */
export class DisabledDiscoveryProvider implements IProductDiscoveryProvider {
  readonly name = 'DISABLED_DISCOVERY_PROVIDER';

  async searchDiscovered(): Promise<DiscoveredItem[]> {
    return [];
  }

  async getDiscoveredById(): Promise<DiscoveredItem | null> {
    return null;
  }
}

export const getDiscoveryProvider = (): IProductDiscoveryProvider => {
  // Prevent silent mock data usage in production unless explicitly opted-in via ENABLE_MOCK_DISCOVERY=true
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_MOCK_DISCOVERY !== 'true') {
    return new DisabledDiscoveryProvider();
  }
  return new MockProductDiscoveryProvider();
};

export const defaultDiscoveryProvider = getDiscoveryProvider();

