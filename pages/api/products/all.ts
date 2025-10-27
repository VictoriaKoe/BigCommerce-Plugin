import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function allProducts(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);

        let allProducts = [];
        let currentPage = 1;
        let hasMorePages = true;

        // Fetch all pages (for 550 products, this will be ~3 requests)
        while (hasMorePages) {
            const params = new URLSearchParams({ 
                page: String(currentPage),
                limit: '250', // Maximum allowed
                include: 'variants'
            }).toString();

            const response = await bigcommerce.get(`/catalog/products?${params}`);
            
            allProducts = allProducts.concat(response.data);
            
            // Check if there are more pages
            const totalPages = response.meta?.pagination?.total_pages || 1;
            hasMorePages = currentPage < totalPages;
            currentPage++;
        }

        res.status(200).json({ data: allProducts, meta: { total: allProducts.length } });
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}

