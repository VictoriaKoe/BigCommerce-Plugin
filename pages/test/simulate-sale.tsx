import {
  Box,
  Button,
  Form,
  FormGroup,
  H1,
  H4,
  Input,
  Panel,
  Select,
  Small,
  Text,
} from '@bigcommerce/big-design';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { bigcommerceClient, getSession } from '../../lib/auth';

export const getServerSideProps = async (context) => {
  const { accessToken, storeHash } = await getSession(context.req);
  const bc = bigcommerceClient(accessToken, storeHash);

  try {
    // Fetch all products
    const { data: products } = await bc.get('/catalog/products?limit=250');

    // Format products for the select dropdown
    const formattedProducts = products.map(product => ({
      value: product.id,
      label: `${product.name} (ID: ${product.id}) - Stock: ${product.inventory_level}`,
      isBundle: product.sku?.startsWith('BUN-') || false
    }));

    return {
      props: {
        products: formattedProducts
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);

    return {
      props: {
        products: []
      }
    };
  }
};

const SimulateSale = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test/simulate-sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: Number(quantity)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to simulate sale');
      }

      setResult(data);
      // Refresh the page to get updated stock levels
      router.replace(router.asPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box padding="large">
      <H1>Test: Simulate Product Sale</H1>
      <Panel>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Select
              label="Select Product"
              required
              options={products}
              value={products.find(p => p.value === selectedProduct)}
              onOptionChange={(selected) => setSelectedProduct(selected?.value)}
            />
            <Small>
              {selectedProduct && products.find(p => p.value === selectedProduct)?.isBundle
                ? '📦 This is a bundle product'
                : ''}
            </Small>
          </FormGroup>

          <FormGroup>
            <Input
              label="Quantity"
              type="number"
              min="1"
              required
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
            />
          </FormGroup>

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!selectedProduct || isLoading}
          >
            Simulate Sale
          </Button>
        </Form>

        {error && (
          <Box marginTop="medium">
            <Text color="danger">{error}</Text>
          </Box>
        )}

        {result && (
          <Box marginTop="medium">
            <H4>Sale Simulated Successfully</H4>
            <Text>Order ID: {result.details.simulatedOrderId}</Text>
            <Text>Product ID: {result.details.productId}</Text>
            <Text>Quantity: {result.details.quantity}</Text>
            <Small>Refresh the page to see updated stock levels</Small>
          </Box>
        )}
      </Panel>

      <Box marginTop="large">
        <Button variant="secondary" onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default SimulateSale; 