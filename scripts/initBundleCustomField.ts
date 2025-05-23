const { bigcommerceClient } = require('../lib/auth');

async function initBundleCustomField() {
  try {
    const bc = bigcommerceClient(process.env.ACCESS_TOKEN!, process.env.STORE_HASH!);
    
    // Check if the custom field already exists
    const { data: existingFields } = await bc.get('/catalog/products/custom-fields');
    const bundleField = existingFields.find((field: any) => field.name === 'is_bundle');
    
    if (bundleField) {
      console.log('Bundle custom field already exists');
      return;
    }
    
    // Create the custom field
    const customField = {
      name: 'is_bundle',
      type: 'boolean',
      required: false,
      description: 'Indicates whether this product is a bundle'
    };
    
    const { data } = await bc.post('/catalog/products/custom-fields', customField);
    console.log('Successfully created bundle custom field:', data);
    
  } catch (error: any) {
    console.error('Error creating bundle custom field:', error.response?.data || error.message);
  }
}

// Run the initialization
initBundleCustomField(); 