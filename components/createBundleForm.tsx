import {
  Box, Button, Flex, FlexItem, FormGroup, H3, Input, Panel, Select, Table, Text,
} from '@bigcommerce/big-design';

  import { useEffect, useMemo, useState } from 'react';
  
  type SKUOption = {
    value: string;
    content: string;
  };
  
  type SKUItem = {
    sku: string;
    name: string;
    price: number;
    quantity: number;
    stock: number;
  };
  
  interface BundleFormProps {
    availableSKUs: { sku: string; name: string; price: number; stock: number }[];
    onSubmit: (bundle: { name: string; items: SKUItem[]; price: number }) => void;
    onCancel: () => void;
    initialData?: {
      name: string;
      price: number;
      items: { sku: string; quantity: number }[];
    };
  }
  
  const CreateBundleForm = ({ availableSKUs, onSubmit, onCancel, initialData }: BundleFormProps) => {
    const [selectedSKU, setSelectedSKU] = useState<string | null>(null);
    const [bundleName, setBundleName] = useState(initialData?.name || '');
    const [bundleItems, setBundleItems] = useState<SKUItem[]>([]);
    const [customPrice, setCustomPrice] = useState<number | null>(initialData ? initialData.price : null);  
  
    const skuOptions: SKUOption[] = useMemo(
      () =>
        availableSKUs.map(({ sku, name, stock }) => ({
          value: sku,
          content: stock > 0
            ? `${sku} - ${name} (${stock} in stock)`
            : `⚠️ ${sku} - ${name} (Out of stock)`,
        })),
      [availableSKUs]
    );
    
// inside CreateBundleForm component
  useEffect(() => {
    if (initialData && availableSKUs.length > 0) {
      const loadedItems = initialData.items.map(item => {
        const matchedSKU = availableSKUs.find(p => p.sku === item.sku);

        return {
          sku: item.sku,
          name: matchedSKU?.name || '',
          price: matchedSKU?.price || 0,
          quantity: item.quantity,
          stock: matchedSKU?.stock || 0,
        };
      });

      setBundleItems(loadedItems);
    }
  }, [initialData, availableSKUs]);

  
    const handleAddSKU = () => {
      if (!selectedSKU) return;
  
      const item = availableSKUs.find((s) => s.sku === selectedSKU);
      if (!item) return;
  
      const alreadyExists = bundleItems.some((i) => i.sku === selectedSKU);
      if (alreadyExists) return;
  
      setBundleItems([...bundleItems, { ...item, quantity: 1, stock: item.stock }]);
      setSelectedSKU(null);
    };
  
    const handleQuantityChange = (sku: string, quantity: number) => {
      setBundleItems((items) =>
        items.map((item) =>
          item.sku === sku
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      );
    };    
  
    const handleRemoveSKU = (sku: string) => {
      setBundleItems((items) => items.filter((item) => item.sku !== sku));
    };
  
    const totalPrice = useMemo(
      () => bundleItems.reduce((sum, { price, quantity }) => sum + price * quantity, 0),
      [bundleItems]
    );
  
    const submitButtonLabel = initialData ? 'Update Bundle' : 'Save Bundle';

    return (
      <Panel header="Create New Bundle">
        <FormGroup>
          <Input
            label="Bundle Name"
            name="bundleName"
            value={bundleName}
            onChange={(e) => setBundleName(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
        <Input
          label="Override Total Price"
          type="number"
          placeholder="Enter custom price"
          value={customPrice ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            setCustomPrice(value ? parseFloat(value) : null);
          }}
          iconLeft="$"
        />
      </FormGroup>

      <FormGroup>
        <Flex alignItems="flex-end">
          <FlexItem flexGrow={1} marginRight="small">
            <Select
              label="Add SKU"
              options={skuOptions}
              value={selectedSKU}
              onOptionChange={setSelectedSKU}
            />
          </FlexItem>
          <Button
            marginTop="large"
            onClick={handleAddSKU}
            disabled={!selectedSKU}
          >
            Add SKU
          </Button>
        </Flex>
      </FormGroup>


  
        <Box marginVertical="large">
          {bundleItems.length > 0 ? (
            <Table
              columns={[
                { header: 'SKU', hash: 'sku', render: ({ sku }) => <Text>{sku}</Text> },
                { header: 'Name', hash: 'name', render: ({ name }) => <Text>{name}</Text> },
                {
                  header: 'Quantity',
                  hash: 'quantity',
                  render: ({ sku, quantity, stock }) => (
                    <Box>
                      <Input
                        type="number"
                        value={quantity}
                        min={1}
                        onChange={(e) =>
                          handleQuantityChange(sku, parseInt(e.target.value))
                        }
                      />
                      {quantity > stock && (
                        <Text marginTop="xxSmall" color="danger">
                          Warning: Exceeds current stock ({stock})
                        </Text>
                      )}
                    </Box>
                  ),
                },
                {
                  header: 'Price',
                  hash: 'price',
                  render: ({ price, quantity }) => (
                    <Text>${(price * quantity).toFixed(2)}</Text>
                  ),
                },
                {
                  header: 'Remove',
                  hash: 'remove',
                  render: ({ sku }) => (
                    <Button variant="subtle" onClick={() => handleRemoveSKU(sku)}>
                      Remove
                    </Button>
                  ),
                },
              ]}
              items={bundleItems}
              itemName="SKU"
              stickyHeader
            />
          ) : (
            <Text>No SKUs added yet.</Text>
          )}
        </Box>
  
        <H3>Calculated Price: ${totalPrice.toFixed(2)}</H3>
  
        <Box marginTop="large" display="flex">
          <Button variant="subtle" onClick={onCancel} marginRight="medium">
            Cancel
          </Button>
          <Button
            disabled={!bundleName || bundleItems.length === 0}
            onClick={() =>
              onSubmit({
                name: bundleName,
                items: bundleItems,
                price: customPrice !== null ? customPrice : totalPrice,
              })
            }
          >
            {submitButtonLabel}
          </Button>

        </Box>
      </Panel>
    );
  };
  
  export default CreateBundleForm;
  