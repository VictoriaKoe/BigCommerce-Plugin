

# 

# 1\. Getting Started 

## 1.1 How to Access the Test Environment

Log into the BigCommerce test store at [https://login.bigcommerce.com/login](https://login.bigcommerce.com/login), then select the BigCommercePlugin sandbox store.

## 1.2 How to Access in the Live Production Environment

Install BundleSync on the BigCommerce platform, and the plugin will be ready to use.

# 2\. Products Management

## 2.1 Creating a Product 

* To create a **new regular product**, follow the **standard product creation process** (no need to use the Product Bundle Manager plugin).

* To create a **bundled product**:

1. Create a **new empty product** that you intend to serve as the **bundled product.** 

2. Add **any variants** you need.

3. Follow the steps below to complete the bundled product setup.

## 2.2 Creating a Bundled Product

***\*\* Reminder**: A product representing the bundle must be created before proceeding.* 

1. **Click** the **more icon button (...)** in the last column. 

2. **Scroll down** the side panel. 

3. **Select** the **Product Bundle Manager** (the plugin to manage bundled product SKUs).

4. **Set** the **product** to **bundle** by pressing the **toggle button** under the **“Is this product a bundle?”** prompt.

5. After toggling the button, you can **view** a few **variant options** to configure the bundle properties. Select a **variant** to **proceed** with the **configuration**. 

6. **Use** the **input field** to **search for and select** the **desired products/SKUs** to **include** in the **bundled item**. 

*\*\*Only products with inventory tracking enabled can be added to bundles.*  
   

7. **Set** the **desired quantities** of each product in the bundle in their **respective quantity fields**, and **click** the **save button** once all bundle contents are chosen. 

*\*\*All variants must be filled out before saving.*  

8. After a **confirmation prompt** appears, the **product settings** have been **saved** to the **database**. **Refresh** the **page** to update the details in the product page.


9. The **products page** is **updated** with the **respective remaining stock** for **each bundle** determined by the **minimum stock level** out of the components. 


## 2.3 Creating a Discount

1. Navigate to the **plugin page** via the side menu **(Apps → BundleSync)**  

2. Select the **Discounts tab** or click the **“Go to Discounts” button**.  

3. Fill in all relevant information regarding the discount using the form provided.

4. Create the discount using the **“Create Discount” button** on the bottom right corner of the form.  

5. Refresh the discounts list using the **“Refresh” button** or **refreshing the page**. 
 
6. Check and manage the discounts created using the menu available in the discount list, including activating, reactivating, deactivating and deleting specific discounts.

# 3\. Plugin Testing

## 3.1 Purchasing Products

1. Click the product you want to purchase.

2. Select the desired product options and quantity.

3. Click the **Add to Cart** button on the product page.

4. Proceed to checkout by clicking **Proceed to purchase** or **check out now** in the cart.

5. Enter your payment details on the checkout page and complete the purchase.

6. Return to the store page.

## 3.2 Store Page

1. Refresh the store page.

2. The stock levels of both the bundled product and its individual components will be updated according to the quantity purchased.

---

By following this guide, you will be able to efficiently manage SKU-level inventory tracking within bundled products using the BigCommerce plugin. If you have any questions, please contact us via email, our team will promptly address your concerns. 
