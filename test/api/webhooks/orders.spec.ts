import { createMocks } from 'node-mocks-http';
import handler from '@pages/api/webhooks/orders';

// Mock the BigCommerce client
const mockBigCommerceClient = {
  get: jest.fn(),
  put: jest.fn(),
};

jest.mock('@lib/auth', () => ({
  bigcommerceClient: jest.fn(() => mockBigCommerceClient),
}));

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env.STORE_HASH = 'test-store-hash';
  process.env.ACCESS_TOKEN = 'test-access-token';
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock fetch for V2 API calls
global.fetch = jest.fn();

describe('/api/webhooks/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle bundle sale correctly', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        data: {
          id: 123,
          status: 'completed'
        }
      },
    });

    // Mock V2 API response for order products
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { product_id: 100, quantity: 2 } // Selling 2 units of bundle 100
      ]
    });

    // Mock getting all products
    mockBigCommerceClient.get.mockImplementation((path: string) => {
      if (path === '/catalog/products') {
        return Promise.resolve({
          data: [
            { id: 100, name: 'Bundle Product' },
            { id: 1, name: 'Product A' },
            { id: 2, name: 'Product B' }
          ]
        });
      }

      // Mock metafields for bundle product
      if (path === '/catalog/products/100/metafields') {
        return Promise.resolve({
          data: [
            { key: 'is_bundle', namespace: 'bundle', value: 'true' },
            { key: 'linked_product_ids', namespace: 'bundle', value: '[1, 2]' },
            { key: 'product_quantities', namespace: 'bundle', value: '{"1": 2, "2": 1}' }
          ]
        });
      }

      // Mock metafields for individual products
      if (path === '/catalog/products/1/metafields' || path === '/catalog/products/2/metafields') {
        return Promise.resolve({ data: [] });
      }

      // Mock getting individual products for stock updates
      if (path === '/catalog/products/1') {
        return Promise.resolve({ data: { id: 1, inventory_level: 10 } });
      }
      if (path === '/catalog/products/2') {
        return Promise.resolve({ data: { id: 2, inventory_level: 20 } });
      }

      return Promise.resolve({ data: [] });
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    // Verify stock updates were called
    expect(mockBigCommerceClient.put).toHaveBeenCalledWith('/catalog/products/1', {
      inventory_level: 6 // 10 - (2 bundles * 2 needed) = 6
    });
    expect(mockBigCommerceClient.put).toHaveBeenCalledWith('/catalog/products/2', {
      inventory_level: 18 // 20 - (2 bundles * 1 needed) = 18
    });
  });

  it('should handle individual product sale and update affected bundles', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        data: {
          id: 124,
          status: 'completed'
        }
      },
    });

    // Mock V2 API response for order products
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { product_id: 1, quantity: 3 } // Selling 3 units of individual product 1
      ]
    });

    // Mock getting all products
    mockBigCommerceClient.get.mockImplementation((path: string) => {
      if (path === '/catalog/products') {
        return Promise.resolve({
          data: [
            { id: 100, name: 'Bundle Product' },
            { id: 1, name: 'Product A' },
            { id: 2, name: 'Product B' }
          ]
        });
      }

      // Mock metafields for bundle product
      if (path === '/catalog/products/100/metafields') {
        return Promise.resolve({
          data: [
            { key: 'is_bundle', namespace: 'bundle', value: 'true' },
            { key: 'linked_product_ids', namespace: 'bundle', value: '[1, 2]' },
            { key: 'product_quantities', namespace: 'bundle', value: '{"1": 2, "2": 1}' }
          ]
        });
      }

      // Mock metafields for individual product (not a bundle)
      if (path === '/catalog/products/1/metafields') {
        return Promise.resolve({ data: [] });
      }

      // Mock getting products for stock calculations
      if (path === '/catalog/products/1') {
        return Promise.resolve({ data: { id: 1, inventory_level: 10 } });
      }
      if (path === '/catalog/products/2') {
        return Promise.resolve({ data: { id: 2, inventory_level: 20 } });
      }

      return Promise.resolve({ data: [] });
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    // Verify only bundle stock was updated (individual product stock is NOT reduced in webhook)
    // Current stock: Product A has 10, Product B has 20
    // Bundle needs 2xA and 1xB: A allows 5 bundles (10/2), B allows 20 bundles
    // Limiting factor is A = 5 bundles
    expect(mockBigCommerceClient.put).toHaveBeenCalledWith('/catalog/products/100', {
      inventory_level: 5
    });
    
    // Individual product stock should NOT be reduced in webhook handler
    expect(mockBigCommerceClient.put).not.toHaveBeenCalledWith('/catalog/products/1', expect.any(Object));
  });

  it('should handle missing environment variables', async () => {
    // Temporarily remove environment variables
    delete process.env.STORE_HASH;
    delete process.env.ACCESS_TOKEN;

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        data: { id: 123 }
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Missing required information'
    });

    // Restore environment variables
    process.env.STORE_HASH = 'test-store-hash';
    process.env.ACCESS_TOKEN = 'test-access-token';
  });

  it('should handle V2 API fetch failure', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        data: { id: 123 }
      },
    });

    // Mock fetch failure
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Internal Server Error'
    });
  });

  it('should only accept POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('should handle BigCommerce API errors gracefully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        data: { id: 123 }
      },
    });

    // Mock V2 API success
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ product_id: 1, quantity: 1 }]
    });

    // Mock BigCommerce API error
    mockBigCommerceClient.get.mockRejectedValueOnce(new Error('BigCommerce API Error'));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Internal Server Error'
    });
  });
});
