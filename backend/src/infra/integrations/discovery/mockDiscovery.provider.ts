import { IProductDiscoveryProvider, DiscoveredItem } from './discovery.interface.js';

export class MockProductDiscoveryProvider implements IProductDiscoveryProvider {
  readonly name = 'MOCK_DISCOVERY_PROVIDER';

  private catalog: DiscoveredItem[] = [
    {
      externalId: 'DISC-AMZ-001',
      merchantSlug: 'amazon',
      merchantName: 'Amazon India',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      brand: 'Sony',
      category: 'Electronics',
      originalPrice: 34990,
      sellingPrice: 26990,
      discountPercentage: 22.86,
      currency: 'INR',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      productUrl: 'https://www.amazon.in/dp/B09XS7JWHH',
      specifications: { color: 'Black', batteryLife: '30 hours', connection: 'Bluetooth 5.2' },
    },
    {
      externalId: 'DISC-FLP-002',
      merchantSlug: 'flipkart',
      merchantName: 'Flipkart',
      title: 'Apple iPhone 15 (128 GB) - Blue',
      brand: 'Apple',
      category: 'Mobile Phones',
      originalPrice: 79900,
      sellingPrice: 65999,
      discountPercentage: 17.4,
      currency: 'INR',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab',
      productUrl: 'https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itm123',
      specifications: { display: '6.1 inch Super Retina XDR', chip: 'A16 Bionic', storage: '128 GB' },
    },
    {
      externalId: 'DISC-MYN-003',
      merchantSlug: 'myntra',
      merchantName: 'Myntra',
      title: 'Puma Men Black Running Shoes Softride',
      brand: 'Puma',
      category: 'Fashion',
      originalPrice: 5999,
      sellingPrice: 2999,
      discountPercentage: 50.01,
      currency: 'INR',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      productUrl: 'https://www.myntra.com/sports-shoes/puma/running-shoes/12345',
      specifications: { material: 'Mesh', closure: 'Lace-Up', sole: 'Rubber' },
    },
    {
      externalId: 'DISC-AMZ-004',
      merchantSlug: 'amazon',
      merchantName: 'Amazon India',
      title: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)',
      brand: 'Samsung',
      category: 'Mobile Phones',
      originalPrice: 134999,
      sellingPrice: 119999,
      discountPercentage: 11.11,
      currency: 'INR',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c',
      productUrl: 'https://www.amazon.in/dp/B0CS5XWZ8Z',
      specifications: { ram: '12 GB', storage: '256 GB', camera: '200 MP Quad' },
    },
    {
      externalId: 'DISC-TCQ-005',
      merchantSlug: 'tatacliq',
      merchantName: 'TataCliq',
      title: 'LG 55 Inch 4K Smart OLED TV',
      brand: 'LG',
      category: 'Appliances',
      originalPrice: 149990,
      sellingPrice: 99990,
      discountPercentage: 33.34,
      currency: 'INR',
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1',
      productUrl: 'https://www.tatacliq.com/lg-55-inch-oled/p-mp123456',
      specifications: { resolution: '4K Ultra HD', refreshRate: '120 Hz', os: 'webOS' },
    },
  ];

  async searchDiscovered(params: {
    keyword?: string;
    category?: string;
    merchant?: string;
    limit?: number;
  }): Promise<DiscoveredItem[]> {
    let results = [...this.catalog];

    if (params.keyword) {
      const q = params.keyword.toLowerCase();
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.brand && item.brand.toLowerCase().includes(q))
      );
    }

    if (params.category) {
      const c = params.category.toLowerCase();
      results = results.filter((item) => item.category?.toLowerCase() === c);
    }

    if (params.merchant) {
      const m = params.merchant.toLowerCase();
      results = results.filter((item) => item.merchantSlug.toLowerCase() === m);
    }

    if (params.limit) {
      results = results.slice(0, params.limit);
    }

    return results;
  }

  async getDiscoveredById(externalId: string): Promise<DiscoveredItem | null> {
    return this.catalog.find((item) => item.externalId === externalId) || null;
  }
}

