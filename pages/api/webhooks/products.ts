import type { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient } from '../../../lib/auth';
import { 
  recalculateProductBundles, 
  recalculateVariantBundles 
} from '../../../lib/bundle-calculator';
import db from '../../../lib/db';
import { 
  checkWebhookDuplicate,
  cleanupExpiredWebhooks 
} from '../../../lib/webhook-deduplication';

// Utility to get bundle info for a product
async function getProductBundleInfo(productId: number, bc: any) {
  const { data: metafields } = await bc.get(`/catalog/products/${productId}/metafields`);
  const isBundle = metafields.find((f: any) => f.key === 'is_bundle' && f.namespace === 'bundle')?.value === 'true';
  const linkedField = metafields.find((f: any) => f.key === 'linked_product_ids' && f.namespace === 'bundle');
  const linkedProductIds = linkedField ? JSON.parse(linkedField.value) : [];
  
  return { isBundle, linkedProductIds };
}

// Utility to get bundle info for a variant
async function getVariantBundleInfo(productId: number, variantId: number, bc: any) {
  const { data: metafields } = await bc.get(`/catalog/products/${productId}/variants/${variantId}/metafields`);
  const isBundle = metafields.find((f: any) => f.key === 'is_bundle' && f.namespace === 'bundle')?.value === 'true';
  const linkedField = metafields.find((f: any) => f.key === 'linked_product_ids' && f.namespace === 'bundle');
  const linkedProductIds = linkedField ? JSON.parse(linkedField.value) : [];

  return { isBundle, linkedProductIds };
}

// parseLinkedProduct function moved to lib/bundle-calculator.ts

// Helper function to get bundle category ID
async function getBundleCategoryId(bc: any) {
  const { data: categories } = await bc.get('/catalog/categories?limit=250');
  const bundleCategory = categories.find((c: any) => String(c?.name || '').toLowerCase() === 'bundle');
  
return bundleCategory?.id;
}

