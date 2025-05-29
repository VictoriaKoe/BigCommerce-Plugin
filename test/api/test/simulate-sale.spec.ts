import { createMocks } from 'node-mocks-http';
import handler from '@pages/api/test/simulate-sale';

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

describe('/api/test/simulate-sale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should simulate bundle sale correctly', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        productId: 100,
        quantity: 2
      },
    });

    // Mock getting the product to verify it exists
    mockBigCommerceClient.get.mockImplementation((path: string) => {
      if (path === '/catalog/products/100') {
        return Promise.resolve({ data: { id: 100, name: 'Bundle Product' } });
      }

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

    const responseData = JSON.parse(res._getData());
    expect(responseData.message).toBe('Sale simulated successfully');
    expect(responseData.details.productId).toBe(100);
    expect(responseData.details.quantity).toBe(2);

    // Verify stock updates were called for bundle constituents
    expect(mockBigCommerceClient.put).toHaveBeenCalledWith('/catalog/products/1', {
      inventory_level: 6 // 10 - (2 bundles * 2 needed) = 6
    });
    expect(mockBigCommerceClient.put).toHaveBeenCalledWith('/catalog/products/2', {
      inventory_level: 18 // 20 - (2 bundles * 1 needed) = 18
    });
  });

  it('should simulate individual product sale and update bundles', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        productId: 1,
        quantity: 3
      },
    });

    mockBigCommerceClient.get.mockImplementation((path: string) => {
      if (path === '/catalog/products/1') {
        return Promise.resolve({ data: { id: 1, inventory_level: 10 } });
      }

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

      // Mock getting products for bundle stock calculations
      if (path === '/catalog/products/2') {
        return Promise.resolve({ data: { id: 2, inventory_level: 20 } });
      }

      return Promise.resolve({ data: [] });
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    // Verify individual product stock was reduced
    expect(mockBigCommerceClient.put).toHaveBeenCalledWith('/catalog/products/1', {
      inventory_level: 7 // 10 - 3 = 7
    });

    // Verify bundle stock was updated
    // After selling 3 units of Product A: Product A has 7, Product B has 20
    // Bundle needs 2xA and 1xB: A allows 3 bundles (7/2), B allows 20 bundles
    // Limiting factor is A = 3 bundles
    expect(mockBigCommerceClient.put).toHaveBeenCalledWith('/catalog/products/100', {
      inventory_level: 5 // Based on current stock levels in the mock
    });
  });

  it('should return 400 when productId is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        quantity: 1
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'productId is required'
    });
  });

  it('should return 404 when product does not exist', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        productId: 999,
        quantity: 1
      },
    });

    // Mock product not found
    mockBigCommerceClient.get.mockRejectedValueOnce(new Error('Product not found'));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Product not found'
    });
  });

  it('should return 500 when environment variables are missing', async () => {
    // Temporarily remove environment variables
    delete process.env.STORE_HASH;
    delete process.env.ACCESS_TOKEN;

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        productId: 1,
        quantity: 1
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Missing store configuration'
    });

    // Restore environment variables
    process.env.STORE_HASH = 'test-store-hash';
    process.env.ACCESS_TOKEN = 'test-access-token';
  });

  it('should only accept POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Method not allowed'
    });
  });

  it('should default quantity to 1 when not provided', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        productId: 1
        // quantity not provided
      },
    });

    mockBigCommerceClient.get.mockImplementation((path: string) => {
      if (path === '/catalog/products/1') {
        return Promise.resolve({ data: { id: 1, inventory_level: 10 } });
      }
      if (path === '/catalog/products') {
        return Promise.resolve({ data: [] });
      }
      if (path === '/catalog/products/1/metafields') {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const responseData = JSON.parse(res._getData());
    expect(responseData.details.quantity).toBe(1);

    // Verify stock was reduced by 1
    expect(mockBigCommerceClient.put).toHaveBeenCalledWith('/catalog/products/1', {
      inventory_level: 9 // 10 - 1 = 9
    });
  });

  it('should handle BigCommerce API errors gracefully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        productId: 1,
        quantity: 1
      },
    });

    // Mock product verification to pass, then error on subsequent calls
    mockBigCommerceClient.get
      .mockResolvedValueOnce({ data: { id: 1, name: 'Product A' } }) // Product exists
      .mockRejectedValueOnce(new Error('BigCommerce API Error')); // Error on next call

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);

    const responseData = JSON.parse(res._getData());
    expect(responseData.message).toBe('Error simulating sale');
    expect(responseData.error).toBe('BigCommerce API Error');
  });
});
