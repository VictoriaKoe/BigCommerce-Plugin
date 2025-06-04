/* eslint-disable no-console */
import {
  Box,
  Button,
  H4,
  Input,
  Panel,
  Small,
  Switch,
  Table,
  Text,
} from '@bigcommerce/big-design';
import { CloseIcon } from '@bigcommerce/big-design-icons';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import ErrorMessage from '@components/error';
import Loading from '@components/loading';
import { useProductInfo, useProductList } from '@lib/hooks';

const ProductAppExtension = () => {
  const router = useRouter();
  const productId = Number(router.query?.productId);
  const context = router.query?.context as string;

  const { error, isLoading, product } = useProductInfo(productId);
  const { name } = product ?? {};

  const [isBundle, setIsBundle] = useState(false);
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const { list = [], isLoading: isProductsLoading, error: productsError } = useProductList();
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Format available products for react-select (main products only)
  const products = useMemo(() => {
    return list
      .filter(({ id, sku }) => {
        // Exclude current product
        if (id === productId) return false;
        // Exclude products that are bundles (have BUN- prefix)
        if (sku?.startsWith('BUN-')) return false;

        return true;
      })
      .map(({ id, sku, name, price, inventory_level, variants, inventory_tracking }) => {
        return {
          value: id,
          label: name,
          sku,
          variants: variants || [],
          price,
          inventory_level,
          inventory_tracking
        };
      });
  }, [list, productId]);

  // Create combined options for products and their SKUs
  const combinedOptions = products.reduce((acc, product) => {
    // Add main product
    acc.push({
      value: `product-${product.value}`,
      label: `${product.label} [${product.sku}]`,
      productId: product.value,
      sku: product.sku,
      isMainProduct: true,
      inventory_level: product.inventory_level,
      inventory_tracking: product.inventory_tracking
    });

    // Add variants only if there are multiple variants
    if (Array.isArray(product.variants) && product.variants.length > 1) {
      product.variants.forEach(variant => {
        const variantSku = variant.sku || variant.option_values?.map(ov => ov.label).join('-');
        if (variantSku) {
          const variantName = variant.option_values?.map(ov => ov.label).join(' - ') || 'Variant';
          acc.push({
            value: `sku-${variantSku}`,
            label: `${product.label} [${variantName}] [${variantSku}]`,
            productId: product.value,
            sku: variantSku,
            isMainProduct: false,
            inventory_level: variant.inventory_level || 0,
            inventory_tracking: variant.inventory_tracking || product.inventory_tracking,
            variantId: variant.id
          });
        }
      });
    }

    return acc;
  }, []);

  // Handle item selection
  const handleItemSelect = (selectedItem) => {
    if (!selectedItem) return;

    // For variants, we need to check both the variant and product level
    const product = products.find(p => p.value === selectedItem.productId);
    if (!product) return;

    // Check if product has multiple variants (more than 1)
    const hasMultipleVariants = product.variants && product.variants.length > 1;

    // Check inventory tracking
    const hasInventoryTracking = selectedItem.isMainProduct
      ? product.inventory_tracking === "product" // Main product enabled if product tracking
      : hasMultipleVariants && product.inventory_tracking === "variant"; // Variants enabled only if multiple variants with variant tracking

    if (!hasInventoryTracking) {
      alert("This product/variant cannot be added to bundles because it has inventory tracking disabled.");
      setSelectedItem(null);

      return;
    }

    const newProduct = {
      ...product,
      selectedSku: selectedItem.sku,
      skuLabel: selectedItem.sku,
      label: selectedItem.label,
      inventory_tracking: product.inventory_tracking
    };

    setLinkedProducts([...linkedProducts, newProduct]);
    setProductQuantities(prev => ({
      ...prev,
      [product.value]: 1
    }));

    // Reset selection
    setSelectedItem(null);
  };

  // ✅ Load existing metafields on load
  useEffect(() => {
    async function fetchMetafields() {
      if (!productId || products.length === 0) return;

      try {
        const res = await fetch(`/api/productAppExtension/${productId}/metafields?context=${encodeURIComponent(context)}`);
        const data = await res.json();

        if (res.ok) {
          setIsBundle(data.isBundle);
          // First set the quantities to ensure they're available
          setProductQuantities(data.productQuantities || {});
          // Then set the linked products
          setLinkedProducts(
            data.linkedProductIds.map((id) => {
              const match = products.find(p => p.value === id);
              const product = match ?? { value: id, label: `Product ${id}` };
              // Ensure each linked product has at least a quantity of 1
              if (!data.productQuantities?.[id]) {
                setProductQuantities(prev => ({
                  ...prev,
                  [id]: 1
                }));
              }

              return product;
            })
          );
        } else {
          console.warn('Failed to load metafields:', data.message);
        }
      } catch (err) {
        console.error('Error fetching metafields:', err);
      }
    }

    fetchMetafields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, products]);

  const handleQuantityChange = (productId, quantity) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, parseInt(quantity) || 1)
    }));
  };

  // Submit metafield data
  const handleSave = async () => {
    setSaving(true);
    try {
      // If bundle is off or no products are linked, treat as not a bundle
      const isActuallyBundle = isBundle && linkedProducts.length > 0;

      // Save metafields with quantities
      const metafieldsRes = await fetch(`/api/productAppExtension/${productId}/metafields?context=${encodeURIComponent(context)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isBundle: isActuallyBundle,
          linkedProductIds: linkedProducts.map((p) => p.value),
          productQuantities
        }),
      });

      if (!metafieldsRes.ok) {
        throw new Error(await metafieldsRes.text());
      }

      // Update product SKU and inventory level
      const currentSku = product?.sku || '';
      const hasBunPrefix = currentSku.startsWith('BUN-');
      let newSku = currentSku;

      if (isActuallyBundle && !hasBunPrefix) {
        newSku = `BUN-${currentSku}`;
      } else if (!isActuallyBundle && hasBunPrefix) {
        newSku = currentSku.replace('BUN-', '');
      }

      // Calculate minimum stock level for bundles and prepare update data
      const updateData: any = {};

      // Update SKU if changed
      if (newSku !== currentSku) {
        updateData.sku = newSku;
      }

      // Handle inventory based on bundle status
      if (isActuallyBundle) {
        // Fetch current stock levels from BigCommerce API
        const stockLevels = await Promise.all(
          linkedProducts.map(async (p) => {
            const res = await fetch(`/api/products/${p.value}?context=${encodeURIComponent(context)}`);
            if (!res.ok) {
              console.warn(`Failed to fetch stock for product ${p.value}`);

              return 0;
            }
            const data = await res.json();

            // Consider quantity when calculating available bundles
            return Math.floor((data.inventory_level ?? 0) / (productQuantities[p.value] || 1));
          })
        );

        const minStock = Math.min(...stockLevels);
        updateData.inventory_level = minStock;
        updateData.inventory_tracking = "product";
        updateData.is_visible = true;
      } else {
        // Reset inventory settings when not a bundle
        updateData.inventory_tracking = "none";
        updateData.inventory_level = null;
      }

      console.log("Updating with data:", updateData);

      // Make API call to update product
      const updateProductRes = await fetch(`/api/products/${productId}?context=${encodeURIComponent(context)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!updateProductRes.ok) {
        throw new Error(await updateProductRes.text());
      }

      // Show appropriate success message
      if (isActuallyBundle) {
        alert(`Product has been saved as a bundle with ${linkedProducts.length} product(s).`);
      } else {
        alert('Product has been saved as a regular product (not a bundle).');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || isProductsLoading) return <Loading />;
  if (error || productsError) return <ErrorMessage error={error || productsError} />;

  return (
    <>
      <Panel header="Basic Information" marginBottom="small">
        <H4>Product name</H4>
        <Text>{name}</Text>
      </Panel>

      <Panel header="Bundle Settings">
        <Box marginBottom="medium">
          <H4>Is this product a bundle?</H4>
          <Switch
            checked={isBundle}
            onChange={() => setIsBundle((prev) => !prev)}
          />
        </Box>

        {isBundle && (
          <Box marginBottom="medium">
            <H4>Select products and quantities for this bundle</H4>

            <Box marginBottom="medium">
              <Select
                isSearchable
                options={combinedOptions.filter(option =>
                  // Filter out products that are already linked
                  !linkedProducts.find(lp => lp.selectedSku === option.sku)
                )}
                value={selectedItem}
                onChange={handleItemSelect}
                placeholder="Search and select a product or SKU..."
                noOptionsMessage={() => "No products available. Note: Products must have inventory tracking enabled to be added to bundles."}
                formatOptionLabel={(option) => {
                  const product = products.find(p => p.value === option.productId);
                  const hasMultipleVariants = product?.variants && product.variants.length > 1;
                  const hasInventoryTracking = option.isMainProduct
                    ? product?.inventory_tracking === "product"
                    : hasMultipleVariants && product?.inventory_tracking === "variant";

                  return (
                    <div style={{
                      opacity: hasInventoryTracking ? 1 : 0.5,
                      color: hasInventoryTracking ? "inherit" : "#666"
                    }}>
                      {option.label}
                      {!hasInventoryTracking && (
                        <Small color="secondary" style={{ marginLeft: "8px" }}>
                          (Inventory tracking disabled)
                        </Small>
                      )}
                    </div>
                  );
                }}
              />
              <Small marginTop="small" color="secondary">
                Note: Only products with inventory tracking enabled can be added to bundles.
              </Small>
            </Box>

            {/* Bundle Items Table */}
            <Box marginTop="medium">
              {linkedProducts.length > 0 && (
                <Table
                  columns={[
                    { header: 'Product', hash: 'product', render: ({ label }) => label },
                    { header: 'SKU', hash: 'sku', render: ({ skuLabel }) => skuLabel },
                    {
                      header: 'Quantity',
                      hash: 'quantity',
                      width: '200px',
                      render: ({ value }) => (
                        <Input
                          type="number"
                          min="1"
                          value={productQuantities[value] || 1}
                          onChange={(e) => handleQuantityChange(value, e.target.value)}
                          style={{ width: '120px' }}
                        />
                      )
                    },
                    {
                      header: '',
                      hash: 'actions',
                      width: '50px',
                      render: ({ value }) => (
                        <button
                          onClick={() => setLinkedProducts(linkedProducts.filter(p => p.value !== value))}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#D92D20'
                          }}
                        >
                          <CloseIcon />
                        </button>
                      )
                    }
                  ]}
                  items={linkedProducts}
                />
              )}
            </Box>
          </Box>
        )}

        <Button
          isLoading={saving}
          disabled={saving}
          onClick={handleSave}
          marginTop="medium"
        >
          Save
        </Button>
      </Panel>
    </>
  );
};

export default ProductAppExtension;
