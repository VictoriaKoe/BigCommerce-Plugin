// pages/api/sync/products.ts
// This file is currently disabled

export {};

/*  import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession, bigcommerceClient } from '../../../lib/auth';
import db from '../../../lib/db'; // Assuming you export query from here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accessToken, storeHash } = await getSession(req);
    const bigcommerce = bigcommerceClient(accessToken, storeHash);

    const response = await bigcommerce.get('/catalog/products?limit=250');
    const products = response.data;

    for (const p of products) {
      if (!p.sku) continue;

      await db.query(`
        INSERT INTO products (sku, name, stock, price)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          stock = VALUES(stock),
          price = VALUES(price)
      `, [p.sku, p.name, p.inventory_level || 0, p.price || 0.0]);
    }

    res.status(200).json({ message: 'Product sync complete', count: products.length });
  } catch (error) {
    console.error('[Sync Error]', error);
    res.status(500).json({ message: 'Failed to sync products', error: error.message });
  }
}*/
