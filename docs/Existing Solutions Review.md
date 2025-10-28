# 

# 

# 

# **BigCommerce Plugin for ChessWorld SKU Management**

     **Existing Solutions Review **	  
Version 4.0

**Written by:**  
Rui En Koe  
Alex Chan  
Ashley Warden  
Liangdi Wang  
Luqmaan Yurzaa  
Wen Cheng Huong 

### 

# **Document History and Version Control**

| Date (dd/mm/yy) | Version | Author | Description |
| :---- | :---- | :---- | :---- |
| 09/04/2025 | 1.0 |  Luqmaan Yurzaa | Initial Existing Solutions Review |
| 16/04/2025 | 2.0 | Wen Cheng Huong   | Update Existing Solutions Review: Listed all the limitations under the 'Limitations of Existing Bundle Management Apps' section based on the client’s feedback  |

# **Contents**

**[1\. Purpose	3](#1.-purpose)**

[**2\. Evaluation Criteria	3**](#2.-evaluation-criteria)

[**3\. Plugin Comparison Table	4**](#3.-plugin-comparison-table)

[**4\. Key Observations	5**](#4.-key-observations)

[**5\. Implications for Our Plugin	5**](#5.-implications-for-our-plugin)

[**6\. Limitations of Existing Bundle Management Apps	6**](#6.-limitations-of-existing-bundle-management-apps)

### 

### 

# 

# **1\. Purpose** {#1.-purpose}

This document evaluates two existing BigCommerce apps that support product bundling and SKU-level inventory management. The goal is to understand their features, identify limitations, and clarify opportunities for differentiation in our custom plugin designed for **Chess World**.

# **2\. Evaluation Criteria** {#2.-evaluation-criteria}

We’ve selected key evaluation points most relevant to Chess World’s needs:

* SKU-level inventory synchronization

* Flexibility in bundle configuration

* Real-time stock updates

* User interface and customization

* BigCommerce integration quality

* Pricing

## 

# **3\. Plugin Comparison Table** {#3.-plugin-comparison-table}

| Feature / Plugin | Integer Bundle Buddy | Kit Builder |
| ----- | ----- | ----- |
| **SKU-level inventory sync** | Real SKUs used in bundles | Real-time sync with automatic updates |
| **Custom bundle configuration** | Flexible, variant-based, optional/mandatory components | Basic configuration by selecting component SKUs |
| **Real-time stock updates** | Manual management or CSV import | Fully automated with dynamic quantity updates |
| **UI / Customization** | Custom labels/views, searchable kits | Functional but less focused on UI customization |
| **Ease of Use** | Spreadsheet-like overview | Practical but more technical |
| **BigCommerce Integration** | Standard with some limitations (no multi-storefront) | Standard with auto stock push (limited multi-storefront support) |
| **Pricing** | Custom pricing, 1-month free trial | $20–$50/month, 14-day free trial |
| **Notable Extras** | CSV import, SKU search, duplicate kits | Auto restock after cancellations, assembly reports |

# 

# 

# 

# 

## 

# **4\. Key Observations** {#4.-key-observations}

* **Integer Bundle Buddy** is more customizable in terms of UI and component-level configuration but lacks fully automated stock syncing.

* **Kit Builder** focuses on **automated inventory control**, which is critical for preventing overselling—something ChessWorld has explicitly identified as a major pain point.

* Neither app seems to provide a truly **seamless UX tailored to chess sets**, which often mix reusable SKUs (e.g., chess boards) across bundles.

* Multi-storefront compatibility is limited in both apps.

# **5\. Implications for Our Plugin** {#5.-implications-for-our-plugin}

The plugin we are developing for ChessWorld stands out by combining the **automation strengths of Kit Builder** with the **UI simplicity and configurability of Integer Bundle Buddy**, while adding features tailored for our use case:

| Target Feature in Our Plugin | Description |
| ----- | ----- |
| Real-time SKU-level synchronization | Prevents overselling by updating stock across bundles and single SKUs |
| Spreadsheet-style UI | Simplifies bulk management of kits and individual SKUs |
| Mix-and-match support for bundles | Allows flexible configurations, ideal for chess set combinations |
| Automated updates \+ manual override option | Best of both worlds: automation with control |
| Tailored to ChessWorld’s operational workflow | Designed based on stakeholder interviews and problem analysis |

## 

# **6\. Limitations of Existing Bundle Management Apps** {#6.-limitations-of-existing-bundle-management-apps}

Based on client’s research and testing of existing bundle management solutions—particularly *Integer Bundle Buddy* and similar plugins—they identified several key limitations that make them unsuitable for their intended everyday use case.

**1\. Designed for Occasional Use, Not Core System Integration**

* These tools are primarily built to support **“standard bundles”** used for occasional promotions or offers.  
* This makes them ill-suited for our system, where SKUs are **core building blocks** used daily and expected to integrate seamlessly into our product workflow.

**2\. Disconnected and Complex Interface**

* For example, *Integer Bundle Buddy* requires managing bundles from within its **own app interface**, outside the standard product management system.  
* This creates an inconsistent and confusing user experience, especially for users who need to interact with these bundles regularly.

**3\. Sales Tracking Limitations**

* Sales monitoring is a major pain point:  
  * Currently, tracking the performance of a SKU involves **checking each product** it appears in and manually summing up the data.  
  * Existing tools do not support **centralized, SKU-level sales reporting**.  
  * A more effective solution would allow SKUs to exist **independently** and track their sales across all products they are part of.  
  * Ideally, SKU reporting would also include breakdowns **per product**, giving deeper insights into SKU performance.

**4\. Past Evaluation Findings**

* During past evaluations, there were also **issues with stock counting**, though the exact nature of the problem is not clearly remembered.  
* Another plugin was ruled out during early research, though the reason wasn’t documented—this can be revisited if necessary.

