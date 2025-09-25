import type { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient } from '../../../lib/auth';
import db from '../../../lib/db';

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

// Utility to parse linked product info
function parseLinkedProduct(linkedProduct: any) {
  return {
    productId: typeof linkedProduct === 'object' ? linkedProduct.productId : linkedProduct,
    variantId: typeof linkedProduct === 'object' ? linkedProduct.variantId : null,
    quantity: typeof linkedProduct === 'object' ? linkedProduct.quantity : 1,
  };
}

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
      console.log(`[Product Update] Found product bundle: ${product.id} with ${productLinkedProductIds.length} linked products`);
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
        console.log(`[Product Update] Found variant bundle: ${product.id}:${variant.id} with ${variantLinkedProductIds.length} linked products`);
      }
    }
  }
  
  console.log(`[Product Update] Total bundles found: ${productBundles.length} product bundles, ${variantBundles.length} variant bundles`);

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
  
  // Calculate and update product bundles
  if (affectedProductBundles.length > 0) {
    const productBundleUpdates = [];
    for (const bundle of affectedProductBundles) {
      let minPossibleBundles = Infinity;
      for (const linkedProduct of bundle.linkedProductIds) {
        const { productId: targetProductId, variantId: targetVariantId, quantity } = parseLinkedProduct(linkedProduct);
        
        if (targetVariantId) {
          const { data: linkedVariant } = await bc.get(`/catalog/products/${targetProductId}/variants/${targetVariantId}`);
          const possibleBundles = Math.floor(linkedVariant.inventory_level / quantity);
          minPossibleBundles = Math.min(minPossibleBundles, possibleBundles);
        } else {
          const { data: linkedProductObj } = await bc.get(`/catalog/products/${targetProductId}`);
          const possibleBundles = Math.floor(linkedProductObj.inventory_level / quantity);
          minPossibleBundles = Math.min(minPossibleBundles, possibleBundles);
        }
      }
      
      const newInventoryLevel = Math.max(0, minPossibleBundles);
      productBundleUpdates.push({
        id: bundle.id,
        inventory_level: newInventoryLevel
      });
      
      console.log(`[Product Update] Calculated product bundle ${bundle.id} inventory: ${newInventoryLevel}`);
    }

    // Bulk update product bundles
    console.log(`[Product Update] Bulk updating ${productBundleUpdates.length} product bundles`);
    
    const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products`, {
      method: 'PUT',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        'X-Bundle-App-Update': 'true'
      },
      body: JSON.stringify(productBundleUpdates)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Product Update] Failed to bulk update product bundles: ${response.status} - ${errorText}`);
    } else {
      console.log(`[Product Update] Successfully bulk updated ${productBundleUpdates.length} product bundles`);
    }
  }

  // Calculate and update variant bundles
  if (affectedVariantBundles.length > 0) {
    const variantUpdatesByProduct: Record<string, Array<{id: number, inventory_level: number}>> = {};
    
    for (const bundle of affectedVariantBundles) {
      let minPossibleBundles = Infinity;
      for (const linkedProduct of bundle.linkedProductIds) {
        const { productId: targetProductId, variantId: targetVariantId, quantity } = parseLinkedProduct(linkedProduct);
        
        if (targetVariantId) {
          const { data: linkedVariant } = await bc.get(`/catalog/products/${targetProductId}/variants/${targetVariantId}`);
          const possibleBundles = Math.floor(linkedVariant.inventory_level / quantity);
          minPossibleBundles = Math.min(minPossibleBundles, possibleBundles);
        } else {
          const { data: linkedProductObj } = await bc.get(`/catalog/products/${targetProductId}`);
          const possibleBundles = Math.floor(linkedProductObj.inventory_level / quantity);
          minPossibleBundles = Math.min(minPossibleBundles, possibleBundles);
        }
      }
      
      const newInventoryLevel = Math.max(0, minPossibleBundles);
      
      if (!variantUpdatesByProduct[bundle.productId]) {
        variantUpdatesByProduct[bundle.productId] = [];
      }
      variantUpdatesByProduct[bundle.productId].push({
        id: bundle.variantId,
        inventory_level: newInventoryLevel
      });
      
      console.log(`[Product Update] Calculated variant bundle ${bundle.productId}:${bundle.variantId} inventory: ${newInventoryLevel}`);
    }

    // Update variant bundles individually
    for (const [productId, variantUpdates] of Object.entries(variantUpdatesByProduct)) {
      console.log(`[Product Update] Updating ${variantUpdates.length} variants for product ${productId}`);
      
      for (const variantUpdate of variantUpdates) {
        try {
          const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products/${productId}/variants/${variantUpdate.id}`, {
            method: 'PUT',
            headers: {
              'X-Auth-Token': accessToken,
              'Content-Type': 'application/json',
              'X-Bundle-App-Update': 'true'
            },
            body: JSON.stringify({ inventory_level: variantUpdate.inventory_level })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Product Update] Failed to update variant ${variantUpdate.id} for product ${productId}: ${response.status} - ${errorText}`);
          } else {
            console.log(`[Product Update] Successfully updated variant ${variantUpdate.id} inventory to ${variantUpdate.inventory_level}`);
          }
        } catch (error) {
          console.error(`[Product Update] Error updating variant ${variantUpdate.id}:`, error);
        }
      }
    }
  }
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
    
    // Extract store hash from producer field (format: "stores/7wt5mizwwn")
    const storeHash = req.body.producer?.split('/')[1];

    if (!product || !storeHash) {
      return res.status(400).json({ message: 'Missing required information' });
    }

    console.log(`[Product Update] Received ${scope} webhook for product ${product.id} in store ${storeHash}`);
    console.log(`[Product Update] Webhook payload:`, JSON.stringify(product, null, 2));


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

    res.status(200).json({ message: 'Bundle inventory updated successfully' });
  } catch (err: any) {
    console.error('[Product Update] Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