// Optimized function to update affected bundles with single API fetch
async function updateAffectedBundlesOptimized(updatedProductId: number, bc: any, storeHash: string, accessToken: string) {
  console.log(`[Product Update] Optimized update for product ${updatedProductId} and all its variants`);
  
  // Get bundle category ID (single call)
  const bundleCategoryId = await getBundleCategoryId(bc);
  if (!bundleCategoryId) {
    console.log(`[Product Update] No bundle category found, skipping bundle updates`);
    
return;
  }
  
  // Get all bundle products and their variants (single call each)
  const { data: bundleProducts } = await bc.get(`/catalog/products?categories:in=${bundleCategoryId}`);
  console.log(`[Product Update] Found ${bundleProducts.length} products in bundle category`);
  
  // Get variants for the updated product (single call)
  let updatedProductVariants = [];
  try {
    const { data: variants } = await bc.get(`/catalog/products/${updatedProductId}/variants`);
    updatedProductVariants = variants;
    console.log(`[Product Update] Found ${variants.length} variants for updated product ${updatedProductId}`);
  } catch (variantError) {
    console.warn(`[Product Update] Could not fetch variants for product ${updatedProductId}:`, variantError);
  }
  
  // Collect all bundle info in batches to minimize API calls
  const productBundles = [];
  const variantBundles = [];
  
  // Check each bundle product for metafields (batch these calls)
  for (const product of bundleProducts) {
    // Check product-level metafields
    const { isBundle: isProductBundle, linkedProductIds: productLinkedProductIds } = await getProductBundleInfo(product.id, bc);
    
    if (isProductBundle && productLinkedProductIds.length > 0) {
      productBundles.push({
        id: product.id,
        linkedProductIds: productLinkedProductIds
      });
      //console.log(`[Product Update] Found product bundle: ${product.id} with ${productLinkedProductIds.length} linked products`);
    }

    // Check variant-level metafields
    const { data: variants } = await bc.get(`/catalog/products/${product.id}/variants`);
    for (const variant of variants) {
      const { isBundle: isVariantBundle, linkedProductIds: variantLinkedProductIds } = await getVariantBundleInfo(product.id, variant.id, bc);
      
      if (isVariantBundle && variantLinkedProductIds.length > 0) {
        variantBundles.push({
          productId: product.id,
          variantId: variant.id,
          linkedProductIds: variantLinkedProductIds
        });
        //console.log(`[Product Update] Found variant bundle: ${product.id}:${variant.id} with ${variantLinkedProductIds.length} linked products`);
      }
    }
  }
  
  //console.log(`[Product Update] Total bundles found: ${productBundles.length} product bundles, ${variantBundles.length} variant bundles`);

  // Find all bundles affected by the updated product (including its variants)
  const affectedProductBundles = [];
  const affectedVariantBundles = [];
  
  // Check product bundles
  for (const bundle of productBundles) {
    const isAffected = bundle.linkedProductIds.some((linkedProduct: any) => {
      const targetProductId = typeof linkedProduct === 'object' ? linkedProduct.productId : linkedProduct;
      const targetVariantId = typeof linkedProduct === 'object' ? linkedProduct.variantId : null;
      
      // Check if bundle references the updated product (either as product or specific variant)
      if (targetProductId === updatedProductId) {
        if (targetVariantId) {
          // Bundle references a specific variant of the updated product
          return updatedProductVariants.some(v => v.id === targetVariantId);
        } else {
          // Bundle references the product itself
          return true;
        }
      }
      
return false;
    });
    
    if (isAffected) {
      affectedProductBundles.push(bundle);
    }
  }
  
  // Check variant bundles
  for (const bundle of variantBundles) {
    const isAffected = bundle.linkedProductIds.some((linkedProduct: any) => {
      const targetProductId = typeof linkedProduct === 'object' ? linkedProduct.productId : linkedProduct;
      const targetVariantId = typeof linkedProduct === 'object' ? linkedProduct.variantId : null;
      
      // Check if bundle references the updated product (either as product or specific variant)
      if (targetProductId === updatedProductId) {
        if (targetVariantId) {
          // Bundle references a specific variant of the updated product
          return updatedProductVariants.some(v => v.id === targetVariantId);
        } else {
          // Bundle references the product itself
          return true;
        }
      }
      
return false;
    });
    
    if (isAffected) {
      affectedVariantBundles.push(bundle);
    }
  }
  
  console.log(`[Product Update] Found ${affectedProductBundles.length} product bundles and ${affectedVariantBundles.length} variant bundles to update`);
  
  // Calculate and update product bundles using shared utility
  await recalculateProductBundles(affectedProductBundles, bc, storeHash, accessToken);

  // Calculate and update variant bundles using shared utility
  await recalculateVariantBundles(affectedVariantBundles, bc, storeHash, accessToken);
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    // Prevent webhook loops - skip if this update was triggered by our app
    const isFromApp = req.headers['x-bundle-app-update'] === 'true';
    if (isFromApp) {
      console.log('[Product Update] Skipping app-generated update to prevent loops');
      
return res.status(200).json({ message: 'Skipped app-generated update' });
    }

    const product = req.body.data;
    const scope = req.body.scope;
    const timestamp = req.body.created_at || Math.floor(Date.now() / 1000);
    
    // Extract store hash from producer field (format: "stores/7wt5mizwwn")
    const storeHash = req.body.producer?.split('/')[1];

    if (!product || !storeHash) {
      return res.status(400).json({ message: 'Missing required information' });
    }

    const productId = product.id;

    // Check for duplicate webhook before any processing (atomically registers if new)
    const { isDuplicate, webhookId } = await checkWebhookDuplicate(productId, storeHash, timestamp, scope);
    
    if (isDuplicate) {
      console.log(`[Product Update] Duplicate webhook detected for product ${productId}, skipping processing`);
      
return res.status(200).json({ message: 'Duplicate webhook ignored', webhookId });
    }
    
    // Webhook is now registered atomically - safe to process
    console.log(`[Product Update] Processing webhook ${webhookId} for product ${productId}`);


    // Get the access token for this store from the database
    const accessToken = await db.getStoreToken(storeHash);

    if (!accessToken) {
      return res.status(401).json({ message: 'Store not authorized' });
    }

    const bc = bigcommerceClient(accessToken, storeHash);

    // Handle product updates (covers both product and variant updates)
    if (scope === 'store/product/updated') {
      console.log(`[Product Update] Processing product update: product ${product.id}`);
      
      // Optimize: Get all data once and process all scenarios
      await updateAffectedBundlesOptimized(product.id, bc, storeHash, accessToken);
    }

    // Cleanup old webhook records periodically (1% chance per webhook)
    if (Math.random() < 0.01) {
      cleanupExpiredWebhooks(); // Don't await - run in background
    }

    res.status(200).json({ message: 'Bundle inventory updated successfully', webhookId });
  } catch (err: any) {
    console.error('[Product Update] Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
