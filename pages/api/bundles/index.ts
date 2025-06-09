import type { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Get session from the authenticated user
    const { accessToken, storeHash } = await getSession(req);
    
    if (!accessToken || !storeHash) {
      return res.status(401).json({ message: 'Unauthorized - missing session data' });
    }
    
    const bc = bigcommerceClient(accessToken, storeHash);

    // Get all products
    const { data: products } = await bc.get('/catalog/products');

    // Get metafields for each product to identify bundles
    const bundles = [];

    for (const product of products) {
      const { data: metafields } = await bc.get(`/catalog/products/${product.id}/metafields`);

      const isBundle = metafields.find(f => f.key === 'is_bundle' && f.namespace === 'bundle')?.value === 'true';

      if (isBundle) {
        const linkedProductIds = JSON.parse(
          metafields.find(f => f.key === 'linked_product_ids' && f.namespace === 'bundle')?.value || '[]'
        );

        const quantities = JSON.parse(
          metafields.find(f => f.key === 'linked_product_quantities' && f.namespace === 'bundle')?.value || '[]'
        );

        bundles.push({
          id: product.id,
          name: product.name,
          linkedProductIds,
          quantities: quantities.length ? quantities : linkedProductIds.map(() => 1)
        });
      }
    }

    res.status(200).json(bundles);
  } catch (error: any) {
    console.error('Error fetching bundles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
