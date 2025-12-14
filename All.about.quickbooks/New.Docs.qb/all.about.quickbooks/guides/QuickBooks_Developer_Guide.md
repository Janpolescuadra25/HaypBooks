# QuickBooks Online Developer Guide

*API Development, Integration, and Enterprise Features*

---

## Document Information

**Version**: 3.0  
**Last Updated**: September 1, 2025  
**Target Audience**: Developers, IT Architects, System Integrators  
**Skill Level**: Advanced - Technical  
**Document Purpose**: Complete API reference and integration guide

---

## Developer Overview

This developer guide provides comprehensive documentation for integrating with QuickBooks Online through APIs, building custom applications, and implementing enterprise-level features. Designed for developers who need to extend, integrate, or customize QuickBooks functionality.

### What You'll Learn
- **API Architecture**: Complete REST API reference and usage
- **Authentication**: OAuth 2.0 implementation and security
- **Integration Patterns**: Best practices for system integration
- **Enterprise Features**: Advanced functionality for large organizations
- **Development Tools**: SDKs, tools, and development environments

---

## Related Documentation

### Core Guides
- **[QuickBooks User Guide](QuickBooks_User_Guide.md)** - Essential workflows and daily operations
- **[QuickBooks Admin Guide](QuickBooks_Admin_Guide.md)** - Advanced configuration and management
- **[QuickBooks Reference Guide](QuickBooks_Reference_Guide.md)** - Quick reference and troubleshooting

### Specialized Guides
- **[Complete Accounting Cycle Guide](QuickBooks_Complete_Accounting_Cycle_Guide.md)** - End-to-end accounting processes
- **[Financial Reporting Guide](QuickBooks_Financial_Reporting_Analysis_Guide.md)** - Advanced reporting and analysis
- **[Advanced Features Guide](QuickBooks_Advanced_Features_Conversions_Guide.md)** - Complex transactions and automation

### Industry-Specific Guides
- **[Retail & E-commerce Guide](QuickBooks_Retail_Ecommerce_Guide.md)** - Retail-specific configurations
- **[Professional Services Guide](QuickBooks_Professional_Services_Guide.md)** - Service industry workflows
- **[Construction Guide](QuickBooks_Construction_Contracting_Guide.md)** - Construction-specific processes
- **[Healthcare Guide](QuickBooks_Healthcare_Guide.md)** - Healthcare compliance and billing

### Implementation & Training
- **[Implementation Roadmap](QuickBooks_Implementation_Roadmap.md)** - Project planning and deployment
- **[Training & Certification Guide](QuickBooks_Training_Certification_Guide.md)** - User training programs
- **[Troubleshooting Guide](QuickBooks_Troubleshooting_Support_Guide.md)** - Problem-solving and support

---

---

## Table of Contents

### API Fundamentals
1. [API Architecture Overview](#api-architecture-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints & Resources](#api-endpoints--resources)
4. [Rate Limiting & Throttling](#rate-limiting--throttling)

### Development Tools
5. [SDKs & Libraries](#sdks--libraries)
6. [Development Environment](#development-environment)
7. [Testing & Sandbox](#testing--sandbox)
8. [API Explorer](#api-explorer)

### Integration Patterns
9. [Real-Time Synchronization](#real-time-synchronization)
10. [Batch Processing](#batch-processing)
11. [Webhook Integration](#webhook-integration)
12. [Error Handling](#error-handling)

### Enterprise Features
13. [Multi-Company Support](#multi-company-support)
14. [Advanced User Management](#advanced-user-management)
15. [Custom Workflows](#custom-workflows)
16. [Audit & Compliance](#audit--compliance)

### Advanced Integrations
17. [E-Commerce Integration](#e-commerce-integration)
18. [ERP Integration](#erp-integration)
19. [CRM Integration](#crm-integration)
20. [Payment Processing](#payment-processing)

### Security & Best Practices
21. [API Security](#api-security)
22. [Data Privacy](#data-privacy)
23. [Performance Optimization](#performance-optimization)
24. [Monitoring & Logging](#monitoring--logging)

---

## API Architecture Overview

### RESTful API Design

QuickBooks Online provides a comprehensive REST API that enables developers to integrate deeply with the platform, automate workflows, and build custom applications. The API follows RESTful principles and supports OAuth 2.0 authentication for secure access.

#### Core Principles
- **RESTful Design**: Uses HTTP methods (GET, POST, PUT, DELETE) for resource manipulation
- **JSON Format**: All data exchange uses JSON format for requests and responses
- **Stateless**: Each API call is independent and contains all necessary information
- **Resource-Based**: API endpoints correspond to business entities (customers, invoices, etc.)
- **Versioned**: API versioning ensures backward compatibility

#### API Base URL
```
https://quickbooks.api.intuit.com/v3/company/{companyId}
```

#### HTTP Methods
- **GET**: Retrieve resources or collections
- **POST**: Create new resources
- **PUT**: Update existing resources
- **DELETE**: Remove resources (soft delete)
- **PATCH**: Partial resource updates

### Data Model Architecture

#### Entity Relationships
The QuickBooks data model is built around interconnected business entities that reflect real-world business relationships.

##### Core Entities
- **Company**: Root entity containing all business data
- **Customer**: Represents customers and clients
- **Vendor**: Represents suppliers and service providers
- **Employee**: Represents company employees
- **Item**: Represents products and services
- **Account**: Represents chart of accounts entries

##### Transaction Entities
- **Invoice**: Customer billing documents
- **Bill**: Vendor billing documents
- **Payment**: Customer and vendor payment records
- **JournalEntry**: General ledger journal entries
- **Estimate**: Customer price quotes
- **PurchaseOrder**: Vendor purchase orders

##### Supporting Entities
- **Department**: Organizational departments
- **Class**: Transaction classification categories
- **TaxCode**: Tax rate and jurisdiction definitions
- **Term**: Payment term definitions
- **Attachable**: File attachments and documents

#### Data Relationships
```
Company
├── Customers
│   ├── Invoices
│   │   ├── Payments
│   │   └── CreditMemos
│   └── Estimates
├── Vendors
│   ├── Bills
│   │   ├── Payments
│   │   └── VendorCredits
│   └── PurchaseOrders
├── Employees
│   └── PayrollItems
├── Items
└── Accounts
    └── JournalEntries
```

## Authentication & Authorization

### OAuth 2.0 Implementation

QuickBooks Online uses OAuth 2.0 for secure API authentication, providing delegated access without sharing user credentials.

#### Authorization Flow
1. **Client Registration**: Register application in QuickBooks Developer Portal
2. **Authorization Request**: Redirect user to QuickBooks authorization URL
3. **User Consent**: User grants permission to access their QuickBooks data
4. **Authorization Code**: Receive authorization code from QuickBooks
5. **Token Exchange**: Exchange authorization code for access and refresh tokens
6. **API Access**: Use access token to make authenticated API calls

#### Authorization URL
```
https://appcenter.intuit.com/connect/oauth2
```

#### Token Management
- **Access Token**: Short-lived token for API access (1 hour)
- **Refresh Token**: Long-lived token for obtaining new access tokens (100 days)
- **Token Refresh**: Automatic token renewal before expiration
- **Token Revocation**: Secure token invalidation when no longer needed

### Scopes and Permissions

#### Available Scopes
- **com.intuit.quickbooks.accounting**: Full accounting access
- **com.intuit.quickbooks.payroll**: Payroll data access
- **com.intuit.quickbooks.payment**: Payment processing access
- **com.intuit.quickbooks.payroll.employee**: Employee data access
- **com.intuit.quickbooks.payroll.company**: Company payroll settings

#### Scope Examples
```javascript
// Full accounting access
scope: 'com.intuit.quickbooks.accounting'

// Read-only access
scope: 'com.intuit.quickbooks.accounting.read'

// Payroll access
scope: 'com.intuit.quickbooks.payroll com.intuit.quickbooks.payroll.employee'
```

### Multi-Tenant Support

#### Company Context
- **Company ID**: Unique identifier for each QuickBooks company
- **Realm ID**: OAuth 2.0 equivalent of company ID
- **Context Switching**: Access multiple companies with single authentication
- **Data Isolation**: Complete data separation between companies

#### Multi-Company Authentication
```javascript
// Authenticate for specific company
const authUrl = `https://appcenter.intuit.com/connect/oauth2?companyId=${companyId}`;

// API calls include company context
const apiUrl = `https://quickbooks.api.intuit.com/v3/company/${companyId}/customer`;
```

## API Endpoints & Resources

### Core Business Objects

#### Customer Management
```javascript
// Create customer
POST /v3/company/{companyId}/customer
{
  "Name": "ABC Company",
  "CompanyName": "ABC Company Inc.",
  "BillAddr": {
    "Line1": "123 Main St",
    "City": "Anytown",
    "CountrySubDivisionCode": "CA",
    "PostalCode": "12345"
  }
}

// Retrieve customer
GET /v3/company/{companyId}/customer/{customerId}

// Update customer
POST /v3/company/{companyId}/customer/{customerId}
{
  "Id": "123",
  "Name": "Updated Company Name"
}
```

#### Invoice Management
```javascript
// Create invoice
POST /v3/company/{companyId}/invoice
{
  "CustomerRef": {
    "value": "123"
  },
  "Line": [
    {
      "DetailType": "SalesItemLineDetail",
      "SalesItemLineDetail": {
        "ItemRef": {
          "value": "456"
        },
        "Qty": 2,
        "UnitPrice": 100.00
      },
      "Amount": 200.00
    }
  ]
}

// Retrieve invoices with filtering
GET /v3/company/{companyId}/invoice?fetchAll=true&where=TotalAmt > '100'
```

#### Payment Processing
```javascript
// Record payment
POST /v3/company/{companyId}/payment
{
  "CustomerRef": {
    "value": "123"
  },
  "TotalAmt": 200.00,
  "ProcessPayment": true,
  "Line": [
    {
      "Amount": 200.00,
      "LinkedTxn": [
        {
          "TxnId": "789",
          "TxnType": "Invoice"
        }
      ]
    }
  ]
}
```

### Advanced Endpoints

#### Reports API
```javascript
// Generate Profit & Loss report
GET /v3/company/{companyId}/reports/ProfitAndLoss?start_date=2024-01-01&end_date=2024-12-31

// Balance Sheet report
GET /v3/company/{companyId}/reports/BalanceSheet?date=2024-12-31

// Custom report with filters
GET /v3/company/{companyId}/reports/TransactionList?start_date=2024-01-01&end_date=2024-12-31&source=QB&columns=TxnDate,TxnType,Amount,Memo
```

#### Batch Operations
```javascript
// Batch create multiple entities
POST /v3/company/{companyId}/batch
{
  "BatchItemRequest": [
    {
      "operation": "CREATE",
      "Customer": {
        "Name": "Customer 1"
      }
    },
    {
      "operation": "CREATE",
      "Customer": {
        "Name": "Customer 2"
      }
    }
  ]
}
```

#### Attachments API
```javascript
// Upload attachment
POST /v3/company/{companyId}/upload
Content-Type: multipart/form-data

// Attach to transaction
POST /v3/company/{companyId}/attachable
{
  "AttachableRef": [
    {
      "EntityRef": {
        "type": "Invoice",
        "value": "123"
      }
    }
  ],
  "FileName": "invoice.pdf",
  "ContentType": "application/pdf"
}
```

## Rate Limiting & Throttling

### Rate Limit Categories

#### API Rate Limits
- **Sandbox Environment**: 500 requests per minute
- **Production Environment**: 100 requests per minute
- **Burst Allowance**: Limited burst capacity above base rate
- **Daily Limits**: Additional daily request limits

#### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

### Throttling Strategies

#### Exponential Backoff
```javascript
async function apiCallWithRetry(url, options, maxRetries = 3) {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
        continue;
      }
      
      return response;
    } catch (error) {
      if (retryCount === maxRetries - 1) throw error;
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
}
```

#### Request Queuing
```javascript
class RateLimiter {
  constructor(requestsPerMinute = 100) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
    this.timer = null;
  }
  
  async request(url, options) {
    return new Promise((resolve, reject) => {
      this.requests.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }
  
  processQueue() {
    if (this.timer) return;
    
    this.timer = setInterval(() => {
      if (this.requests.length === 0) {
        clearInterval(this.timer);
        this.timer = null;
        return;
      }
      
      const { url, options, resolve, reject } = this.requests.shift();
      fetch(url, options)
        .then(resolve)
        .catch(reject);
    }, (60 / this.requestsPerMinute) * 1000);
  }
}
```

## SDKs & Libraries

### Official SDKs

#### .NET SDK
```csharp
using Intuit.Ipp.Core;
using Intuit.Ipp.Data;
using Intuit.Ipp.QueryFilter;
using Intuit.Ipp.Security;

// Initialize service context
ServiceContext serviceContext = new ServiceContext(appToken, accessToken, companyId, intuitServiceType);
serviceContext.IppConfiguration.BaseUrl.Qbo = "https://quickbooks.api.intuit.com/";

// Create data service
DataService dataService = new DataService(serviceContext);

// Query customers
QueryService<Customer> customerQuery = new QueryService<Customer>(serviceContext);
List<Customer> customers = customerQuery.ExecuteIdsQuery("SELECT * FROM Customer").ToList();
```

#### Java SDK
```java
import com.intuit.ipp.core.ServiceContext;
import com.intuit.ipp.data.Customer;
import com.intuit.ipp.queryfilter.QueryFilter;
import com.intuit.ipp.services.DataService;

// Initialize context
ServiceContext context = new ServiceContext(appToken, accessToken, companyId, intuitServiceType);
context.getIppConfiguration().getBaseUrl().setQbo("https://quickbooks.api.intuit.com/");

// Create data service
DataService service = new DataService(context);

// Create customer
Customer customer = new Customer();
customer.setName("New Customer");
Customer savedCustomer = service.add(customer);
```

#### Node.js SDK
```javascript
const QuickBooks = require('node-quickbooks');

// Initialize QuickBooks instance
const qbo = new QuickBooks(
  consumerKey,
  consumerSecret,
  accessToken,
  refreshToken,
  companyId,
  useSandbox,
  debug
);

// Create customer
qbo.createCustomer({
  Name: 'New Customer',
  CompanyName: 'New Customer Inc.'
}, (err, customer) => {
  if (err) console.error(err);
  console.log(customer);
});

// Query invoices
qbo.findInvoices({
  fetchAll: true
}, (err, invoices) => {
  if (err) console.error(err);
  console.log(invoices);
});
```

### Third-Party Libraries

#### Python QuickBooks Client
```python
from quickbooks import QuickBooks
from quickbooks.objects import Customer

# Initialize client
client = QuickBooks(
    consumer_key=consumer_key,
    consumer_secret=consumer_secret,
    access_token=access_token,
    access_token_secret=access_token_secret,
    company_id=company_id,
    sandbox=True
)

# Create customer
customer = Customer()
customer.Name = "New Customer"
customer.save(qb=client)

# Query customers
customers = Customer.all(qb=client)
```

#### PHP QuickBooks SDK
```php
require_once 'QuickBooks.php';

// Initialize QuickBooks instance
$QuickBooks = new QuickBooks(
    $consumerKey,
    $consumerSecret,
    $accessToken,
    $accessTokenSecret,
    $companyId
);

// Create customer
$customer = new QuickBooks_Object_Customer();
$customer->setName('New Customer');
$customer->setCompanyName('New Customer Inc.');

$result = $QuickBooks->add($customer);
```

## Development Environment

### Sandbox Environment

#### Sandbox Setup
1. **Create Sandbox Company**: Use QuickBooks Developer Portal to create sandbox
2. **Sample Data**: Pre-populated with realistic test data
3. **API Endpoints**: Separate endpoints for sandbox testing
4. **Rate Limits**: Higher rate limits for development
5. **Data Isolation**: Complete separation from production data

#### Sandbox URLs
```
Production: https://quickbooks.api.intuit.com/v3/company/{companyId}
Sandbox: https://sandbox-quickbooks.api.intuit.com/v3/company/{companyId}
```

### Development Tools

#### Postman Collection
```json
{
  "info": {
    "name": "QuickBooks Online API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Customer",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"Name\": \"Test Customer\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/v3/company/{{company_id}}/customer",
          "host": ["{{base_url}}"],
          "path": ["v3", "company", "{{company_id}}", "customer"]
        }
      }
    }
  ]
}
```

#### API Explorer Tool
- **Interactive Testing**: Test API calls directly in browser
- **Request Builder**: Build complex API requests visually
- **Response Viewer**: Format and analyze API responses
- **Authentication**: Built-in OAuth 2.0 flow handling
- **Documentation**: Inline API documentation and examples

## Testing & Sandbox

### Test Data Management

#### Sample Data Creation
```javascript
// Create test customers
async function createTestCustomers(count = 10) {
  const customers = [];
  
  for (let i = 1; i <= count; i++) {
    const customer = {
      Name: `Test Customer ${i}`,
      CompanyName: `Test Company ${i} Inc.`,
      BillAddr: {
        Line1: `${i}00 Test Street`,
        City: 'Test City',
        CountrySubDivisionCode: 'CA',
        PostalCode: '12345'
      }
    };
    
    const response = await quickbooksAPI.createCustomer(customer);
    customers.push(response.data);
  }
  
  return customers;
}

// Create test invoices
async function createTestInvoices(customerIds, count = 5) {
  const invoices = [];
  
  for (const customerId of customerIds) {
    for (let i = 1; i <= count; i++) {
      const invoice = {
        CustomerRef: { value: customerId },
        Line: [
          {
            DetailType: 'SalesItemLineDetail',
            SalesItemLineDetail: {
              ItemRef: { value: '1' }, // Default service item
              Qty: Math.floor(Math.random() * 10) + 1,
              UnitPrice: Math.floor(Math.random() * 100) + 50
            },
            Amount: Math.floor(Math.random() * 500) + 100
          }
        ]
      };
      
      const response = await quickbooksAPI.createInvoice(invoice);
      invoices.push(response.data);
    }
  }
  
  return invoices;
}
```

### Automated Testing

#### Unit Testing Framework
```javascript
const chai = require('chai');
const sinon = require('sinon');
const QuickBooksAPI = require('../lib/quickbooks-api');

describe('QuickBooks API Client', () => {
  let apiClient;
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    apiClient = new QuickBooksAPI({
      accessToken: 'test-token',
      companyId: 'test-company'
    });
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const customerData = { Name: 'Test Customer' };
      const expectedResponse = { Id: '123', Name: 'Test Customer' };
      
      sandbox.stub(apiClient, 'makeRequest')
        .resolves(expectedResponse);
      
      const result = await apiClient.createCustomer(customerData);
      
      chai.expect(result).to.deep.equal(expectedResponse);
      chai.expect(apiClient.makeRequest.calledOnce).to.be.true;
    });
    
    it('should handle API errors', async () => {
      const customerData = { Name: '' };
      const error = new Error('Validation Error');
      
      sandbox.stub(apiClient, 'makeRequest')
        .rejects(error);
      
      try {
        await apiClient.createCustomer(customerData);
        chai.expect.fail('Should have thrown an error');
      } catch (err) {
        chai.expect(err).to.equal(error);
      }
    });
  });
});
```

### Integration Testing

#### End-to-End Test Suite
```javascript
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

describe('QuickBooks Integration Tests', () => {
  let driver;
  
  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });
  
  afterAll(async () => {
    await driver.quit();
  });
  
  test('should create customer via UI', async () => {
    await driver.get('https://app.qbo.intuit.com');
    
    // Login process
    await driver.findElement(By.id('username')).sendKeys(process.env.QBO_USERNAME);
    await driver.findElement(By.id('password')).sendKeys(process.env.QBO_PASSWORD);
    await driver.findElement(By.id('signin')).click();
    
    // Navigate to customers
    await driver.wait(until.elementLocated(By.linkText('Customers')), 10000);
    await driver.findElement(By.linkText('Customers')).click();
    
    // Create customer
    await driver.findElement(By.xpath("//button[contains(text(), 'Add customer')]")).click();
    await driver.findElement(By.name('name')).sendKeys('Test Customer');
    await driver.findElement(By.xpath("//button[contains(text(), 'Save')]")).click();
    
    // Verify customer creation
    await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Test Customer')]")), 10000);
    const customerElement = await driver.findElement(By.xpath("//div[contains(text(), 'Test Customer')]"));
    expect(await customerElement.getText()).toContain('Test Customer');
  });
});
```

## API Explorer

### Interactive API Testing

#### Request Builder Interface
```javascript
// API Explorer configuration
const apiExplorer = {
  baseUrl: 'https://sandbox-quickbooks.api.intuit.com/v3/company',
  endpoints: {
    customers: '/customer',
    invoices: '/invoice',
    payments: '/payment',
    items: '/item',
    accounts: '/account'
  },
  
  buildRequest: function(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}/${companyId}${this.endpoints[endpoint]}`;
    
    return {
      method: method,
      url: url,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: data ? JSON.stringify(data) : null
    };
  },
  
  executeRequest: async function(request) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      const data = await response.json();
      
      return {
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        error: error.message,
        status: 0
      };
    }
  }
};

// Usage example
const customerRequest = apiExplorer.buildRequest('customers', 'POST', {
  Name: 'New Customer',
  CompanyName: 'New Customer Inc.'
});

apiExplorer.executeRequest(customerRequest)
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Response Analysis Tools

#### Response Parser
```javascript
class APIResponseAnalyzer {
  constructor() {
    this.responses = [];
  }
  
  analyze(response) {
    const analysis = {
      status: response.status,
      success: response.status >= 200 && response.status < 300,
      hasData: response.data && Object.keys(response.data).length > 0,
      dataType: this.getDataType(response.data),
      fieldCount: this.countFields(response.data),
      nestedObjects: this.findNestedObjects(response.data),
      arrayFields: this.findArrayFields(response.data),
      metadata: this.extractMetadata(response.data)
    };
    
    this.responses.push(analysis);
    return analysis;
  }
  
  getDataType(data) {
    if (Array.isArray(data)) return 'array';
    if (data === null) return 'null';
    return typeof data;
  }
  
  countFields(data) {
    if (!data || typeof data !== 'object') return 0;
    return Object.keys(data).length;
  }
  
  findNestedObjects(data) {
    const nested = [];
    
    function traverse(obj, path = '') {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            nested.push(currentPath);
            traverse(obj[key], currentPath);
          }
        });
      }
    }
    
    traverse(data);
    return nested;
  }
  
  findArrayFields(data) {
    const arrays = [];
    
    function traverse(obj, path = '') {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          if (Array.isArray(obj[key])) {
            arrays.push({
              path: currentPath,
              length: obj[key].length,
              itemTypes: obj[key].length > 0 ? 
                [...new Set(obj[key].map(item => typeof item))] : []
            });
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key], currentPath);
          }
        });
      }
    }
    
    traverse(data);
    return arrays;
  }
  
  extractMetadata(data) {
    const metadata = {};
    
    if (data && typeof data === 'object') {
      // Look for common metadata fields
      const metaFields = ['time', 'startPosition', 'maxResults', 'totalCount'];
      metaFields.forEach(field => {
        if (data.hasOwnProperty(field)) {
          metadata[field] = data[field];
        }
      });
    }
    
    return metadata;
  }
  
  getSummary() {
    const total = this.responses.length;
    const successful = this.responses.filter(r => r.success).length;
    const withData = this.responses.filter(r => r.hasData).length;
    
    return {
      totalResponses: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      dataRate: total > 0 ? (withData / total) * 100 : 0,
      averageFields: this.responses.reduce((sum, r) => sum + r.fieldCount, 0) / total,
      commonDataTypes: this.getCommonDataTypes()
    };
  }
  
  getCommonDataTypes() {
    const types = {};
    this.responses.forEach(r => {
      types[r.dataType] = (types[r.dataType] || 0) + 1;
    });
    return types;
  }
}
```

## Real-Time Synchronization

### Webhook Implementation

#### Webhook Configuration
```javascript
// Set up webhook endpoints
const webhookConfig = {
  baseUrl: 'https://your-app.com/webhooks',
  endpoints: {
    customer: '/quickbooks/customer',
    invoice: '/quickbooks/invoice',
    payment: '/quickbooks/payment',
    bill: '/quickbooks/bill',
    item: '/quickbooks/item'
  },
  
  registerWebhooks: async function() {
    const webhooks = [
      {
        eventTypes: ['Customer.Add', 'Customer.Update', 'Customer.Delete'],
        endpoint: this.baseUrl + this.endpoints.customer
      },
      {
        eventTypes: ['Invoice.Add', 'Invoice.Update', 'Invoice.Delete'],
        endpoint: this.baseUrl + this.endpoints.invoice
      },
      {
        eventTypes: ['Payment.Add', 'Payment.Update', 'Payment.Delete'],
        endpoint: this.baseUrl + this.endpoints.payment
      }
    ];
    
    for (const webhook of webhooks) {
      await this.registerWebhook(webhook);
    }
  },
  
  registerWebhook: async function(webhook) {
    const response = await fetch('https://quickbooks.api.intuit.com/v3/company/' + companyId + '/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventTypes: webhook.eventTypes,
        endpoint: webhook.endpoint
      })
    });
    
    return response.json();
  }
};
```

#### Webhook Handler Implementation
```javascript
const express = require('express');
const crypto = require('crypto');

class WebhookHandler {
  constructor(webhookSecret) {
    this.secret = webhookSecret;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(this.verifySignature.bind(this));
  }
  
  verifySignature(req, res, next) {
    const signature = req.headers['intuit-signature'];
    const payload = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('base64');
    
    if (signature !== expectedSignature) {
      return res.status(401).send('Invalid signature');
    }
    
    next();
  }
  
  setupRoutes() {
    this.app.post('/webhooks/customer', this.handleCustomerWebhook.bind(this));
    this.app.post('/webhooks/invoice', this.handleInvoiceWebhook.bind(this));
    this.app.post('/webhooks/payment', this.handlePaymentWebhook.bind(this));
  }
  
  async handleCustomerWebhook(req, res) {
    const { eventType, entityId } = req.body;
    
    try {
      switch (eventType) {
        case 'Customer.Add':
          await this.syncNewCustomer(entityId);
          break;
        case 'Customer.Update':
          await this.syncUpdatedCustomer(entityId);
          break;
        case 'Customer.Delete':
          await this.syncDeletedCustomer(entityId);
          break;
      }
      
      res.status(200).send('Webhook processed');
    } catch (error) {
      console.error('Customer webhook error:', error);
      res.status(500).send('Processing failed');
    }
  }
  
  async handleInvoiceWebhook(req, res) {
    const { eventType, entityId } = req.body;
    
    try {
      const invoice = await this.getInvoiceFromQuickBooks(entityId);
      await this.syncInvoiceToLocalSystem(invoice);
      
      res.status(200).send('Invoice webhook processed');
    } catch (error) {
      console.error('Invoice webhook error:', error);
      res.status(500).send('Processing failed');
    }
  }
  
  async handlePaymentWebhook(req, res) {
    const { eventType, entityId } = req.body;
    
    try {
      const payment = await this.getPaymentFromQuickBooks(entityId);
      await this.updateLocalPaymentStatus(payment);
      
      res.status(200).send('Payment webhook processed');
    } catch (error) {
      console.error('Payment webhook error:', error);
      res.status(500).send('Processing failed');
    }
  }
  
  async getInvoiceFromQuickBooks(invoiceId) {
    const response = await fetch(`https://quickbooks.api.intuit.com/v3/company/${companyId}/invoice/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    return response.json();
  }
  
  async syncInvoiceToLocalSystem(invoice) {
    // Implement your local system sync logic
    console.log('Syncing invoice:', invoice.Id);
  }
  
  async syncNewCustomer(customerId) {
    const customer = await this.getCustomerFromQuickBooks(customerId);
    await this.createCustomerInLocalSystem(customer);
  }
  
  async syncUpdatedCustomer(customerId) {
    const customer = await this.getCustomerFromQuickBooks(customerId);
    await this.updateCustomerInLocalSystem(customer);
  }
  
  async syncDeletedCustomer(customerId) {
    await this.deleteCustomerFromLocalSystem(customerId);
  }
  
  async getCustomerFromQuickBooks(customerId) {
    const response = await fetch(`https://quickbooks.api.intuit.com/v3/company/${companyId}/customer/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    return response.json();
  }
  
  async createCustomerInLocalSystem(customer) {
    // Implement local customer creation
    console.log('Creating customer:', customer.Name);
  }
  
  async updateCustomerInLocalSystem(customer) {
    // Implement local customer update
    console.log('Updating customer:', customer.Id);
  }
  
  async deleteCustomerFromLocalSystem(customerId) {
    // Implement local customer deletion
    console.log('Deleting customer:', customerId);
  }
  
  async getPaymentFromQuickBooks(paymentId) {
    const response = await fetch(`https://quickbooks.api.intuit.com/v3/company/${companyId}/payment/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    return response.json();
  }
  
  async updateLocalPaymentStatus(payment) {
    // Implement local payment status update
    console.log('Updating payment status:', payment.Id);
  }
  
  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`Webhook handler listening on port ${port}`);
    });
  }
}

// Usage
const webhookHandler = new WebhookHandler(process.env.WEBHOOK_SECRET);
webhookHandler.start();
```

## Batch Processing

### Batch Operation Implementation

#### Batch Request Builder
```javascript
class BatchProcessor {
  constructor(companyId, accessToken) {
    this.companyId = companyId;
    this.accessToken = accessToken;
    this.baseUrl = 'https://quickbooks.api.intuit.com/v3/company';
    this.maxBatchSize = 25; // QuickBooks limit
  }
  
  async processBatch(operations) {
    if (operations.length > this.maxBatchSize) {
      throw new Error(`Batch size exceeds maximum of ${this.maxBatchSize}`);
    }
    
    const batchRequest = {
      BatchItemRequest: operations.map((op, index) => ({
        operation: op.operation,
        [op.entityType]: op.data,
        ...(op.options || {})
      }))
    };
    
    const response = await fetch(`${this.baseUrl}/${this.companyId}/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(batchRequest)
    });
    
    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return this.processBatchResponse(result);
  }
  
  processBatchResponse(response) {
    const results = [];
    
    if (response.BatchItemResponse) {
      response.BatchItemResponse.forEach(item => {
        if (item.Fault) {
          results.push({
            success: false,
            error: item.Fault
          });
        } else {
          // Extract the entity from response
          const entityType = Object.keys(item).find(key => 
            key !== 'operation' && key !== 'bId'
          );
          
          if (entityType) {
            results.push({
              success: true,
              data: item[entityType]
            });
          }
        }
      });
    }
    
    return results;
  }
  
  // Helper methods for common operations
  createCustomer(customerData) {
    return {
      operation: 'CREATE',
      entityType: 'Customer',
      data: customerData
    };
  }
  
  updateCustomer(customerId, customerData) {
    return {
      operation: 'UPDATE',
      entityType: 'Customer',
      data: { ...customerData, Id: customerId }
    };
  }
  
  createInvoice(invoiceData) {
    return {
      operation: 'CREATE',
      entityType: 'Invoice',
      data: invoiceData
    };
  }
  
  createItem(itemData) {
    return {
      operation: 'CREATE',
      entityType: 'Item',
      data: itemData
    };
  }
}

// Usage example
const batchProcessor = new BatchProcessor(companyId, accessToken);

const operations = [
  batchProcessor.createCustomer({
    Name: 'Customer 1',
    CompanyName: 'Customer 1 Inc.'
  }),
  batchProcessor.createCustomer({
    Name: 'Customer 2',
    CompanyName: 'Customer 2 Inc.'
  }),
  batchProcessor.createItem({
    Name: 'Service Item',
    Type: 'Service',
    IncomeAccountRef: { value: '1' }
  })
];

try {
  const results = await batchProcessor.processBatch(operations);
  console.log('Batch results:', results);
} catch (error) {
  console.error('Batch processing failed:', error);
}
```

#### Large Dataset Processing
```javascript
class LargeDatasetProcessor {
  constructor(companyId, accessToken) {
    this.companyId = companyId;
    this.accessToken = accessToken;
    this.baseUrl = 'https://quickbooks.api.intuit.com/v3/company';
    this.maxResults = 1000; // QuickBooks max per request
  }
  
  async processLargeDataset(endpoint, processor, options = {}) {
    const {
      filter = '',
      startPosition = 1,
      chunkSize = this.maxResults,
      maxRecords = null
    } = options;
    
    let allResults = [];
    let currentPosition = startPosition;
    let hasMore = true;
    
    while (hasMore) {
      const queryParams = new URLSearchParams({
        fetchAll: false,
        maxresults: chunkSize,
        startposition: currentPosition
      });
      
      if (filter) {
        queryParams.append('where', filter);
      }
      
      const url = `${this.baseUrl}/${this.companyId}/${endpoint}?${queryParams}`;
      
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        const entities = data.QueryResponse ? 
          Object.values(data.QueryResponse)[0] : [];
        
        if (entities && entities.length > 0) {
          // Process this chunk
          const processedChunk = await processor(entities);
          allResults = allResults.concat(processedChunk);
          
          // Check if we have more data
          hasMore = entities.length === chunkSize;
          currentPosition += chunkSize;
          
          // Check max records limit
          if (maxRecords && allResults.length >= maxRecords) {
            allResults = allResults.slice(0, maxRecords);
            hasMore = false;
          }
          
          // Add delay to respect rate limits
          await this.delay(100); // 100ms delay
        } else {
          hasMore = false;
        }
        
      } catch (error) {
        console.error(`Error processing chunk at position ${currentPosition}:`, error);
        throw error;
      }
    }
    
    return allResults;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example - Process all customers
const datasetProcessor = new LargeDatasetProcessor(companyId, accessToken);

const customerProcessor = async (customers) => {
  // Process customers (e.g., sync to local database)
  for (const customer of customers) {
    await syncCustomerToLocalDB(customer);
  }
  return customers;
};

try {
  const allCustomers = await datasetProcessor.processLargeDataset(
    'customer', 
    customerProcessor,
    {
      filter: "Active = true",
      maxRecords: 50000 // Limit to 50k records
    }
  );
  
  console.log(`Processed ${allCustomers.length} customers`);
} catch (error) {
  console.error('Large dataset processing failed:', error);
}
```

## Webhook Integration

### Advanced Webhook Patterns

#### Event-Driven Architecture
```javascript
class EventDrivenWebhookHandler {
  constructor() {
    this.eventHandlers = new Map();
    this.middlewares = [];
  }
  
  // Register event handlers
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }
  
  // Add middleware
  use(middleware) {
    this.middlewares.push(middleware);
  }
  
  // Process webhook
  async processWebhook(req, res) {
    try {
      let payload = req.body;
      
      // Apply middlewares
      for (const middleware of this.middlewares) {
        payload = await middleware(payload, req);
      }
      
      const { eventType, entityId, entityType } = payload;
      
      // Get handlers for this event type
      const handlers = this.eventHandlers.get(eventType) || [];
      
      if (handlers.length === 0) {
        console.log(`No handlers registered for event: ${eventType}`);
        return res.status(200).send('Event not handled');
      }
      
      // Execute all handlers for this event
      const results = await Promise.allSettled(
        handlers.map(handler => 
          handler(payload, { entityId, entityType, eventType })
        )
      );
      
      // Log results
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Handler ${index} failed:`, result.reason);
        } else {
          console.log(`Handler ${index} succeeded:`, result.value);
        }
      });
      
      res.status(200).send('Webhook processed');
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).send('Processing failed');
    }
  }
}

// Usage
const webhookHandler = new EventDrivenWebhookHandler();

// Add logging middleware
webhookHandler.use(async (payload, req) => {
  console.log(`Received webhook: ${payload.eventType} for ${payload.entityType}:${payload.entityId}`);
  console.log(`Headers:`, req.headers);
  return payload;
});

// Register event handlers
webhookHandler.on('Customer.Add', async (payload, context) => {
  console.log('Processing new customer:', context.entityId);
  // Sync to CRM
  await syncToCRM(context.entityId);
});

webhookHandler.on('Invoice.Update', async (payload, context) => {
  console.log('Processing invoice update:', context.entityId);
  // Update local system
  await updateLocalInvoice(context.entityId);
});

webhookHandler.on('Payment.Add', async (payload, context) => {
  console.log('Processing new payment:', context.entityId);
  // Update financial system
  await updateFinancialSystem(context.entityId);
});

// Express route
app.post('/webhooks/quickbooks', (req, res) => {
  webhookHandler.processWebhook(req, res);
});
```

#### Webhook Reliability Patterns
```javascript
class ReliableWebhookHandler {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.deadLetterQueue = [];
  }
  
  async processWebhookWithRetry(req, res) {
    const payload = req.body;
    const webhookId = this.generateWebhookId(payload);
    
    let attempt = 0;
    let success = false;
    
    while (attempt < this.maxRetries && !success) {
      try {
        await this.processWebhookLogic(payload);
        success = true;
        
        console.log(`Webhook ${webhookId} processed successfully on attempt ${attempt + 1}`);
        
      } catch (error) {
        attempt++;
        console.error(`Webhook ${webhookId} failed on attempt ${attempt}:`, error);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await this.delay(delay);
        } else {
          // Move to dead letter queue
          this.deadLetterQueue.push({
            webhookId,
            payload,
            error: error.message,
            timestamp: new Date(),
            attempts: attempt
          });
          
          console.error(`Webhook ${webhookId} moved to dead letter queue after ${attempt} attempts`);
        }
      }
    }
    
    if (success) {
      res.status(200).send('Webhook processed successfully');
    } else {
      res.status(500).send('Webhook processing failed');
    }
  }
  
  async processWebhookLogic(payload) {
    const { eventType, entityId } = payload;
    
    // Simulate processing with potential failure
    if (Math.random() < 0.3) { // 30% chance of failure
      throw new Error('Simulated processing failure');
    }
    
    // Actual processing logic here
    console.log(`Processing ${eventType} for entity ${entityId}`);
    
    // Simulate processing time
    await this.delay(Math.random() * 1000);
  }
  
  generateWebhookId(payload) {
    return `${payload.eventType}_${payload.entityId}_${Date.now()}`;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Dead letter queue management
  async processDeadLetterQueue() {
    const failedWebhooks = [...this.deadLetterQueue];
    this.deadLetterQueue = [];
    
    for (const failedWebhook of failedWebhooks) {
      try {
        await this.processWebhookLogic(failedWebhook.payload);
        console.log(`Dead letter webhook ${failedWebhook.webhookId} processed successfully`);
      } catch (error) {
        console.error(`Dead letter webhook ${failedWebhook.webhookId} failed again:`, error);
        // Could implement further retry logic or manual intervention
      }
    }
  }
  
  getDeadLetterQueueStatus() {
    return {
      queueLength: this.deadLetterQueue.length,
      oldestItem: this.deadLetterQueue.length > 0 ? this.deadLetterQueue[0].timestamp : null,
      newestItem: this.deadLetterQueue.length > 0 ? this.deadLetterQueue[this.deadLetterQueue.length - 1].timestamp : null
    };
  }
}

// Usage
const reliableHandler = new ReliableWebhookHandler();

// Express route
app.post('/webhooks/reliable', (req, res) => {
  reliableHandler.processWebhookWithRetry(req, res);
});

// Periodic dead letter queue processing
setInterval(() => {
  reliableHandler.processDeadLetterQueue();
}, 5 * 60 * 1000); // Every 5 minutes
```

## Error Handling

### Comprehensive Error Handling Framework

#### Error Classification
```javascript
class QuickBooksErrorHandler {
  constructor() {
    this.errorCategories = {
      AUTHENTICATION: 'Authentication and authorization errors',
      RATE_LIMITING: 'API rate limit exceeded',
      VALIDATION: 'Data validation errors',
      BUSINESS_LOGIC: 'Business rule violations',
      SYSTEM: 'System and infrastructure errors',
      NETWORK: 'Network and connectivity issues'
    };
    
    this.errorCodes = {
      // Authentication errors
      401: 'AUTHENTICATION',
      403: 'AUTHENTICATION',
      
      // Rate limiting
      429: 'RATE_LIMITING',
      
      // Validation errors
      400: 'VALIDATION',
      
      // Business logic errors
      409: 'BUSINESS_LOGIC',
      
      // System errors
      500: 'SYSTEM',
      502: 'SYSTEM',
      503: 'SYSTEM',
      504: 'SYSTEM'
    };
  }
  
  classifyError(statusCode, errorDetails) {
    const category = this.errorCodes[statusCode] || 'SYSTEM';
    
    return {
      category,
      description: this.errorCategories[category],
      statusCode,
      details: errorDetails,
      timestamp: new Date(),
      retryable: this.isRetryable(statusCode, errorDetails)
    };
  }
  
  isRetryable(statusCode, errorDetails) {
    // Authentication errors are not retryable
    if (statusCode === 401 || statusCode === 403) {
      return false;
    }
    
    // Rate limiting is retryable with backoff
    if (statusCode === 429) {
      return true;
    }
    
    // Server errors are generally retryable
    if (statusCode >= 500) {
      return true;
    }
    
    // Validation errors are not retryable
    if (statusCode === 400) {
      return false;
    }
    
    // Check for specific error messages
    if (errorDetails && typeof errorDetails === 'string') {
      const nonRetryableMessages = [
        'invalid',
        'required',
        'duplicate',
        'not found'
      ];
      
      return !nonRetryableMessages.some(msg => 
        errorDetails.toLowerCase().includes(msg)
      );
    }
    
    return false;
  }
  
  getRetryStrategy(classifiedError) {
    if (!classifiedError.retryable) {
      return null;
    }
    
    switch (classifiedError.category) {
      case 'RATE_LIMITING':
        return {
          type: 'EXPONENTIAL_BACKOFF',
          maxRetries: 3,
          baseDelay: 1000, // 1 second
          maxDelay: 30000 // 30 seconds
        };
        
      case 'SYSTEM':
        return {
          type: 'LINEAR_BACKOFF',
          maxRetries: 5,
          delay: 2000 // 2 seconds
        };
        
      case 'NETWORK':
        return {
          type: 'IMMEDIATE_RETRY',
          maxRetries: 3,
          delay: 500 // 500ms
        };
        
      default:
        return {
          type: 'NO_RETRY',
          maxRetries: 0
        };
    }
  }
  
  async handleError(error, context = {}) {
    const classifiedError = this.classifyError(
      error.status || error.statusCode || 0,
      error.message || error.details || error
    );
    
    console.error('QuickBooks API Error:', {
      ...classifiedError,
      context,
      stack: error.stack
    });
    
    const retryStrategy = this.getRetryStrategy(classifiedError);
    
    if (retryStrategy && retryStrategy.maxRetries > 0) {
      return await this.executeRetryStrategy(error, retryStrategy, context);
    }
    
    throw error;
  }
  
  async executeRetryStrategy(originalError, strategy, context) {
    let lastError = originalError;
    
    for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
      try {
        const delay = this.calculateDelay(strategy, attempt);
        await this.delay(delay);
        
        console.log(`Retry attempt ${attempt}/${strategy.maxRetries} after ${delay}ms delay`);
        
        // This would be replaced with the actual retry logic
        // For demonstration, we'll simulate a successful retry
        if (attempt === strategy.maxRetries) {
          return { success: true, attempt };
        }
        
      } catch (retryError) {
        lastError = retryError;
        console.error(`Retry attempt ${attempt} failed:`, retryError.message);
      }
    }
    
    throw lastError;
  }
  
  calculateDelay(strategy, attempt) {
    switch (strategy.type) {
      case 'EXPONENTIAL_BACKOFF':
        const exponentialDelay = strategy.baseDelay * Math.pow(2, attempt - 1);
        return Math.min(exponentialDelay, strategy.maxDelay);
        
      case 'LINEAR_BACKOFF':
        return strategy.delay;
        
      case 'IMMEDIATE_RETRY':
        return strategy.delay;
        
      default:
        return 0;
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const errorHandler = new QuickBooksErrorHandler();

try {
  // API call that might fail
  await quickbooksAPI.createCustomer(customerData);
} catch (error) {
  const result = await errorHandler.handleError(error, {
    operation: 'createCustomer',
    customerData
  });
  
  if (result && result.success) {
    console.log(`Operation succeeded on retry attempt ${result.attempt}`);
  } else {
    console.error('Operation failed after all retries');
    // Handle final failure
  }
}
```

#### Error Recovery Patterns
```javascript
class ErrorRecoveryManager {
  constructor() {
    this.recoveryStrategies = new Map();
    this.failureHistory = new Map();
  }
  
  registerRecoveryStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }
  
  async recoverFromError(error, context) {
    const errorType = this.classifyErrorType(error);
    const strategy = this.recoveryStrategies.get(errorType);
    
    if (!strategy) {
      throw error; // No recovery strategy available
    }
    
    // Track failure history
    this.trackFailure(errorType, context);
    
    try {
      const result = await strategy.recover(error, context);
      
      // Log successful recovery
      console.log(`Successfully recovered from ${errorType} error`, {
        context,
        recoveryResult: result
      });
      
      return result;
      
    } catch (recoveryError) {
      console.error(`Recovery failed for ${errorType} error`, {
        originalError: error.message,
        recoveryError: recoveryError.message,
        context
      });
      
      throw recoveryError;
    }
  }
  
  classifyErrorType(error) {
    const message = error.message || '';
    const statusCode = error.status || error.statusCode || 0;
    
    if (statusCode === 401 || statusCode === 403) {
      return 'AUTHENTICATION';
    }
    
    if (statusCode === 429) {
      return 'RATE_LIMIT';
    }
    
    if (message.includes('timeout') || message.includes('network')) {
      return 'NETWORK';
    }
    
    if (message.includes('validation') || statusCode === 400) {
      return 'VALIDATION';
    }
    
    if (statusCode >= 500) {
      return 'SERVER';
    }
    
    return 'UNKNOWN';
  }
  
  trackFailure(errorType, context) {
    const key = `${errorType}_${context.operation || 'unknown'}`;
    const history = this.failureHistory.get(key) || [];
    
    history.push({
      timestamp: new Date(),
      context,
      error: context.error
    });
    
    // Keep only last 10 failures
    if (history.length > 10) {
      history.shift();
    }
    
    this.failureHistory.set(key, history);
  }
  
  getFailureAnalytics() {
    const analytics = {};
    
    for (const [key, failures] of this.failureHistory) {
      const [errorType, operation] = key.split('_');
      
      if (!analytics[errorType]) {
        analytics[errorType] = {};
      }
      
      analytics[errorType][operation] = {
        count: failures.length,
        lastFailure: failures[failures.length - 1].timestamp,
        averageInterval: this.calculateAverageInterval(failures)
      };
    }
    
    return analytics;
  }
  
  calculateAverageInterval(failures) {
    if (failures.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < failures.length; i++) {
      const interval = failures[i].timestamp - failures[i - 1].timestamp;
      intervals.push(interval);
    }
    
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }
}

// Define recovery strategies
const recoveryManager = new ErrorRecoveryManager();

// Authentication recovery
recoveryManager.registerRecoveryStrategy('AUTHENTICATION', {
  async recover(error, context) {
    // Attempt to refresh token
    try {
      const newToken = await refreshAccessToken(context.refreshToken);
      context.accessToken = newToken;
      return { action: 'TOKEN_REFRESHED', newToken };
    } catch (refreshError) {
      // Token refresh failed, redirect to re-authentication
      return { action: 'REAUTHENTICATION_REQUIRED' };
    }
  }
});

// Rate limit recovery
recoveryManager.registerRecoveryStrategy('RATE_LIMIT', {
  async recover(error, context) {
    const retryAfter = error.headers ? error.headers['Retry-After'] : null;
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 1 minute
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return { action: 'RETRY_AFTER_DELAY', delay };
  }
});

// Network recovery
recoveryManager.registerRecoveryStrategy('NETWORK', {
  async recover(error, context) {
    // Implement circuit breaker pattern
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        // Retry the operation
        await context.retryFunction();
        return { action: 'NETWORK_RETRY_SUCCESS', attempt: attempt + 1 };
      } catch (retryError) {
        attempt++;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error('Network recovery failed after maximum retries');
  }
});

// Usage
try {
  await quickbooksAPI.createCustomer(customerData);
} catch (error) {
  const recoveryResult = await recoveryManager.recoverFromError(error, {
    operation: 'createCustomer',
    customerData,
    accessToken,
    refreshToken,
    retryFunction: () => quickbooksAPI.createCustomer(customerData)
  });
  
  console.log('Recovery result:', recoveryResult);
}
```

## Multi-Company Support

### Company Context Management

#### Multi-Company Architecture
```javascript
class MultiCompanyManager {
  constructor() {
    this.companies = new Map();
    this.activeCompany = null;
  }
  
  async addCompany(companyConfig) {
    const {
      companyId,
      name,
      accessToken,
      refreshToken,
      environment = 'production'
    } = companyConfig;
    
    const company = {
      id: companyId,
      name,
      accessToken,
      refreshToken,
      environment,
      baseUrl: environment === 'sandbox' 
        ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'
        : 'https://quickbooks.api.intuit.com/v3/company',
      lastUsed: new Date(),
      metadata: await this.getCompanyMetadata(companyId, accessToken)
    };
    
    this.companies.set(companyId, company);
    
    if (!this.activeCompany) {
      this.activeCompany = company;
    }
    
    return company;
  }
  
  async getCompanyMetadata(companyId, accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/${companyId}/companyinfo/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          legalName: data.CompanyInfo.CompanyName,
          address: data.CompanyInfo.CompanyAddr,
          fiscalYearEnd: data.CompanyInfo.FiscalYearEnd,
          taxYear: data.CompanyInfo.TaxYear
        };
      }
    } catch (error) {
      console.warn('Failed to fetch company metadata:', error);
    }
    
    return {};
  }
  
  setActiveCompany(companyId) {
    const company = this.companies.get(companyId);
    if (!company) {
      throw new Error(`Company ${companyId} not found`);
    }
    
    this.activeCompany = company;
    company.lastUsed = new Date();
    
    return company;
  }
  
  getActiveCompany() {
    return this.activeCompany;
  }
  
  async refreshToken(companyId) {
    const company = this.companies.get(companyId);
    if (!company) {
      throw new Error(`Company ${companyId} not found`);
    }
    
    try {
      const newTokens = await this.performTokenRefresh(company.refreshToken);
      
      company.accessToken = newTokens.accessToken;
      company.refreshToken = newTokens.refreshToken;
      
      return newTokens;
    } catch (error) {
      console.error(`Token refresh failed for company ${companyId}:`, error);
      throw error;
    }
  }
  
  async performTokenRefresh(refreshToken) {
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
      expiresIn: data.expires_in
    };
  }
  
  async makeAPIRequest(endpoint, options = {}) {
    if (!this.activeCompany) {
      throw new Error('No active company set');
    }
    
    const company = this.activeCompany;
    const url = `${company.baseUrl}/${company.id}/${endpoint}`;
    
    const requestOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${company.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    };
    
    let response = await fetch(url, requestOptions);
    
    // Handle token refresh if needed
    if (response.status === 401) {
      try {
        await this.refreshToken(company.id);
        
        // Retry with new token
        requestOptions.headers.Authorization = `Bearer ${company.accessToken}`;
        response = await fetch(url, requestOptions);
        
      } catch (refreshError) {
        throw new Error(`Authentication failed: ${refreshError.message}`);
      }
    }
    
    return response;
  }
  
  getAllCompanies() {
    return Array.from(this.companies.values()).map(company => ({
      id: company.id,
      name: company.name,
      environment: company.environment,
      lastUsed: company.lastUsed,
      metadata: company.metadata
    }));
  }
  
  removeCompany(companyId) {
    const wasActive = this.activeCompany && this.activeCompany.id === companyId;
    
    this.companies.delete(companyId);
    
    if (wasActive && this.companies.size > 0) {
      // Set first available company as active
      this.activeCompany = this.companies.values().next().value;
    } else if (wasActive) {
      this.activeCompany = null;
    }
    
    return wasActive;
  }
}

// Usage
const companyManager = new MultiCompanyManager();

// Add companies
await companyManager.addCompany({
  companyId: 'company1',
  name: 'Main Company',
  accessToken: 'token1',
  refreshToken: 'refresh1',
  environment: 'production'
});

await companyManager.addCompany({
  companyId: 'company2', 
  name: 'Subsidiary',
  accessToken: 'token2',
  refreshToken: 'refresh2',
  environment: 'sandbox'
});

// Switch active company
companyManager.setActiveCompany('company2');

// Make API request to active company
const response = await companyManager.makeAPIRequest('customer');
const customers = await response.json();
```

#### Cross-Company Operations
```javascript
class CrossCompanyOperations {
  constructor(companyManager) {
    this.companyManager = companyManager;
    this.operationQueue = [];
  }
  
  async executeCrossCompanyOperation(operation) {
    const { companies, action, data } = operation;
    const results = [];
    
    for (const companyId of companies) {
      try {
        // Switch to company
        this.companyManager.setActiveCompany(companyId);
        
        // Execute operation
        const result = await this.executeOperation(action, data);
        
        results.push({
          companyId,
          success: true,
          result
        });
        
      } catch (error) {
        results.push({
          companyId,
          success: false,
          error: error.message
        });
        
        console.error(`Operation failed for company ${companyId}:`, error);
      }
    }
    
    return results;
  }
  
  async executeOperation(action, data) {
    switch (action) {
      case 'CREATE_CUSTOMER':
        return await this.createCustomer(data);
      case 'CREATE_ITEM':
        return await this.createItem(data);
      case 'RUN_REPORT':
        return await this.runReport(data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  async createCustomer(customerData) {
    const response = await this.companyManager.makeAPIRequest('customer', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
    
    if (!response.ok) {
      throw new Error(`Customer creation failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async createItem(itemData) {
    const response = await this.companyManager.makeAPIRequest('item', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      throw new Error(`Item creation failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async runReport(reportConfig) {
    const { reportType, parameters = {} } = reportConfig;
    const queryParams = new URLSearchParams(parameters);
    const endpoint = `reports/${reportType}?${queryParams}`;
    
    const response = await this.companyManager.makeAPIRequest(endpoint);
    
    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async queueOperation(operation) {
    this.operationQueue.push(operation);
    
    // Process queue if not already processing
    if (this.operationQueue.length === 1) {
      await this.processQueue();
    }
  }
  
  async processQueue() {
    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue[0];
      
      try {
        const result = await this.executeCrossCompanyOperation(operation);
        
        // Notify completion
        if (operation.callback) {
          operation.callback(null, result);
        }
        
      } catch (error) {
        console.error('Cross-company operation failed:', error);
        
        if (operation.callback) {
          operation.callback(error, null);
        }
      }
      
      this.operationQueue.shift();
    }
  }
}

// Usage
const crossCompanyOps = new CrossCompanyOperations(companyManager);

// Execute immediate operation
const result = await crossCompanyOps.executeCrossCompanyOperation({
  companies: ['company1', 'company2'],
  action: 'CREATE_CUSTOMER',
  data: {
    Name: 'Shared Customer',
    CompanyName: 'Shared Customer Inc.'
  }
});

console.log('Cross-company results:', result);

// Queue operation for later processing
crossCompanyOps.queueOperation({
  companies: ['company1', 'company2'],
  action: 'RUN_REPORT',
  data: {
    reportType: 'ProfitAndLoss',
    parameters: {
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    }
  },
  callback: (error, result) => {
    if (error) {
      console.error('Queued operation failed:', error);
    } else {
      console.log('Queued operation completed:', result);
    }
  }
});
```

## Advanced User Management

### Role-Based Permissions

#### Permission System Architecture
```javascript
class AdvancedPermissionManager {
  constructor() {
    this.roles = new Map();
    this.users = new Map();
    this.permissions = new Map();
    this.roleHierarchy = new Map();
  }
  
  // Define permissions
  definePermission(permissionId, description, resource, action) {
    this.permissions.set(permissionId, {
      id: permissionId,
      description,
      resource,
      action,
      created: new Date()
    });
    
    return permissionId;
  }
  
  // Create roles with permissions
  createRole(roleId, name, description, permissionIds = []) {
    const role = {
      id: roleId,
      name,
      description,
      permissions: new Set(permissionIds),
      created: new Date(),
      modified: new Date()
    };
    
    this.roles.set(roleId, role);
    return role;
  }
  
  // Set up role hierarchy
  setRoleHierarchy(parentRoleId, childRoleId) {
    if (!this.roleHierarchy.has(parentRoleId)) {
      this.roleHierarchy.set(parentRoleId, new Set());
    }
    
    this.roleHierarchy.get(parentRoleId).add(childRoleId);
  }
  
  // Get all permissions for a role (including inherited)
  getRolePermissions(roleId) {
    const permissions = new Set();
    const visited = new Set();
    
    const collectPermissions = (currentRoleId) => {
      if (visited.has(currentRoleId)) return;
      visited.add(currentRoleId);
      
      const role = this.roles.get(currentRoleId);
      if (role) {
        role.permissions.forEach(permission => permissions.add(permission));
        
        // Collect from parent roles
        for (const [parentId, children] of this.roleHierarchy) {
          if (children.has(currentRoleId)) {
            collectPermissions(parentId);
          }
        }
      }
    };
    
    collectPermissions(roleId);
    return Array.from(permissions);
  }
  
  // Assign role to user
  assignRoleToUser(userId, roleId) {
    if (!this.roles.has(roleId)) {
      throw new Error(`Role ${roleId} does not exist`);
    }
    
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        id: userId,
        roles: new Set(),
        permissions: new Set(),
        created: new Date()
      });
    }
    
    const user = this.users.get(userId);
    user.roles.add(roleId);
    
    // Update user's permissions
    this.updateUserPermissions(userId);
    
    return user;
  }
  
  // Update user's permissions based on assigned roles
  updateUserPermissions(userId) {
    const user = this.users.get(userId);
    if (!user) return;
    
    user.permissions.clear();
    
    for (const roleId of user.roles) {
      const rolePermissions = this.getRolePermissions(roleId);
      rolePermissions.forEach(permission => user.permissions.add(permission));
    }
    
    user.modified = new Date();
  }
  
  // Check if user has permission
  hasPermission(userId, permissionId) {
    const user = this.users.get(userId);
    if (!user) return false;
    
    return user.permissions.has(permissionId);
  }
  
  // Check if user has any of the permissions
  hasAnyPermission(userId, permissionIds) {
    return permissionIds.some(permissionId => this.hasPermission(userId, permissionId));
  }
  
  // Check if user has all of the permissions
  hasAllPermissions(userId, permissionIds) {
    return permissionIds.every(permissionId => this.hasPermission(userId, permissionId));
  }
  
  // Get user details
  getUser(userId) {
    const user = this.users.get(userId);
    if (!user) return null;
    
    return {
      id: user.id,
      roles: Array.from(user.roles),
      permissions: Array.from(user.permissions),
      created: user.created,
      modified: user.modified
    };
  }
  
  // Remove role from user
  removeRoleFromUser(userId, roleId) {
    const user = this.users.get(userId);
    if (!user) return false;
    
    const removed = user.roles.delete(roleId);
    if (removed) {
      this.updateUserPermissions(userId);
    }
    
    return removed;
  }
  
  // Get all users with specific role
  getUsersWithRole(roleId) {
    const users = [];
    
    for (const [userId, user] of this.users) {
      if (user.roles.has(roleId)) {
        users.push(this.getUser(userId));
      }
    }
    
    return users;
  }
  
  // Get all roles
  getAllRoles() {
    const roles = [];
    
    for (const [roleId, role] of this.roles) {
      roles.push({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: Array.from(role.permissions),
        permissionCount: role.permissions.size,
        created: role.created,
        modified: role.modified
      });
    }
    
    return roles;
  }
  
  // Audit user permissions
  auditUserPermissions(userId) {
    const user = this.users.get(userId);
    if (!user) return null;
    
    const audit = {
      userId,
      roles: Array.from(user.roles),
      permissions: Array.from(user.permissions),
      roleDetails: [],
      permissionDetails: [],
      auditDate: new Date()
    };
    
    // Get role details
    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (role) {
        audit.roleDetails.push({
          id: role.id,
          name: role.name,
          permissions: Array.from(role.permissions)
        });
      }
    }
    
    // Get permission details
    for (const permissionId of user.permissions) {
      const permission = this.permissions.get(permissionId);
      if (permission) {
        audit.permissionDetails.push({
          id: permission.id,
          description: permission.description,
          resource: permission.resource,
          action: permission.action
        });
      }
    }
    
    return audit;
  }
}

// Initialize permission system
const permissionManager = new AdvancedPermissionManager();

// Define permissions
permissionManager.definePermission('customer.read', 'Read customer records', 'customer', 'read');
permissionManager.definePermission('customer.write', 'Create/edit customer records', 'customer', 'write');
permissionManager.definePermission('customer.delete', 'Delete customer records', 'customer', 'delete');
permissionManager.definePermission('invoice.read', 'Read invoice records', 'invoice', 'read');
permissionManager.definePermission('invoice.write', 'Create/edit invoice records', 'invoice', 'write');
permissionManager.definePermission('report.read', 'Read reports', 'report', 'read');
permissionManager.definePermission('report.write', 'Create custom reports', 'report', 'write');
permissionManager.definePermission('settings.read', 'Read system settings', 'settings', 'read');
permissionManager.definePermission('settings.write', 'Modify system settings', 'settings', 'write');

// Create roles
permissionManager.createRole('viewer', 'Viewer', 'Read-only access', [
  'customer.read', 'invoice.read', 'report.read'
]);

permissionManager.createRole('user', 'User', 'Standard user access', [
  'customer.read', 'customer.write', 'invoice.read', 'invoice.write', 'report.read'
]);

permissionManager.createRole('manager', 'Manager', 'Management access', [
  'customer.read', 'customer.write', 'customer.delete',
  'invoice.read', 'invoice.write', 'report.read', 'report.write'
]);

permissionManager.createRole('admin', 'Administrator', 'Full system access', [
  'customer.read', 'customer.write', 'customer.delete',
  'invoice.read', 'invoice.write', 'report.read', 'report.write',
  'settings.read', 'settings.write'
]);

// Set up role hierarchy (admin inherits from manager, etc.)
permissionManager.setRoleHierarchy('admin', 'manager');
permissionManager.setRoleHierarchy('manager', 'user');
permissionManager.setRoleHierarchy('user', 'viewer');

// Assign roles to users
permissionManager.assignRoleToUser('user123', 'user');
permissionManager.assignRoleToUser('manager456', 'manager');
permissionManager.assignRoleToUser('admin789', 'admin');

// Check permissions
console.log('User can read customers:', permissionManager.hasPermission('user123', 'customer.read'));
console.log('User can delete customers:', permissionManager.hasPermission('user123', 'customer.delete'));
console.log('Manager can delete customers:', permissionManager.hasPermission('manager456', 'customer.delete'));
console.log('Admin can modify settings:', permissionManager.hasPermission('admin789', 'settings.write'));

// Audit user permissions
const audit = permissionManager.auditUserPermissions('manager456');
console.log('Manager permissions audit:', audit);
```

#### User Activity Monitoring
```javascript
class UserActivityMonitor {
  constructor() {
    this.activities = new Map();
    this.sessionTracker = new Map();
    this.alerts = [];
  }
  
  // Track user activity
  trackActivity(userId, activity) {
    const timestamp = new Date();
    const activityRecord = {
      userId,
      ...activity,
      timestamp,
      sessionId: this.getSessionId(userId)
    };
    
    // Store in user-specific activity log
    if (!this.activities.has(userId)) {
      this.activities.set(userId, []);
    }
    
    const userActivities = this.activities.get(userId);
    userActivities.push(activityRecord);
    
    // Keep only last 1000 activities per user
    if (userActivities.length > 1000) {
      userActivities.shift();
    }
    
    // Check for suspicious activity
    this.checkForSuspiciousActivity(activityRecord);
    
    return activityRecord;
  }
  
  // Start user session
  startSession(userId, metadata = {}) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      metadata,
      activities: []
    };
    
    this.sessionTracker.set(sessionId, session);
    return sessionId;
  }
  
  // End user session
  endSession(sessionId) {
    const session = this.sessionTracker.get(sessionId);
    if (session) {
      session.endTime = new Date();
      session.duration = session.endTime - session.startTime;
      
      // Archive session data
      this.archiveSession(session);
      this.sessionTracker.delete(sessionId);
      
      return session;
    }
    
    return null;
  }
  
  // Get current session for user
  getSessionId(userId) {
    for (const [sessionId, session] of this.sessionTracker) {
      if (session.userId === userId) {
        session.lastActivity = new Date();
        return sessionId;
      }
    }
    
    return null;
  }
  
  // Check for suspicious activity
  checkForSuspiciousActivity(activity) {
    const { userId, action, resource, ipAddress, userAgent } = activity;
    
    // Check for rapid successive actions
    const recentActivities = this.getRecentActivities(userId, 5 * 60 * 1000); // Last 5 minutes
    const similarActivities = recentActivities.filter(a => 
      a.action === action && a.resource === resource
    );
    
    if (similarActivities.length > 10) {
      this.createAlert({
        type: 'RAPID_ACTIVITY',
        userId,
        message: `User performed ${similarActivities.length} similar actions in 5 minutes`,
        severity: 'MEDIUM',
        activities: similarActivities
      });
    }
    
    // Check for unusual login locations
    if (action === 'LOGIN') {
      const userHistory = this.getUserLoginHistory(userId);
      const unusualLocation = this.detectUnusualLocation(ipAddress, userHistory);
      
      if (unusualLocation) {
        this.createAlert({
          type: 'UNUSUAL_LOCATION',
          userId,
          message: `Login from unusual location: ${ipAddress}`,
          severity: 'HIGH',
          location: ipAddress
        });
      }
    }
    
    // Check for privilege escalation attempts
    if (action === 'PERMISSION_CHANGE' && resource === 'ADMIN') {
      this.createAlert({
        type: 'PRIVILEGE_ESCALATION',
        userId,
        message: 'Attempt to modify admin permissions',
        severity: 'CRITICAL',
        activity
      });
    }
  }
  
  // Get recent activities for user
  getRecentActivities(userId, timeWindowMs) {
    const userActivities = this.activities.get(userId) || [];
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    
    return userActivities.filter(activity => activity.timestamp > cutoffTime);
  }
  
  // Get user login history
  getUserLoginHistory(userId) {
    const userActivities = this.activities.get(userId) || [];
    return userActivities.filter(activity => activity.action === 'LOGIN');
  }
  
  // Detect unusual login location
  detectUnusualLocation(currentIp, loginHistory) {
    if (loginHistory.length < 3) return false; // Not enough history
    
    const recentIps = loginHistory.slice(-10).map(login => login.ipAddress);
    const uniqueIps = [...new Set(recentIps)];
    
    // If current IP is completely new and user has established patterns
    return !uniqueIps.includes(currentIp) && uniqueIps.length >= 3;
  }
  
  // Create security alert
  createAlert(alert) {
    const alertRecord = {
      id: this.generateAlertId(),
      ...alert,
      timestamp: new Date(),
      status: 'NEW'
    };
    
    this.alerts.push(alertRecord);
    
    // Trigger alert notifications
    this.notifySecurityTeam(alertRecord);
    
    return alertRecord;
  }
  
  // Get user activity summary
  getUserActivitySummary(userId, days = 30) {
    const userActivities = this.activities.get(userId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const recentActivities = userActivities.filter(activity => 
      activity.timestamp > cutoffDate
    );
    
    const summary = {
      userId,
      period: `${days} days`,
      totalActivities: recentActivities.length,
      activityByType: {},
      activityByResource: {},
      sessions: new Set(),
      firstActivity: recentActivities.length > 0 ? recentActivities[0].timestamp : null,
      lastActivity: recentActivities.length > 0 ? recentActivities[recentActivities.length - 1].timestamp : null
    };
    
    recentActivities.forEach(activity => {
      // Count by action type
      summary.activityByType[activity.action] = 
        (summary.activityByType[activity.action] || 0) + 1;
      
      // Count by resource
      summary.activityByResource[activity.resource] = 
        (summary.activityByResource[activity.resource] || 0) + 1;
      
      // Track sessions
      if (activity.sessionId) {
        summary.sessions.add(activity.sessionId);
      }
    });
    
    summary.uniqueSessions = summary.sessions.size;
    delete summary.sessions;
    
    return summary;
  }
  
  // Get security alerts
  getSecurityAlerts(status = 'NEW', limit = 50) {
    return this.alerts
      .filter(alert => alert.status === status)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  // Update alert status
  updateAlertStatus(alertId, status, notes = '') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      alert.updated = new Date();
      alert.notes = notes;
      return true;
    }
    return false;
  }
  
  // Archive old activities
  archiveOldActivities(daysToKeep = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    for (const [userId, activities] of this.activities) {
      const recentActivities = activities.filter(activity => 
        activity.timestamp > cutoffDate
      );
      
      if (recentActivities.length !== activities.length) {
        // Archive old activities (in real implementation, save to database)
        const oldActivities = activities.filter(activity => 
          activity.timestamp <= cutoffDate
        );
        
        console.log(`Archived ${oldActivities.length} activities for user ${userId}`);
        
        this.activities.set(userId, recentActivities);
      }
    }
  }
  
  // Utility methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  notifySecurityTeam(alert) {
    // In real implementation, send email/SMS/push notification
    console.log('SECURITY ALERT:', alert);
  }
  
  archiveSession(session) {
    // In real implementation, save to database
    console.log('Archived session:', session.id);
  }
}

// Initialize activity monitor
const activityMonitor = new UserActivityMonitor();

// Start user session
const sessionId = activityMonitor.startSession('user123', {
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
});

// Track activities
activityMonitor.trackActivity('user123', {
  action: 'LOGIN',
  resource: 'authentication',
  ipAddress: '192.168.1.100',
  details: 'Successful login'
});

activityMonitor.trackActivity('user123', {
  action: 'VIEW',
  resource: 'customer',
  ipAddress: '192.168.1.100',
  details: 'Viewed customer list'
});

activityMonitor.trackActivity('user123', {
  action: 'CREATE',
  resource: 'invoice',
  ipAddress: '192.168.1.100',
  details: 'Created invoice INV-001'
});

// Get activity summary
const summary = activityMonitor.getUserActivitySummary('user123', 7);
console.log('User activity summary:', summary);

// End session
activityMonitor.endSession(sessionId);

// Archive old activities (run periodically)
activityMonitor.archiveOldActivities(30); // Keep last 30 days
```

## Custom Workflows

### Workflow Engine

#### Workflow Definition
```javascript
class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.activeInstances = new Map();
    this.workflowHistory = new Map();
  }
  
  // Define a workflow
  defineWorkflow(workflowId, definition) {
    const workflow = {
      id: workflowId,
      ...definition,
      created: new Date(),
      version: 1
    };
    
    this.workflows.set(workflowId, workflow);
    return workflow;
  }
  
  // Start workflow instance
  async startWorkflow(workflowId, initialData = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    const instanceId = this.generateInstanceId();
    const instance = {
      id: instanceId,
      workflowId,
      status: 'RUNNING',
      currentStep: workflow.startStep || 'start',
      data: { ...initialData },
      history: [{
        step: 'start',
        timestamp: new Date(),
        action: 'START_WORKFLOW',
        data: initialData
      }],
      created: new Date(),
      modified: new Date()
    };
    
    this.activeInstances.set(instanceId, instance);
    
    // Execute first step
    await this.executeStep(instance);
    
    return instanceId;
  }
  
  // Execute workflow step
  async executeStep(instance) {
    const workflow = this.workflows.get(instance.workflowId);
    const currentStepDef = workflow.steps[instance.currentStep];
    
    if (!currentStepDef) {
      throw new Error(`Step ${instance.currentStep} not found in workflow ${instance.workflowId}`);
    }
    
    try {
      // Execute step action
      const result = await this.executeStepAction(currentStepDef, instance);
      
      // Record step completion
      instance.history.push({
        step: instance.currentStep,
        timestamp: new Date(),
        action: 'STEP_COMPLETED',
        result
      });
      
      // Determine next step
      const nextStep = this.determineNextStep(currentStepDef, result, instance);
      
      if (nextStep) {
        instance.currentStep = nextStep;
        instance.modified = new Date();
        
        // Continue to next step
        setImmediate(() => this.executeStep(instance));
      } else {
        // Workflow completed
        instance.status = 'COMPLETED';
        instance.completed = new Date();
        
        // Archive completed workflow
        this.archiveWorkflowInstance(instance);
        this.activeInstances.delete(instance.id);
      }
      
    } catch (error) {
      // Handle step failure
      instance.status = 'FAILED';
      instance.error = error.message;
      instance.failed = new Date();
      
      instance.history.push({
        step: instance.currentStep,
        timestamp: new Date(),
        action: 'STEP_FAILED',
        error: error.message
      });
      
      // Execute error handler if defined
      if (currentStepDef.onError) {
        await this.executeErrorHandler(currentStepDef.onError, instance, error);
      }
      
      // Archive failed workflow
      this.archiveWorkflowInstance(instance);
      this.activeInstances.delete(instance.id);
    }
  }
  
  // Execute step action
  async executeStepAction(stepDef, instance) {
    const { action, config } = stepDef;
    
    switch (action) {
      case 'CREATE_INVOICE':
        return await this.createInvoice(instance.data, config);
      case 'SEND_EMAIL':
        return await this.sendEmail(instance.data, config);
      case 'WAIT_FOR_APPROVAL':
        return await this.waitForApproval(instance, config);
      case 'UPDATE_RECORD':
        return await this.updateRecord(instance.data, config);
      case 'CONDITIONAL_CHECK':
        return await this.checkCondition(instance.data, config);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  // Determine next step based on conditions
  determineNextStep(stepDef, result, instance) {
    if (stepDef.transitions) {
      for (const transition of stepDef.transitions) {
        if (this.evaluateCondition(transition.condition, result, instance.data)) {
          return transition.nextStep;
        }
      }
    }
    
    return stepDef.defaultNext;
  }
  
  // Evaluate transition condition
  evaluateCondition(condition, result, data) {
    if (!condition) return true;
    
    // Simple condition evaluation (in real implementation, use a proper expression evaluator)
    const { field, operator, value } = condition;
    
    let fieldValue;
    if (field === 'result') {
      fieldValue = result;
    } else {
      fieldValue = data[field];
    }
    
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      case 'contains':
        return fieldValue && fieldValue.includes && fieldValue.includes(value);
      default:
        return false;
    }
  }
  
  // Workflow action implementations
  async createInvoice(data, config) {
    // Implementation for creating invoice
    console.log('Creating invoice with data:', data);
    return { invoiceId: 'INV-' + Date.now() };
  }
  
  async sendEmail(data, config) {
    // Implementation for sending email
    console.log('Sending email to:', config.recipient);
    return { emailId: 'EMAIL-' + Date.now() };
  }
  
  async waitForApproval(instance, config) {
    // Implementation for waiting for approval
    console.log('Waiting for approval on instance:', instance.id);
    // In real implementation, this would pause execution until approval is received
    return new Promise(resolve => {
      // Simulate approval after delay
      setTimeout(() => resolve({ approved: true }), 5000);
    });
  }
  
  async updateRecord(data, config) {
    // Implementation for updating record
    console.log('Updating record:', config.recordType);
    return { updated: true };
  }
  
  async checkCondition(data, config) {
    // Implementation for checking condition
    const { field, operator, value } = config;
    const fieldValue = data[field];
    
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'greater_than':
        return fieldValue > value;
      default:
        return false;
    }
  }
  
  async executeErrorHandler(errorHandler, instance, error) {
    // Implementation for error handling
    console.log('Executing error handler for instance:', instance.id);
  }
  
  // Get workflow instance status
  getWorkflowInstance(instanceId) {
    const instance = this.activeInstances.get(instanceId);
    if (instance) {
      return { ...instance };
    }
    
    // Check archived instances
    return this.workflowHistory.get(instanceId);
  }
  
  // Get all active workflow instances
  getActiveInstances(workflowId = null) {
    const instances = Array.from(this.activeInstances.values());
    
    if (workflowId) {
      return instances.filter(instance => instance.workflowId === workflowId);
    }
    
    return instances;
  }
  
  // Utility methods
  generateInstanceId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  archiveWorkflowInstance(instance) {
    // In real implementation, save to database
    this.workflowHistory.set(instance.id, { ...instance });
    
    // Keep only last 1000 completed workflows
    if (this.workflowHistory.size > 1000) {
      const oldestKey = this.workflowHistory.keys().next().value;
      this.workflowHistory.delete(oldestKey);
    }
  }
}

// Define invoice approval workflow
const workflowEngine = new WorkflowEngine();

workflowEngine.defineWorkflow('invoice_approval', {
  name: 'Invoice Approval Workflow',
  description: 'Automated workflow for invoice creation and approval',
  startStep: 'create_invoice',
  steps: {
    create_invoice: {
      action: 'CREATE_INVOICE',
      config: {
        template: 'standard_invoice'
      },
      transitions: [
        {
          condition: { field: 'result.invoiceId', operator: 'not_equals', value: null },
          nextStep: 'check_amount'
        }
      ]
    },
    
    check_amount: {
      action: 'CONDITIONAL_CHECK',
      config: {
        field: 'invoiceTotal',
        operator: 'greater_than',
        value: 1000
      },
      transitions: [
        {
          condition: { field: 'result', operator: 'equals', value: true },
          nextStep: 'wait_approval'
        },
        {
          condition: { field: 'result', operator: 'equals', value: false },
          nextStep: 'send_invoice'
        }
      ]
    },
    
    wait_approval: {
      action: 'WAIT_FOR_APPROVAL',
      config: {
        approver: 'manager',
        timeout: 7 * 24 * 60 * 60 * 1000 // 7 days
      },
      transitions: [
        {
          condition: { field: 'result.approved', operator: 'equals', value: true },
          nextStep: 'send_invoice'
        },
        {
          condition: { field: 'result.approved', operator: 'equals', value: false },
          nextStep: 'cancel_invoice'
        }
      ]
    },
    
    send_invoice: {
      action: 'SEND_EMAIL',
      config: {
        template: 'invoice_notification',
        recipient: 'customer'
      },
      defaultNext: 'end'
    },
    
    cancel_invoice: {
      action: 'UPDATE_RECORD',
      config: {
        recordType: 'invoice',
        action: 'cancel'
      },
      defaultNext: 'end'
    }
  }
});

// Start workflow instance
const instanceId = await workflowEngine.startWorkflow('invoice_approval', {
  customerId: 'CUST-001',
  invoiceItems: [
    { description: 'Service 1', amount: 500 },
    { description: 'Service 2', amount: 600 }
  ],
  invoiceTotal: 1100
});

console.log('Started workflow instance:', instanceId);

// Check workflow status
setTimeout(() => {
  const status = workflowEngine.getWorkflowInstance(instanceId);
  console.log('Workflow status:', status);
}, 10000);
```

#### Approval Workflow System
```javascript
class ApprovalWorkflowSystem {
  constructor(workflowEngine) {
    this.workflowEngine = workflowEngine;
    this.pendingApprovals = new Map();
    this.approvalHistory = new Map();
  }
  
  // Create approval request
  async createApprovalRequest(requestData) {
    const {
      workflowId,
      requestType,
      requesterId,
      approverId,
      data,
      priority = 'NORMAL',
      dueDate = null
    } = requestData;
    
    const approvalId = this.generateApprovalId();
    const approval = {
      id: approvalId,
      workflowId,
      requestType,
      requesterId,
      approverId,
      data,
      priority,
      dueDate,
      status: 'PENDING',
      created: new Date(),
      history: [{
        action: 'CREATED',
        timestamp: new Date(),
        userId: requesterId,
        notes: 'Approval request created'
      }]
    };
    
    this.pendingApprovals.set(approvalId, approval);
    
    // Start workflow if specified
    if (workflowId) {
      const instanceId = await this.workflowEngine.startWorkflow(workflowId, {
        approvalId,
        ...data
      });
      approval.workflowInstanceId = instanceId;
    }
    
    // Notify approver
    await this.notifyApprover(approval);
    
    return approvalId;
  }
  
  // Process approval decision
  async processApproval(approvalId, decision, approverId, notes = '') {
    const approval = this.pendingApprovals.get(approvalId);
    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }
    
    if (approval.approverId !== approverId) {
      throw new Error('Unauthorized approver');
    }
    
    if (approval.status !== 'PENDING') {
      throw new Error(`Approval is already ${approval.status}`);
    }
    
    // Update approval status
    approval.status = decision.toUpperCase();
    approval.processed = new Date();
    approval.decisionNotes = notes;
    
    // Add to history
    approval.history.push({
      action: decision.toUpperCase(),
      timestamp: new Date(),
      userId: approverId,
      notes
    });
    
    // Move to history
    this.approvalHistory.set(approvalId, approval);
    this.pendingApprovals.delete(approvalId);
    
    // Notify requester
    await this.notifyRequester(approval);
    
    // Continue workflow if applicable
    if (approval.workflowInstanceId) {
      await this.workflowEngine.resumeWorkflow(approval.workflowInstanceId, {
        approvalDecision: decision,
        approvalNotes: notes
      });
    }
    
    return approval;
  }
  
  // Get pending approvals for user
  getPendingApprovals(userId) {
    const approvals = [];
    
    for (const [approvalId, approval] of this.pendingApprovals) {
      if (approval.approverId === userId) {
        approvals.push({
          id: approval.id,
          requestType: approval.requestType,
          requesterId: approval.requesterId,
          data: approval.data,
          priority: approval.priority,
          dueDate: approval.dueDate,
          created: approval.created
        });
      }
    }
    
    return approvals.sort((a, b) => {
      // Sort by priority then due date
      const priorityOrder = { CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      
      return new Date(a.created) - new Date(b.created);
    });
  }
  
  // Get approval history
  getApprovalHistory(userId = null, limit = 50) {
    let history = Array.from(this.approvalHistory.values());
    
    if (userId) {
      history = history.filter(approval => 
        approval.requesterId === userId || approval.approverId === userId
      );
    }
    
    return history
      .sort((a, b) => b.processed - a.processed)
      .slice(0, limit);
  }
  
  // Escalate overdue approvals
  async escalateOverdueApprovals() {
    const now = new Date();
    const escalated = [];
    
    for (const [approvalId, approval] of this.pendingApprovals) {
      if (approval.dueDate && new Date(approval.dueDate) < now) {
        // Find escalation approver (in real implementation, look up hierarchy)
        const escalationApprover = await this.findEscalationApprover(approval.approverId);
        
        if (escalationApprover && escalationApprover !== approval.approverId) {
          approval.approverId = escalationApprover;
          approval.escalated = true;
          
          approval.history.push({
            action: 'ESCALATED',
            timestamp: new Date(),
            userId: 'SYSTEM',
            notes: `Escalated to ${escalationApprover} due to overdue status`
          });
          
          // Notify new approver
          await this.notifyApprover(approval);
          escalated.push(approvalId);
        }
      }
    }
    
    return escalated;
  }
  
  // Get approval statistics
  getApprovalStatistics(userId = null, dateRange = 30) {
    const cutoffDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);
    
    let approvals = Array.from(this.approvalHistory.values());
    
    if (userId) {
      approvals = approvals.filter(approval =>
        approval.requesterId === userId || approval.approverId === userId
      );
    }
    
    approvals = approvals.filter(approval => approval.processed > cutoffDate);
    
    const stats = {
      total: approvals.length,
      approved: approvals.filter(a => a.status === 'APPROVED').length,
      rejected: approvals.filter(a => a.status === 'REJECTED').length,
      averageProcessingTime: 0,
      byType: {},
      byPriority: {}
    };
    
    let totalProcessingTime = 0;
    
    approvals.forEach(approval => {
      const processingTime = approval.processed - approval.created;
      totalProcessingTime += processingTime;
      
      // Count by type
      stats.byType[approval.requestType] = 
        (stats.byType[approval.requestType] || 0) + 1;
      
      // Count by priority
      stats.byPriority[approval.priority] = 
        (stats.byPriority[approval.priority] || 0) + 1;
    });
    
    stats.averageProcessingTime = stats.total > 0 ? 
      totalProcessingTime / stats.total : 0;
    
    return stats;
  }
  
  // Utility methods
  generateApprovalId() {
    return `apr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  async notifyApprover(approval) {
    // Implementation for notifying approver
    console.log(`Notifying approver ${approval.approverId} about approval ${approval.id}`);
  }
  
  async notifyRequester(approval) {
    // Implementation for notifying requester
    console.log(`Notifying requester ${approval.requesterId} about approval ${approval.id} decision: ${approval.status}`);
  }
  
  async findEscalationApprover(currentApproverId) {
    // Implementation for finding escalation approver
    // In real implementation, look up organizational hierarchy
    return 'manager@example.com'; // Placeholder
  }
}

// Initialize approval system
const approvalSystem = new ApprovalWorkflowSystem(workflowEngine);

// Create approval request
const approvalId = await approvalSystem.createApprovalRequest({
  workflowId: 'invoice_approval',
  requestType: 'INVOICE_OVER_LIMIT',
  requesterId: 'user123',
  approverId: 'manager456',
  data: {
    invoiceId: 'INV-001',
    amount: 2500,
    customer: 'ABC Corp'
  },
  priority: 'HIGH',
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
});

console.log('Created approval request:', approvalId);

// Get pending approvals for manager
const pendingApprovals = approvalSystem.getPendingApprovals('manager456');
console.log('Pending approvals:', pendingApprovals);

// Process approval
await approvalSystem.processApproval(approvalId, 'APPROVED', 'manager456', 'Approved for processing');

// Get approval statistics
const stats = approvalSystem.getApprovalStatistics();
console.log('Approval statistics:', stats);
```

## Audit & Compliance

### Audit Trail System

#### Comprehensive Audit Logging
```javascript
class AuditTrailSystem {
  constructor() {
    this.auditLogs = new Map();
    this.retentionPolicy = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years
    this.maxLogsPerUser = 10000;
  }
  
  // Log audit event
  logEvent(eventData) {
    const {
      userId,
      action,
      resource,
      resourceId,
      details = {},
      ipAddress,
      userAgent,
      sessionId
    } = eventData;
    
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      sessionId,
      checksum: this.generateChecksum(eventData)
    };
    
    // Store in user-specific log
    if (!this.auditLogs.has(userId)) {
      this.auditLogs.set(userId, []);
    }
    
    const userLogs = this.auditLogs.get(userId);
    userLogs.push(auditEntry);
    
    // Maintain log size limits
    if (userLogs.length > this.maxLogsPerUser) {
      userLogs.shift(); // Remove oldest
    }
    
    // Archive old logs
    this.archiveOldLogs();
    
    return auditEntry.id;
  }
  
  // Query audit logs
  queryLogs(query = {}) {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      ipAddress,
      limit = 100,
      offset = 0
    } = query;
    
    let allLogs = [];
    
    // Collect logs from specified users or all users
    if (userId) {
      const userLogs = this.auditLogs.get(userId) || [];
      allLogs = userLogs;
    } else {
      for (const userLogs of this.auditLogs.values()) {
        allLogs = allLogs.concat(userLogs);
      }
    }
    
    // Apply filters
    let filteredLogs = allLogs.filter(log => {
      if (action && log.action !== action) return false;
      if (resource && log.resource !== resource) return false;
      if (startDate && log.timestamp < new Date(startDate)) return false;
      if (endDate && log.timestamp > new Date(endDate)) return false;
      if (ipAddress && log.ipAddress !== ipAddress) return false;
      return true;
    });
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);
    
    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      limit,
      offset
    };
  }
  
  // Get audit summary for user
  getUserAuditSummary(userId, days = 30) {
    const userLogs = this.auditLogs.get(userId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const recentLogs = userLogs.filter(log => log.timestamp > cutoffDate);
    
    const summary = {
      userId,
      period: `${days} days`,
      totalEvents: recentLogs.length,
      eventsByAction: {},
      eventsByResource: {},
      uniqueResources: new Set(),
      firstEvent: recentLogs.length > 0 ? recentLogs[recentLogs.length - 1].timestamp : null,
      lastEvent: recentLogs.length > 0 ? recentLogs[0].timestamp : null,
      suspiciousActivities: []
    };
    
    recentLogs.forEach(log => {
      // Count by action
      summary.eventsByAction[log.action] = 
        (summary.eventsByAction[log.action] || 0) + 1;
      
      // Count by resource
      summary.eventsByResource[log.resource] = 
        (summary.eventsByResource[log.resource] || 0) + 1;
      
      // Track unique resources
      summary.uniqueResources.add(log.resource);
      
      // Detect suspicious activities
      if (this.isSuspiciousActivity(log)) {
        summary.suspiciousActivities.push(log);
      }
    });
    
    summary.uniqueResources = Array.from(summary.uniqueResources);
    
    return summary;
  }
  
  // Detect suspicious activities
  isSuspiciousActivity(log) {
    const { action, resource, details, ipAddress } = log;
    
    // Failed login attempts
    if (action === 'LOGIN_FAILED' && details.attempts > 5) {
      return true;
    }
    
    // Unusual access times
    const hour = log.timestamp.getHours();
    if ((hour < 6 || hour > 22) && action === 'LOGIN') {
      return true;
    }
    
    // Bulk deletions
    if (action === 'DELETE' && details.count > 10) {
      return true;
    }
    
    // Access from unusual locations
    if (action === 'LOGIN' && details.unusualLocation) {
      return true;
    }
    
    return false;
  }
  
  // Export audit logs
  exportLogs(query = {}, format = 'json') {
    const result = this.queryLogs({ ...query, limit: 10000 }); // Large limit for export
    
    switch (format) {
      case 'json':
        return JSON.stringify(result.logs, null, 2);
      case 'csv':
        return this.convertToCSV(result.logs);
      case 'xml':
        return this.convertToXML(result.logs);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  // Generate compliance reports
  generateComplianceReport(complianceType, startDate, endDate) {
    const query = {
      startDate,
      endDate,
      limit: 10000
    };
    
    const logs = this.queryLogs(query).logs;
    
    const report = {
      complianceType,
      period: { startDate, endDate },
      generated: new Date(),
      summary: {
        totalEvents: logs.length,
        uniqueUsers: new Set(logs.map(log => log.userId)).size,
        eventsByAction: {},
        complianceViolations: []
      },
      details: logs
    };
    
    // Analyze events by action
    logs.forEach(log => {
      report.summary.eventsByAction[log.action] = 
        (report.summary.eventsByAction[log.action] || 0) + 1;
    });
    
    // Check for compliance violations based on type
    switch (complianceType) {
      case 'SOX':
        report.summary.complianceViolations = this.checkSOXCompliance(logs);
        break;
      case 'GDPR':
        report.summary.complianceViolations = this.checkGDPRCompliance(logs);
        break;
      case 'HIPAA':
        report.summary.complianceViolations = this.checkHIPAACompliance(logs);
        break;
    }
    
    return report;
  }
  
  // Compliance checking methods
  checkSOXCompliance(logs) {
    const violations = [];
    
    // Check for segregation of duties violations
    const userActions = {};
    logs.forEach(log => {
      if (!userActions[log.userId]) {
        userActions[log.userId] = new Set();
      }
      userActions[log.userId].add(log.action);
    });
    
    Object.entries(userActions).forEach(([userId, actions]) => {
      if (actions.has('CREATE_INVOICE') && actions.has('APPROVE_INVOICE')) {
        violations.push({
          type: 'SEGREGATION_OF_DUTIES',
          userId,
          description: 'User has both invoice creation and approval permissions',
          severity: 'HIGH'
        });
      }
    });
    
    return violations;
  }
  
  checkGDPRCompliance(logs) {
    const violations = [];
    
    // Check for unauthorized data access
    logs.forEach(log => {
      if (log.action === 'ACCESS_PERSONAL_DATA' && !log.details.consentGiven) {
        violations.push({
          type: 'UNAUTHORIZED_DATA_ACCESS',
          userId: log.userId,
          resourceId: log.resourceId,
          description: 'Access to personal data without user consent',
          severity: 'CRITICAL'
        });
      }
    });
    
    return violations;
  }
  
  checkHIPAACompliance(logs) {
    const violations = [];
    
    // Check for PHI access without proper authorization
    logs.forEach(log => {
      if (log.resource === 'PATIENT_DATA' && !log.details.hipaaAuthorized) {
        violations.push({
          type: 'UNAUTHORIZED_PHI_ACCESS',
          userId: log.userId,
          resourceId: log.resourceId,
          description: 'Access to protected health information without authorization',
          severity: 'CRITICAL'
        });
      }
    });
    
    return violations;
  }
  
  // Archive old logs
  archiveOldLogs() {
    const cutoffDate = new Date(Date.now() - this.retentionPolicy);
    
    for (const [userId, logs] of this.auditLogs) {
      const recentLogs = logs.filter(log => log.timestamp > cutoffDate);
      
      if (recentLogs.length < logs.length) {
        // In real implementation, archive old logs to long-term storage
        const oldLogs = logs.filter(log => log.timestamp <= cutoffDate);
        console.log(`Archived ${oldLogs.length} old logs for user ${userId}`);
        
        this.auditLogs.set(userId, recentLogs);
      }
    }
  }
  
  // Utility methods
  generateAuditId() {
    return `aud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateChecksum(data) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }
  
  convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = Object.keys(logs[0]);
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const values = headers.map(header => {
        const value = log[header];
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }
  
  convertToXML(logs) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<auditLogs>\n';
    
    logs.forEach(log => {
      xml += '  <auditEntry>\n';
      Object.entries(log).forEach(([key, value]) => {
        if (typeof value === 'object') {
          xml += `    <${key}>${JSON.stringify(value)}</${key}>\n`;
        } else {
          xml += `    <${key}>${value}</${key}>\n`;
        }
      });
      xml += '  </auditEntry>\n';
    });
    
    xml += '</auditLogs>';
    return xml;
  }
}

// Initialize audit system
const auditSystem = new AuditTrailSystem();

// Log various events
auditSystem.logEvent({
  userId: 'user123',
  action: 'LOGIN',
  resource: 'authentication',
  details: { successful: true },
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
});

auditSystem.logEvent({
  userId: 'user123',
  action: 'CREATE',
  resource: 'invoice',
  resourceId: 'INV-001',
  details: { amount: 1500, customer: 'ABC Corp' },
  ipAddress: '192.168.1.100'
});

auditSystem.logEvent({
  userId: 'user456',
  action: 'DELETE',
  resource: 'customer',
  resourceId: 'CUST-001',
  details: { reason: 'Duplicate record' },
  ipAddress: '192.168.1.101'
});

// Query logs
const loginLogs = auditSystem.queryLogs({
  action: 'LOGIN',
  startDate: '2024-01-01',
  limit: 10
});

console.log('Login logs:', loginLogs);

// Get user audit summary
const userSummary = auditSystem.getUserAuditSummary('user123', 7);
console.log('User audit summary:', userSummary);

// Generate compliance report
const complianceReport = auditSystem.generateComplianceReport(
  'SOX',
  '2024-01-01',
  '2024-12-31'
);

console.log('SOX compliance report:', complianceReport);

// Export logs
const csvExport = auditSystem.exportLogs({
  userId: 'user123',
  startDate: '2024-01-01'
}, 'csv');

console.log('CSV export:', csvExport);
```

## E-Commerce Integration

### Shopify Integration

#### Complete Shopify Integration
```javascript
class ShopifyIntegration {
  constructor(config) {
    this.shopDomain = config.shopDomain;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || '2023-10';
    this.baseUrl = `https://${this.shopDomain}/admin/api/${this.apiVersion}`;
    this.quickbooks = config.quickbooksClient;
  }
  
  // Sync products from Shopify to QuickBooks
  async syncProducts() {
    try {
      const shopifyProducts = await this.getShopifyProducts();
      const syncedProducts = [];
      
      for (const product of shopifyProducts) {
        const qbItem = await this.createOrUpdateQBItem(product);
        syncedProducts.push({
          shopifyId: product.id,
          qbId: qbItem.Id,
          name: product.title
        });
      }
      
      return syncedProducts;
    } catch (error) {
      console.error('Product sync failed:', error);
      throw error;
    }
  }
  
  // Sync orders from Shopify to QuickBooks
  async syncOrders(startDate = null) {
    try {
      const orders = await this.getShopifyOrders(startDate);
      const syncedOrders = [];
      
      for (const order of orders) {
        if (order.financial_status === 'paid') {
          const qbInvoice = await this.createQBInvoiceFromOrder(order);
          syncedOrders.push({
            shopifyId: order.id,
            qbId: qbInvoice.Id,
            orderNumber: order.order_number,
            total: order.total_price
          });
        }
      }
      
      return syncedOrders;
    } catch (error) {
      console.error('Order sync failed:', error);
      throw error;
    }
  }
  
  // Sync customers from Shopify to QuickBooks
  async syncCustomers() {
    try {
      const shopifyCustomers = await this.getShopifyCustomers();
      const syncedCustomers = [];
      
      for (const customer of shopifyCustomers) {
        const qbCustomer = await this.createOrUpdateQBCustomer(customer);
        syncedCustomers.push({
          shopifyId: customer.id,
          qbId: qbCustomer.Id,
          name: customer.first_name + ' ' + customer.last_name,
          email: customer.email
        });
      }
      
      return syncedCustomers;
    } catch (error) {
      console.error('Customer sync failed:', error);
      throw error;
    }
  }
  
  // Handle Shopify webhooks
  async handleWebhook(topic, data) {
    try {
      switch (topic) {
        case 'orders/create':
          await this.handleOrderCreated(data);
          break;
        case 'orders/updated':
          await this.handleOrderUpdated(data);
          break;
        case 'products/create':
          await this.handleProductCreated(data);
          break;
        case 'products/update':
          await this.handleProductUpdated(data);
          break;
        case 'customers/create':
          await this.handleCustomerCreated(data);
          break;
        case 'customers/update':
          await this.handleCustomerUpdated(data);
          break;
        default:
          console.log(`Unhandled webhook topic: ${topic}`);
      }
    } catch (error) {
      console.error(`Webhook handling failed for ${topic}:`, error);
      throw error;
    }
  }
  
  // Shopify API methods
  async getShopifyProducts() {
    const response = await fetch(`${this.baseUrl}/products.json`, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.products;
  }
  
  async getShopifyOrders(startDate = null) {
    let url = `${this.baseUrl}/orders.json?status=any&limit=250`;
    
    if (startDate) {
      url += `&created_at_min=${startDate.toISOString()}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.orders;
  }
  
  async getShopifyCustomers() {
    const response = await fetch(`${this.baseUrl}/customers.json`, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.customers;
  }
  
  // QuickBooks integration methods
  async createOrUpdateQBItem(product) {
    // Check if item already exists
    const existingItem = await this.findQBItemBySKU(product.variants[0].sku);
    
    if (existingItem) {
      // Update existing item
      return await this.updateQBItem(existingItem.Id, product);
    } else {
      // Create new item
      return await this.createQBItem(product);
    }
  }
  
  async createQBItem(product) {
    const itemData = {
      Name: product.title,
      Description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '') : '',
      UnitPrice: parseFloat(product.variants[0].price),
      QtyOnHand: product.variants[0].inventory_quantity || 0,
      IncomeAccountRef: { value: '1' }, // Sales account
      ExpenseAccountRef: { value: '2' }, // COGS account
      AssetAccountRef: { value: '3' }, // Inventory asset account
      Type: 'Inventory',
      Source: 'Shopify'
    };
    
    const response = await this.quickbooks.makeAPIRequest('item', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      throw new Error(`QuickBooks item creation failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async updateQBItem(itemId, product) {
    const updateData = {
      Id: itemId,
      Name: product.title,
      Description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '') : '',
      UnitPrice: parseFloat(product.variants[0].price),
      QtyOnHand: product.variants[0].inventory_quantity || 0
    };
    
    const response = await this.quickbooks.makeAPIRequest(`item/${itemId}`, {
      method: 'POST',
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`QuickBooks item update failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async findQBItemBySKU(sku) {
    if (!sku) return null;
    
    const response = await this.quickbooks.makeAPIRequest(`item?where=SKU='${sku}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Item ? data.QueryResponse.Item[0] : null;
  }
  
  async createQBInvoiceFromOrder(order) {
    // Find or create customer
    let customer = await this.findQBCustomerByEmail(order.customer.email);
    if (!customer) {
      customer = await this.createQBCustomer(order.customer);
    }
    
    // Create invoice
    const invoiceData = {
      CustomerRef: { value: customer.Id },
      Line: order.line_items.map(item => ({
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: item.variant_id.toString() }, // Will need to map Shopify variant to QB item
          Qty: item.quantity,
          UnitPrice: parseFloat(item.price)
        },
        Amount: parseFloat(item.price) * item.quantity
      })),
      CustomField: [
        {
          DefinitionId: '1', // Shopify Order ID
          Name: 'Shopify Order ID',
          Type: 'StringType',
          StringValue: order.id.toString()
        }
      ]
    };
    
    const response = await this.quickbooks.makeAPIRequest('invoice', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
    
    if (!response.ok) {
      throw new Error(`QuickBooks invoice creation failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async createOrUpdateQBCustomer(shopifyCustomer) {
    // Check if customer already exists
    const existingCustomer = await this.findQBCustomerByEmail(shopifyCustomer.email);
    
    if (existingCustomer) {
      // Update existing customer
      return await this.updateQBCustomer(existingCustomer.Id, shopifyCustomer);
    } else {
      // Create new customer
      return await this.createQBCustomer(shopifyCustomer);
    }
  }
  
  async createQBCustomer(shopifyCustomer) {
    const customerData = {
      Name: `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`,
      CompanyName: shopifyCustomer.default_address ? shopifyCustomer.default_address.company : '',
      BillAddr: shopifyCustomer.default_address ? {
        Line1: shopifyCustomer.default_address.address1,
        Line2: shopifyCustomer.default_address.address2,
        City: shopifyCustomer.default_address.city,
        CountrySubDivisionCode: shopifyCustomer.default_address.province_code,
        PostalCode: shopifyCustomer.default_address.zip,
        Country: shopifyCustomer.default_address.country_code
      } : undefined,
      PrimaryEmailAddr: {
        Address: shopifyCustomer.email
      },
      PrimaryPhone: shopifyCustomer.phone ? {
        FreeFormNumber: shopifyCustomer.phone
      } : undefined,
      Source: 'Shopify'
    };
    
    const response = await this.quickbooks.makeAPIRequest('customer', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
    
    if (!response.ok) {
      throw new Error(`QuickBooks customer creation failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async updateQBCustomer(customerId, shopifyCustomer) {
    const updateData = {
      Id: customerId,
      Name: `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`,
      PrimaryEmailAddr: {
        Address: shopifyCustomer.email
      }
    };
    
    const response = await this.quickbooks.makeAPIRequest(`customer/${customerId}`, {
      method: 'POST',
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`QuickBooks customer update failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async findQBCustomerByEmail(email) {
    if (!email) return null;
    
    const response = await this.quickbooks.makeAPIRequest(`customer?where=PrimaryEmailAddr.Address='${email}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Customer ? data.QueryResponse.Customer[0] : null;
  }
  
  // Webhook handlers
  async handleOrderCreated(order) {
    console.log('Processing new Shopify order:', order.id);
    await this.createQBInvoiceFromOrder(order);
  }
  
  async handleOrderUpdated(order) {
    console.log('Processing updated Shopify order:', order.id);
    // Handle order updates (cancellations, refunds, etc.)
  }
  
  async handleProductCreated(product) {
    console.log('Processing new Shopify product:', product.id);
    await this.createOrUpdateQBItem(product);
  }
  
  async handleProductUpdated(product) {
    console.log('Processing updated Shopify product:', product.id);
    await this.createOrUpdateQBItem(product);
  }
  
  async handleCustomerCreated(customer) {
    console.log('Processing new Shopify customer:', customer.id);
    await this.createOrUpdateQBCustomer(customer);
  }
  
  async handleCustomerUpdated(customer) {
    console.log('Processing updated Shopify customer:', customer.id);
    await this.createOrUpdateQBCustomer(customer);
  }
}

// Usage example
const shopifyIntegration = new ShopifyIntegration({
  shopDomain: 'your-shop.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  quickbooksClient: quickbooksClient
});

// Sync all data
await shopifyIntegration.syncCustomers();
await shopifyIntegration.syncProducts();
await shopifyIntegration.syncOrders();

// Set up webhook handling
app.post('/webhooks/shopify', (req, res) => {
  const topic = req.headers['x-shopify-topic'];
  const data = req.body;
  
  shopifyIntegration.handleWebhook(topic, data)
    .then(() => res.status(200).send('OK'))
    .catch(error => {
      console.error('Webhook processing failed:', error);
      res.status(500).send('Error');
    });
});
```

## ERP Integration

### SAP Integration

#### SAP to QuickBooks Integration
```javascript
class SAPIntegration {
  constructor(config) {
    this.sapConfig = config.sap;
    this.quickbooks = config.quickbooksClient;
    this.lastSync = new Map();
    this.syncInterval = config.syncInterval || 15 * 60 * 1000; // 15 minutes
  }
  
  // Start continuous sync process
  async startSyncProcess() {
    console.log('Starting SAP to QuickBooks sync process...');
    
    // Initial sync
    await this.performFullSync();
    
    // Set up continuous sync
    setInterval(async () => {
      try {
        await this.performIncrementalSync();
      } catch (error) {
        console.error('Incremental sync failed:', error);
        // Continue running, don't stop the interval
      }
    }, this.syncInterval);
  }
  
  // Perform full synchronization
  async performFullSync() {
    console.log('Performing full SAP to QuickBooks sync...');
    
    try {
      // Sync in order of dependencies
      await this.syncSAPCustomers();
      await this.syncSAPVendors();
      await this.syncSAPItems();
      await this.syncSAPOrders();
      await this.syncSAPInvoices();
      
      console.log('Full sync completed successfully');
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }
  
  // Perform incremental synchronization
  async performIncrementalSync() {
    const now = new Date();
    console.log('Performing incremental SAP sync at', now.toISOString());
    
    try {
      // Sync only changed records since last sync
      const lastSyncTime = this.lastSync.get('incremental') || new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      await this.syncChangedCustomers(lastSyncTime);
      await this.syncChangedVendors(lastSyncTime);
      await this.syncChangedItems(lastSyncTime);
      await this.syncChangedOrders(lastSyncTime);
      await this.syncChangedInvoices(lastSyncTime);
      
      this.lastSync.set('incremental', now);
      console.log('Incremental sync completed successfully');
    } catch (error) {
      console.error('Incremental sync failed:', error);
      throw error;
    }
  }
  
  // SAP API methods
  async callSAPAPI(endpoint, params = {}) {
    const sapUrl = `${this.sapConfig.baseUrl}${endpoint}`;
    
    const response = await fetch(sapUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.sapConfig.username}:${this.sapConfig.password}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: params ? JSON.stringify(params) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`SAP API error: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  // Customer synchronization
  async syncSAPCustomers() {
    console.log('Syncing SAP customers...');
    
    const sapCustomers = await this.callSAPAPI('/customers');
    let synced = 0;
    
    for (const sapCustomer of sapCustomers) {
      try {
        await this.syncCustomer(sapCustomer);
        synced++;
      } catch (error) {
        console.error(`Failed to sync customer ${sapCustomer.id}:`, error);
      }
    }
    
    console.log(`Synced ${synced} customers`);
    return synced;
  }
  
  async syncChangedCustomers(since) {
    const sapCustomers = await this.callSAPAPI('/customers/changed', {
      since: since.toISOString()
    });
    
    for (const sapCustomer of sapCustomers) {
      await this.syncCustomer(sapCustomer);
    }
    
    return sapCustomers.length;
  }
  
  async syncCustomer(sapCustomer) {
    // Check if customer exists in QuickBooks
    const existingCustomer = await this.findQBCustomerBySAPId(sapCustomer.id);
    
    const customerData = {
      Name: sapCustomer.name,
      CompanyName: sapCustomer.company,
      BillAddr: {
        Line1: sapCustomer.address.street,
        City: sapCustomer.address.city,
        CountrySubDivisionCode: sapCustomer.address.state,
        PostalCode: sapCustomer.address.zip,
        Country: sapCustomer.address.country
      },
      PrimaryEmailAddr: {
        Address: sapCustomer.email
      },
      PrimaryPhone: {
        FreeFormNumber: sapCustomer.phone
      },
      CustomField: [
        {
          DefinitionId: '1',
          Name: 'SAP Customer ID',
          Type: 'StringType',
          StringValue: sapCustomer.id
        }
      ],
      Source: 'SAP'
    };
    
    if (existingCustomer) {
      // Update existing customer
      customerData.Id = existingCustomer.Id;
      
      await this.quickbooks.makeAPIRequest(`customer/${existingCustomer.Id}`, {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    } else {
      // Create new customer
      await this.quickbooks.makeAPIRequest('customer', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    }
  }
  
  async findQBCustomerBySAPId(sapId) {
    const response = await this.quickbooks.makeAPIRequest(`customer?where=CustomField[1].StringValue='${sapId}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Customer ? data.QueryResponse.Customer[0] : null;
  }
  
  // Vendor synchronization
  async syncSAPVendors() {
    console.log('Syncing SAP vendors...');
    
    const sapVendors = await this.callSAPAPI('/vendors');
    let synced = 0;
    
    for (const sapVendor of sapVendors) {
      try {
        await this.syncVendor(sapVendor);
        synced++;
      } catch (error) {
        console.error(`Failed to sync vendor ${sapVendor.id}:`, error);
      }
    }
    
    console.log(`Synced ${synced} vendors`);
    return synced;
  }
  
  async syncVendor(sapVendor) {
    const existingVendor = await this.findQBVendorBySAPId(sapVendor.id);
    
    const vendorData = {
      Name: sapVendor.name,
      CompanyName: sapVendor.company,
      BillAddr: {
        Line1: sapVendor.address.street,
        City: sapVendor.address.city,
        CountrySubDivisionCode: sapVendor.address.state,
        PostalCode: sapVendor.address.zip,
        Country: sapVendor.address.country
      },
      PrimaryEmailAddr: {
        Address: sapVendor.email
      },
      PrimaryPhone: {
        FreeFormNumber: sapVendor.phone
      },
      Vendor1099: sapVendor.is1099,
      CustomField: [
        {
          DefinitionId: '2',
          Name: 'SAP Vendor ID',
          Type: 'StringType',
          StringValue: sapVendor.id
        }
      ],
      Source: 'SAP'
    };
    
    if (existingVendor) {
      vendorData.Id = existingVendor.Id;
      
      await this.quickbooks.makeAPIRequest(`vendor/${existingVendor.Id}`, {
        method: 'POST',
        body: JSON.stringify(vendorData)
      });
    } else {
      await this.quickbooks.makeAPIRequest('vendor', {
        method: 'POST',
        body: JSON.stringify(vendorData)
      });
    }
  }
  
  async findQBVendorBySAPId(sapId) {
    const response = await this.quickbooks.makeAPIRequest(`vendor?where=CustomField[2].StringValue='${sapId}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Vendor ? data.QueryResponse.Vendor[0] : null;
  }
  
  // Item synchronization
  async syncSAPItems() {
    console.log('Syncing SAP items...');
    
    const sapItems = await this.callSAPAPI('/items');
    let synced = 0;
    
    for (const sapItem of sapItems) {
      try {
        await this.syncItem(sapItem);
        synced++;
      } catch (error) {
        console.error(`Failed to sync item ${sapItem.id}:`, error);
      }
    }
    
    console.log(`Synced ${synced} items`);
    return synced;
  }
  
  async syncItem(sapItem) {
    const existingItem = await this.findQBItemBySAPId(sapItem.id);
    
    const itemData = {
      Name: sapItem.name,
      Description: sapItem.description,
      UnitPrice: sapItem.price,
      QtyOnHand: sapItem.quantity,
      IncomeAccountRef: { value: '1' },
      ExpenseAccountRef: { value: '2' },
      AssetAccountRef: { value: '3' },
      Type: sapItem.type === 'inventory' ? 'Inventory' : 'Service',
      CustomField: [
        {
          DefinitionId: '3',
          Name: 'SAP Item ID',
          Type: 'StringType',
          StringValue: sapItem.id
        }
      ],
      Source: 'SAP'
    };
    
    if (existingItem) {
      itemData.Id = existingItem.Id;
      
      await this.quickbooks.makeAPIRequest(`item/${existingItem.Id}`, {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
    } else {
      await this.quickbooks.makeAPIRequest('item', {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
    }
  }
  
  async findQBItemBySAPId(sapId) {
    const response = await this.quickbooks.makeAPIRequest(`item?where=CustomField[3].StringValue='${sapId}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Item ? data.QueryResponse.Item[0] : null;
  }
  
  // Order synchronization
  async syncSAPOrders() {
    console.log('Syncing SAP orders...');
    
    const sapOrders = await this.callSAPAPI('/orders');
    let synced = 0;
    
    for (const sapOrder of sapOrders) {
      try {
        await this.syncOrder(sapOrder);
        synced++;
      } catch (error) {
        console.error(`Failed to sync order ${sapOrder.id}:`, error);
      }
    }
    
    console.log(`Synced ${synced} orders`);
    return synced;
  }
  
  async syncOrder(sapOrder) {
    // Find customer
    const customer = await this.findQBCustomerBySAPId(sapOrder.customerId);
    if (!customer) {
      throw new Error(`Customer ${sapOrder.customerId} not found`);
    }
    
    const orderData = {
      CustomerRef: { value: customer.Id },
      Line: sapOrder.items.map(item => ({
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: item.itemId },
          Qty: item.quantity,
          UnitPrice: item.price
        },
        Amount: item.quantity * item.price
      })),
      CustomField: [
        {
          DefinitionId: '4',
          Name: 'SAP Order ID',
          Type: 'StringType',
          StringValue: sapOrder.id
        }
      ],
      Source: 'SAP'
    };
    
    await this.quickbooks.makeAPIRequest('estimate', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }
  
  // Invoice synchronization
  async syncSAPInvoices() {
    console.log('Syncing SAP invoices...');
    
    const sapInvoices = await this.callSAPAPI('/invoices');
    let synced = 0;
    
    for (const sapInvoice of sapInvoices) {
      try {
        await this.syncInvoice(sapInvoice);
        synced++;
      } catch (error) {
        console.error(`Failed to sync invoice ${sapInvoice.id}:`, error);
      }
    }
    
    console.log(`Synced ${synced} invoices`);
    return synced;
  }
  
  async syncInvoice(sapInvoice) {
    const customer = await this.findQBCustomerBySAPId(sapInvoice.customerId);
    if (!customer) {
      throw new Error(`Customer ${sapInvoice.customerId} not found`);
    }
    
    const invoiceData = {
      CustomerRef: { value: customer.Id },
      Line: sapInvoice.items.map(item => ({
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: item.itemId },
          Qty: item.quantity,
          UnitPrice: item.price
        },
        Amount: item.quantity * item.price
      })),
      CustomField: [
        {
          DefinitionId: '5',
          Name: 'SAP Invoice ID',
          Type: 'StringType',
          StringValue: sapInvoice.id
        }
      ],
      Source: 'SAP'
    };
    
    await this.quickbooks.makeAPIRequest('invoice', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }
  
  // Sync changed records methods
  async syncChangedVendors(since) {
    const sapVendors = await this.callSAPAPI('/vendors/changed', {
      since: since.toISOString()
    });
    
    for (const sapVendor of sapVendors) {
      await this.syncVendor(sapVendor);
    }
    
    return sapVendors.length;
  }
  
  async syncChangedItems(since) {
    const sapItems = await this.callSAPAPI('/items/changed', {
      since: since.toISOString()
    });
    
    for (const sapItem of sapItems) {
      await this.syncItem(sapItem);
    }
    
    return sapItems.length;
  }
  
  async syncChangedOrders(since) {
    const sapOrders = await this.callSAPAPI('/orders/changed', {
      since: since.toISOString()
    });
    
    for (const sapOrder of sapOrders) {
      await this.syncOrder(sapOrder);
    }
    
    return sapOrders.length;
  }
  
  async syncChangedInvoices(since) {
    const sapInvoices = await this.callSAPAPI('/invoices/changed', {
      since: since.toISOString()
    });
    
    for (const sapInvoice of sapInvoices) {
      await this.syncInvoice(sapInvoice);
    }
    
    return sapInvoices.length;
  }
  
  // Monitoring and reporting
  getSyncStatus() {
    return {
      lastFullSync: this.lastSync.get('full'),
      lastIncrementalSync: this.lastSync.get('incremental'),
      syncInterval: this.syncInterval,
      isRunning: true
    };
  }
  
  async getSyncStatistics() {
    // In a real implementation, you'd track these metrics
    return {
      customersSynced: 0,
      vendorsSynced: 0,
      itemsSynced: 0,
      ordersSynced: 0,
      invoicesSynced: 0,
      errors: 0,
      lastSyncDuration: 0
    };
  }
}

// Usage example
const sapIntegration = new SAPIntegration({
  sap: {
    baseUrl: 'https://your-sap-system.com/api',
    username: process.env.SAP_USERNAME,
    password: process.env.SAP_PASSWORD
  },
  quickbooksClient: quickbooksClient,
  syncInterval: 15 * 60 * 1000 // 15 minutes
});

// Start the sync process
sapIntegration.startSyncProcess();

// Monitor sync status
setInterval(() => {
  const status = sapIntegration.getSyncStatus();
  console.log('SAP Sync Status:', status);
}, 60 * 1000); // Every minute
```

## CRM Integration

### Salesforce Integration

#### Complete Salesforce Integration
```javascript
class SalesforceIntegration {
  constructor(config) {
    this.sfConfig = config.salesforce;
    this.quickbooks = config.quickbooksClient;
    this.sfConnection = null;
    this.syncMappings = config.mappings || {};
  }
  
  // Initialize Salesforce connection
  async initialize() {
    const jsforce = require('jsforce');
    
    this.sfConnection = new jsforce.Connection({
      loginUrl: this.sfConfig.loginUrl || 'https://login.salesforce.com',
      version: this.sfConfig.apiVersion || '57.0'
    });
    
    await this.sfConnection.login(
      this.sfConfig.username,
      this.sfConfig.password + this.sfConfig.securityToken
    );
    
    console.log('Salesforce connection established');
  }
  
  // Sync Salesforce Accounts to QuickBooks Customers
  async syncAccounts() {
    console.log('Syncing Salesforce Accounts to QuickBooks Customers...');
    
    const accounts = await this.sfConnection.query(
      `SELECT Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, Phone, Website, Type
       FROM Account
       WHERE LastModifiedDate > ${this.getLastSyncTime('Account')}`
    );
    
    let synced = 0;
    for (const account of accounts.records) {
      try {
        await this.syncAccountToCustomer(account);
        synced++;
      } catch (error) {
        console.error(`Failed to sync account ${account.Id}:`, error);
      }
    }
    
    this.updateLastSyncTime('Account', new Date());
    console.log(`Synced ${synced} accounts`);
    return synced;
  }
  
  // Sync Salesforce Contacts to QuickBooks Customers
  async syncContacts() {
    console.log('Syncing Salesforce Contacts to QuickBooks Customers...');
    
    const contacts = await this.sfConnection.query(
      `SELECT Id, FirstName, LastName, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, AccountId
       FROM Contact
       WHERE LastModifiedDate > ${this.getLastSyncTime('Contact')}`
    );
    
    let synced = 0;
    for (const contact of contacts.records) {
      try {
        await this.syncContactToCustomer(contact);
        synced++;
      } catch (error) {
        console.error(`Failed to sync contact ${contact.Id}:`, error);
      }
    }
    
    this.updateLastSyncTime('Contact', new Date());
    console.log(`Synced ${synced} contacts`);
    return synced;
  }
  
  // Sync Salesforce Opportunities to QuickBooks Estimates
  async syncOpportunities() {
    console.log('Syncing Salesforce Opportunities to QuickBooks Estimates...');
    
    const opportunities = await this.sfConnection.query(
      `SELECT Id, Name, AccountId, Amount, CloseDate, StageName, 
              (SELECT Id, PricebookEntry.Product2.Name, Quantity, UnitPrice, TotalPrice
               FROM OpportunityLineItems)
       FROM Opportunity
       WHERE LastModifiedDate > ${this.getLastSyncTime('Opportunity')}
       AND StageName IN ('Proposal/Price Quote', 'Negotiation/Review')`
    );
    
    let synced = 0;
    for (const opp of opportunities.records) {
      try {
        await this.syncOpportunityToEstimate(opp);
        synced++;
      } catch (error) {
        console.error(`Failed to sync opportunity ${opp.Id}:`, error);
      }
    }
    
    this.updateLastSyncTime('Opportunity', new Date());
    console.log(`Synced ${synced} opportunities`);
    return synced;
  }
  
  // Sync Salesforce Orders to QuickBooks Invoices
  async syncOrders() {
    console.log('Syncing Salesforce Orders to QuickBooks Invoices...');
    
    const orders = await this.sfConnection.query(
      `SELECT Id, OrderNumber, AccountId, Status, TotalAmount, 
              (SELECT Id, Product2.Name, Quantity, UnitPrice, TotalPrice
               FROM OrderItems)
       FROM Order
       WHERE LastModifiedDate > ${this.getLastSyncTime('Order')}
       AND Status = 'Activated'`
    );
    
    let synced = 0;
    for (const order of orders.records) {
      try {
        await this.syncOrderToInvoice(order);
        synced++;
      } catch (error) {
        console.error(`Failed to sync order ${order.Id}:`, error);
      }
    }
    
    this.updateLastSyncTime('Order', new Date());
    console.log(`Synced ${synced} orders`);
    return synced;
  }
  
  // Sync implementation methods
  async syncAccountToCustomer(account) {
    const existingCustomer = await this.findQBCustomerBySFId(account.Id);
    
    const customerData = {
      Name: account.Name,
      CompanyName: account.Name,
      BillAddr: account.BillingStreet ? {
        Line1: account.BillingStreet,
        City: account.BillingCity,
        CountrySubDivisionCode: account.BillingState,
        PostalCode: account.BillingPostalCode,
        Country: account.BillingCountry
      } : undefined,
      PrimaryPhone: account.Phone ? {
        FreeFormNumber: account.Phone
      } : undefined,
      Website: account.Website,
      CustomField: [
        {
          DefinitionId: '1',
          Name: 'Salesforce Account ID',
          Type: 'StringType',
          StringValue: account.Id
        }
      ],
      Source: 'Salesforce'
    };
    
    if (existingCustomer) {
      customerData.Id = existingCustomer.Id;
      
      await this.quickbooks.makeAPIRequest(`customer/${existingCustomer.Id}`, {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    } else {
      await this.quickbooks.makeAPIRequest('customer', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    }
  }
  
  async syncContactToCustomer(contact) {
    const existingCustomer = await this.findQBCustomerBySFId(contact.Id);
    
    const customerData = {
      Name: `${contact.FirstName} ${contact.LastName}`,
      BillAddr: contact.MailingStreet ? {
        Line1: contact.MailingStreet,
        City: contact.MailingCity,
        CountrySubDivisionCode: contact.MailingState,
        PostalCode: contact.MailingPostalCode,
        Country: contact.MailingCountry
      } : undefined,
      PrimaryEmailAddr: contact.Email ? {
        Address: contact.Email
      } : undefined,
      PrimaryPhone: contact.Phone ? {
        FreeFormNumber: contact.Phone
      } : undefined,
      CustomField: [
        {
          DefinitionId: '2',
          Name: 'Salesforce Contact ID',
          Type: 'StringType',
          StringValue: contact.Id
        }
      ],
      Source: 'Salesforce'
    };
    
    if (existingCustomer) {
      customerData.Id = existingCustomer.Id;
      
      await this.quickbooks.makeAPIRequest(`customer/${existingCustomer.Id}`, {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    } else {
      await this.quickbooks.makeAPIRequest('customer', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    }
  }
  
  async syncOpportunityToEstimate(opportunity) {
    // Find customer
    const customer = await this.findQBCustomerBySFId(opportunity.AccountId);
    if (!customer) {
      console.warn(`Customer for opportunity ${opportunity.Id} not found`);
      return;
    }
    
    const estimateData = {
      CustomerRef: { value: customer.Id },
      Line: opportunity.OpportunityLineItems.records.map(item => ({
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { name: item.Product2.Name }, // Will need to map to QB item
          Qty: item.Quantity,
          UnitPrice: item.UnitPrice
        },
        Amount: item.TotalPrice
      })),
      CustomField: [
        {
          DefinitionId: '3',
          Name: 'Salesforce Opportunity ID',
          Type: 'StringType',
          StringValue: opportunity.Id
        }
      ],
      ExpirationDate: opportunity.CloseDate,
      Source: 'Salesforce'
    };
    
    await this.quickbooks.makeAPIRequest('estimate', {
      method: 'POST',
      body: JSON.stringify(estimateData)
    });
  }
  
  async syncOrderToInvoice(order) {
    // Find customer
    const customer = await this.findQBCustomerBySFId(order.AccountId);
    if (!customer) {
      console.warn(`Customer for order ${order.Id} not found`);
      return;
    }
    
    const invoiceData = {
      CustomerRef: { value: customer.Id },
      Line: order.OrderItems.records.map(item => ({
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { name: item.Product2.Name }, // Will need to map to QB item
          Qty: item.Quantity,
          UnitPrice: item.UnitPrice
        },
        Amount: item.TotalPrice
      })),
      CustomField: [
        {
          DefinitionId: '4',
          Name: 'Salesforce Order ID',
          Type: 'StringType',
          StringValue: order.Id
        }
      ],
      Source: 'Salesforce'
    };
    
    await this.quickbooks.makeAPIRequest('invoice', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }
  
  // Helper methods
  async findQBCustomerBySFId(sfId) {
    const response = await this.quickbooks.makeAPIRequest(`customer?where=CustomField[1].StringValue='${sfId}' OR CustomField[2].StringValue='${sfId}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Customer ? data.QueryResponse.Customer[0] : null;
  }
  
  getLastSyncTime(objectType) {
    // In a real implementation, you'd store this in a database
    const lastSync = this.lastSyncTimes?.[objectType] || new Date(0);
    return lastSync.toISOString();
  }
  
  updateLastSyncTime(objectType, timestamp) {
    if (!this.lastSyncTimes) {
      this.lastSyncTimes = {};
    }
    this.lastSyncTimes[objectType] = timestamp;
  }
  
  // Bidirectional sync - QuickBooks to Salesforce
  async syncQBCustomersToSalesforce() {
    console.log('Syncing QuickBooks Customers to Salesforce...');
    
    const qbCustomers = await this.getQBCustomersModifiedSince(this.getLastSyncTime('QB_Customer'));
    
    for (const customer of qbCustomers) {
      try {
        await this.syncQBCustomerToSalesforce(customer);
      } catch (error) {
        console.error(`Failed to sync QB customer ${customer.Id}:`, error);
      }
    }
    
    this.updateLastSyncTime('QB_Customer', new Date());
  }
  
  async syncQBCustomerToSalesforce(qbCustomer) {
    // Find existing Salesforce record
    const existingAccount = await this.findSalesforceAccountByQBId(qbCustomer.Id);
    
    const accountData = {
      Name: qbCustomer.Name,
      BillingStreet: qbCustomer.BillAddr?.Line1,
      BillingCity: qbCustomer.BillAddr?.City,
      BillingState: qbCustomer.BillAddr?.CountrySubDivisionCode,
      BillingPostalCode: qbCustomer.BillAddr?.PostalCode,
      BillingCountry: qbCustomer.BillAddr?.Country,
      Phone: qbCustomer.PrimaryPhone?.FreeFormNumber,
      Website: qbCustomer.Website
    };
    
    if (existingAccount) {
      // Update existing account
      await this.sfConnection.sobject('Account').update({
        Id: existingAccount.Id,
        ...accountData
      });
    } else {
      // Create new account
      accountData.QuickBooks_ID__c = qbCustomer.Id; // Custom field
      await this.sfConnection.sobject('Account').create(accountData);
    }
  }
  
  async findSalesforceAccountByQBId(qbId) {
    const result = await this.sfConnection.query(
      `SELECT Id FROM Account WHERE QuickBooks_ID__c = '${qbId}'`
    );
    
    return result.records.length > 0 ? result.records[0] : null;
  }
  
  async getQBCustomersModifiedSince(since) {
    const response = await this.quickbooks.makeAPIRequest(`customer?where=MetaData.LastUpdatedTime > '${since}'`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.QueryResponse.Customer || [];
  }
  
  // Webhook handling for real-time sync
  async handleSalesforceWebhook(eventType, record) {
    try {
      switch (eventType) {
        case 'Account':
          await this.syncAccountToCustomer(record);
          break;
        case 'Contact':
          await this.syncContactToCustomer(record);
          break;
        case 'Opportunity':
          await this.syncOpportunityToEstimate(record);
          break;
        case 'Order':
          await this.syncOrderToInvoice(record);
          break;
        default:
          console.log(`Unhandled Salesforce event: ${eventType}`);
      }
    } catch (error) {
      console.error(`Salesforce webhook processing failed:`, error);
      throw error;
    }
  }
  
  // Monitoring and reporting
  async getSyncStatus() {
    return {
      lastSyncTimes: this.lastSyncTimes || {},
      connectionStatus: this.sfConnection ? 'Connected' : 'Disconnected',
      pendingSyncs: 0 // Would track in real implementation
    };
  }
  
  async getSyncStatistics() {
    // In a real implementation, you'd track these metrics
    return {
      accountsSynced: 0,
      contactsSynced: 0,
      opportunitiesSynced: 0,
      ordersSynced: 0,
      errors: 0,
      lastSyncDuration: 0
    };
  }
}

// Usage example
const salesforceIntegration = new SalesforceIntegration({
  salesforce: {
    username: process.env.SF_USERNAME,
    password: process.env.SF_PASSWORD,
    securityToken: process.env.SF_SECURITY_TOKEN,
    loginUrl: 'https://login.salesforce.com'
  },
  quickbooksClient: quickbooksClient,
  mappings: {
    // Custom field mappings would go here
  }
});

// Initialize and sync
await salesforceIntegration.initialize();
await salesforceIntegration.syncAccounts();
await salesforceIntegration.syncContacts();
await salesforceIntegration.syncOpportunities();
await salesforceIntegration.syncOrders();

// Set up bidirectional sync
setInterval(async () => {
  await salesforceIntegration.syncQBCustomersToSalesforce();
}, 30 * 60 * 1000); // Every 30 minutes

// Webhook endpoint for real-time updates
app.post('/webhooks/salesforce', (req, res) => {
  const { eventType, record } = req.body;
  
  salesforceIntegration.handleSalesforceWebhook(eventType, record)
    .then(() => res.status(200).send('OK'))
    .catch(error => {
      console.error('Webhook processing failed:', error);
      res.status(500).send('Error');
    });
});
```

## Payment Processing

### Stripe Integration

#### Complete Stripe Integration
```javascript
class StripeIntegration {
  constructor(config) {
    this.stripe = require('stripe')(config.stripe.secretKey);
    this.quickbooks = config.quickbooksClient;
    this.webhookSecret = config.stripe.webhookSecret;
    this.lastSync = new Map();
  }
  
  // Sync Stripe customers to QuickBooks
  async syncCustomers() {
    console.log('Syncing Stripe customers to QuickBooks...');
    
    let hasMore = true;
    let startingAfter = null;
    let synced = 0;
    
    while (hasMore) {
      const customers = await this.stripe.customers.list({
        limit: 100,
        starting_after: startingAfter
      });
      
      for (const customer of customers.data) {
        try {
          await this.syncStripeCustomerToQB(customer);
          synced++;
        } catch (error) {
          console.error(`Failed to sync customer ${customer.id}:`, error);
        }
      }
      
      hasMore = customers.has_more;
      if (hasMore) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }
    
    console.log(`Synced ${synced} customers`);
    return synced;
  }
  
  // Sync Stripe charges to QuickBooks payments
  async syncCharges(startDate = null) {
    console.log('Syncing Stripe charges to QuickBooks payments...');
    
    const params = {
      limit: 100,
      created: startDate ? { gte: Math.floor(startDate.getTime() / 1000) } : undefined
    };
    
    let hasMore = true;
    let synced = 0;
    
    while (hasMore) {
      const charges = await this.stripe.charges.list(params);
      
      for (const charge of charges.data) {
        if (charge.status === 'succeeded') {
          try {
            await this.syncStripeChargeToQBPayment(charge);
            synced++;
          } catch (error) {
            console.error(`Failed to sync charge ${charge.id}:`, error);
          }
        }
      }
      
      hasMore = charges.has_more;
      if (hasMore) {
        params.starting_after = charges.data[charges.data.length - 1].id;
      }
    }
    
    console.log(`Synced ${synced} charges`);
    return synced;
  }
  
  // Sync Stripe subscriptions to QuickBooks recurring invoices
  async syncSubscriptions() {
    console.log('Syncing Stripe subscriptions to QuickBooks...');
    
    let hasMore = true;
    let startingAfter = null;
    let synced = 0;
    
    while (hasMore) {
      const subscriptions = await this.stripe.subscriptions.list({
        limit: 100,
        status: 'active',
        starting_after: startingAfter
      });
      
      for (const subscription of subscriptions.data) {
        try {
          await this.syncStripeSubscriptionToQB(subscription);
          synced++;
        } catch (error) {
          console.error(`Failed to sync subscription ${subscription.id}:`, error);
        }
      }
      
      hasMore = subscriptions.has_more;
      if (hasMore) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      }
    }
    
    console.log(`Synced ${synced} subscriptions`);
    return synced;
  }
  
  // Sync implementation methods
  async syncStripeCustomerToQB(stripeCustomer) {
    const existingCustomer = await this.findQBCustomerByStripeId(stripeCustomer.id);
    
    const customerData = {
      Name: stripeCustomer.name || stripeCustomer.email,
      CompanyName: stripeCustomer.name,
      PrimaryEmailAddr: {
        Address: stripeCustomer.email
      },
      PrimaryPhone: stripeCustomer.phone ? {
        FreeFormNumber: stripeCustomer.phone
      } : undefined,
      BillAddr: stripeCustomer.address ? {
        Line1: stripeCustomer.address.line1,
        Line2: stripeCustomer.address.line2,
        City: stripeCustomer.address.city,
        CountrySubDivisionCode: stripeCustomer.address.state,
        PostalCode: stripeCustomer.address.postal_code,
        Country: stripeCustomer.address.country
      } : undefined,
      CustomField: [
        {
          DefinitionId: '1',
          Name: 'Stripe Customer ID',
          Type: 'StringType',
          StringValue: stripeCustomer.id
        }
      ],
      Source: 'Stripe'
    };
    
    if (existingCustomer) {
      customerData.Id = existingCustomer.Id;
      
      await this.quickbooks.makeAPIRequest(`customer/${existingCustomer.Id}`, {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    } else {
      await this.quickbooks.makeAPIRequest('customer', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    }
  }
  
  async syncStripeChargeToQBPayment(stripeCharge) {
    // Find customer
    const customer = await this.findQBCustomerByStripeId(stripeCharge.customer);
    if (!customer) {
      console.warn(`Customer for charge ${stripeCharge.id} not found`);
      return;
    }
    
    // Find related invoice if payment intent has invoice
    let linkedTxn = null;
    if (stripeCharge.payment_intent) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(stripeCharge.payment_intent);
      if (paymentIntent.invoice) {
        const qbInvoice = await this.findQBInvoiceByStripeId(paymentIntent.invoice);
        if (qbInvoice) {
          linkedTxn = {
            TxnId: qbInvoice.Id,
            TxnType: 'Invoice'
          };
        }
      }
    }
    
    const paymentData = {
      CustomerRef: { value: customer.Id },
      TotalAmt: stripeCharge.amount / 100, // Convert from cents
      ProcessPayment: false, // Already processed by Stripe
      DepositToAccountRef: { value: '1' }, // Undeposited Funds
      PaymentMethodRef: { value: '1' }, // Check - would need to create Stripe payment method
      PaymentRefNum: stripeCharge.id,
      Line: linkedTxn ? [
        {
          Amount: stripeCharge.amount / 100,
          LinkedTxn: [linkedTxn]
        }
      ] : [
        {
          Amount: stripeCharge.amount / 100
        }
      ],
      CustomField: [
        {
          DefinitionId: '2',
          Name: 'Stripe Charge ID',
          Type: 'StringType',
          StringValue: stripeCharge.id
        }
      ],
      Source: 'Stripe'
    };
    
    await this.quickbooks.makeAPIRequest('payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }
  
  async syncStripeSubscriptionToQB(stripeSubscription) {
    // Find customer
    const customer = await this.findQBCustomerByStripeId(stripeSubscription.customer);
    if (!customer) {
      console.warn(`Customer for subscription ${stripeSubscription.id} not found`);
      return;
    }
    
    // Create recurring invoice template
    const subscriptionData = {
      Name: `Subscription ${stripeSubscription.id}`,
      Type: 'Invoice',
      CustomerRef: { value: customer.Id },
      RecurData: {
        RecurType: 'Automated',
        Active: true,
        Schedule: {
          IntervalType: 'Monthly', // Would need to map from Stripe interval
          IntervalCount: 1
        }
      },
      Line: stripeSubscription.items.data.map(item => ({
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { name: item.price.product }, // Would need to map to QB item
          Qty: item.quantity,
          UnitPrice: item.price.unit_amount / 100
        },
        Amount: (item.price.unit_amount * item.quantity) / 100
      })),
      CustomField: [
        {
          DefinitionId: '3',
          Name: 'Stripe Subscription ID',
          Type: 'StringType',
          StringValue: stripeSubscription.id
        }
      ],
      Source: 'Stripe'
    };
    
    await this.quickbooks.makeAPIRequest('recurringtransaction', {
      method: 'POST',
      body: JSON.stringify(subscriptionData)
    });
  }
  
  // Helper methods
  async findQBCustomerByStripeId(stripeId) {
    const response = await this.quickbooks.makeAPIRequest(`customer?where=CustomField[1].StringValue='${stripeId}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Customer ? data.QueryResponse.Customer[0] : null;
  }
  
  async findQBInvoiceByStripeId(stripeInvoiceId) {
    const response = await this.quickbooks.makeAPIRequest(`invoice?where=CustomField[4].StringValue='${stripeInvoiceId}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Invoice ? data.QueryResponse.Invoice[0] : null;
  }
  
  // Webhook handling for real-time updates
  async handleStripeWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.created':
        case 'customer.updated':
          await this.syncStripeCustomerToQB(event.data.object);
          break;
          
        case 'charge.succeeded':
          await this.syncStripeChargeToQBPayment(event.data.object);
          break;
          
        case 'invoice.payment_succeeded':
          await this.handleStripeInvoicePayment(event.data.object);
          break;
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.syncStripeSubscriptionToQB(event.data.object);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object);
          break;
          
        default:
          console.log(`Unhandled Stripe event: ${event.type}`);
      }
    } catch (error) {
      console.error(`Stripe webhook processing failed:`, error);
      throw error;
    }
  }
  
  async handleStripeInvoicePayment(stripeInvoice) {
    // Handle invoice payment success
    const qbInvoice = await this.findQBInvoiceByStripeId(stripeInvoice.id);
    if (qbInvoice) {
      // Update invoice status or create payment record
      console.log(`Payment received for invoice ${qbInvoice.Id}`);
    }
  }
  
  async handleSubscriptionCancellation(stripeSubscription) {
    // Handle subscription cancellation
    console.log(`Subscription ${stripeSubscription.id} cancelled`);
    // Would need to deactivate corresponding QB recurring transaction
  }
  
  // Refund handling
  async handleRefund(stripeRefund) {
    // Find original payment
    const originalCharge = await this.stripe.charges.retrieve(stripeRefund.charge);
    const qbPayment = await this.findQBPaymentByStripeId(originalCharge.id);
    
    if (qbPayment) {
      // Create credit memo or negative payment
      const refundData = {
        CustomerRef: qbPayment.CustomerRef,
        TotalAmt: stripeRefund.amount / 100,
        RemainingCredit: stripeRefund.amount / 100,
        CustomField: [
          {
            DefinitionId: '5',
            Name: 'Stripe Refund ID',
            Type: 'StringType',
            StringValue: stripeRefund.id
          }
        ],
        Source: 'Stripe'
      };
      
      await this.quickbooks.makeAPIRequest('creditmemo', {
        method: 'POST',
        body: JSON.stringify(refundData)
      });
    }
  }
  
  async findQBPaymentByStripeId(stripeChargeId) {
    const response = await this.quickbooks.makeAPIRequest(`payment?where=PaymentRefNum='${stripeChargeId}'`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.QueryResponse.Payment ? data.QueryResponse.Payment[0] : null;
  }
  
  // Monitoring and reporting
  async getSyncStatus() {
    return {
      lastCustomerSync: this.lastSync.get('customers'),
      lastChargeSync: this.lastSync.get('charges'),
      lastSubscriptionSync: this.lastSync.get('subscriptions'),
      stripeConnection: 'Connected' // Would check actual connection
    };
  }
  
  async getSyncStatistics() {
    // In a real implementation, you'd track these metrics
    return {
      customersSynced: 0,
      chargesSynced: 0,
      subscriptionsSynced: 0,
      refundsProcessed: 0,
      errors: 0,
      lastSyncDuration: 0
    };
  }
  
  // Utility method to construct webhook event
  constructWebhookEvent(payload, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      throw new Error('Invalid webhook signature');
    }
    
    return JSON.parse(payload);
  }
}

// Usage example
const stripeIntegration = new StripeIntegration({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  quickbooksClient: quickbooksClient
});

// Initial sync
await stripeIntegration.syncCustomers();
await stripeIntegration.syncCharges();
await stripeIntegration.syncSubscriptions();

// Webhook endpoint for real-time updates
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const event = stripeIntegration.constructWebhookEvent(req.body, signature);
    await stripeIntegration.handleStripeWebhook(event);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(400).send('Webhook Error');
  }
});

// Periodic sync for any missed events
setInterval(async () => {
  const lastSync = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
  await stripeIntegration.syncCharges(lastSync);
}, 6 * 60 * 60 * 1000); // Every 6 hours
```

## API Security

### Authentication Security

#### Token Management
```javascript
class SecureTokenManager {
  constructor(config) {
    this.encryptionKey = config.encryptionKey;
    this.tokenStore = new Map();
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
  }
  
  // Securely store tokens
  async storeTokens(companyId, tokens) {
    const encryptedTokens = await this.encryptTokens(tokens);
    const tokenData = {
      tokens: encryptedTokens,
      stored: new Date(),
      expires: new Date(Date.now() + (tokens.expires_in * 1000))
    };
    
    this.tokenStore.set(companyId, tokenData);
    return tokenData;
  }
  
  // Retrieve and decrypt tokens
  async getTokens(companyId) {
    const tokenData = this.tokenStore.get(companyId);
    if (!tokenData) {
      throw new Error('No tokens found for company');
    }
    
    // Check if tokens are expired
    if (new Date() > tokenData.expires) {
      throw new Error('Tokens have expired');
    }
    
    const decryptedTokens = await this.decryptTokens(tokenData.tokens);
    return decryptedTokens;
  }
  
  // Check if tokens need refresh
  shouldRefreshTokens(companyId) {
    const tokenData = this.tokenStore.get(companyId);
    if (!tokenData) return true;
    
    const timeUntilExpiry = tokenData.expires - new Date();
    return timeUntilExpiry < this.refreshThreshold;
  }
  
  // Refresh tokens securely
  async refreshTokens(companyId, refreshToken) {
    const tokenResponse = await this.performTokenRefresh(refreshToken);
    await this.storeTokens(companyId, tokenResponse);
    return tokenResponse;
  }
  
  // Encrypt tokens before storage
  async encryptTokens(tokens) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(JSON.stringify(tokens), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  // Decrypt tokens after retrieval
  async decryptTokens(encryptedData) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    decipher.setIV(Buffer.from(encryptedData.iv, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
  
  // Perform secure token refresh
  async performTokenRefresh(refreshToken) {
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    
    const tokens = await response.json();
    
    // Validate token response
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Invalid token response');
    }
    
    return tokens;
  }
  
  // Clean up expired tokens
  cleanupExpiredTokens() {
    const now = new Date();
    
    for (const [companyId, tokenData] of this.tokenStore) {
      if (now > tokenData.expires) {
        this.tokenStore.delete(companyId);
        console.log(`Cleaned up expired tokens for company ${companyId}`);
      }
    }
  }
  
  // Get token status
  getTokenStatus(companyId) {
    const tokenData = this.tokenStore.get(companyId);
    
    if (!tokenData) {
      return { status: 'NO_TOKENS' };
    }
    
    const now = new Date();
    const isExpired = now > tokenData.expires;
    const needsRefresh = this.shouldRefreshTokens(companyId);
    
    return {
      status: isExpired ? 'EXPIRED' : needsRefresh ? 'NEEDS_REFRESH' : 'VALID',
      stored: tokenData.stored,
      expires: tokenData.expires,
      timeUntilExpiry: tokenData.expires - now
    };
  }
}

// Usage
const tokenManager = new SecureTokenManager({
  encryptionKey: process.env.TOKEN_ENCRYPTION_KEY
});

// Store tokens securely
await tokenManager.storeTokens(companyId, {
  access_token: 'access_token_here',
  refresh_token: 'refresh_token_here',
  expires_in: 3600
});

// Retrieve tokens securely
const tokens = await tokenManager.getTokens(companyId);

// Check if refresh needed
if (tokenManager.shouldRefreshTokens(companyId)) {
  const newTokens = await tokenManager.refreshTokens(companyId, tokens.refresh_token);
  console.log('Tokens refreshed successfully');
}

// Periodic cleanup
setInterval(() => {
  tokenManager.cleanupExpiredTokens();
}, 60 * 60 * 1000); // Every hour
```

#### Request Signing and Verification
```javascript
class RequestSigner {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }
  
  // Sign API request
  signRequest(method, url, body = null, timestamp = null) {
    const crypto = require('crypto');
    
    if (!timestamp) {
      timestamp = Math.floor(Date.now() / 1000);
    }
    
    const message = `${method.toUpperCase()}${url}${body || ''}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
    
    return {
      signature,
      timestamp,
      headers: {
        'X-API-Signature': signature,
        'X-API-Timestamp': timestamp.toString()
      }
    };
  }
  
  // Verify incoming request signature
  verifyRequestSignature(method, url, body, signature, timestamp) {
    const expectedSignature = this.signRequest(method, url, body, timestamp).signature;
    const timeDiff = Math.abs(Date.now() / 1000 - timestamp);
    
    // Check if signature matches and timestamp is within 5 minutes
    return signature === expectedSignature && timeDiff <= 300;
  }
  
  // Sign webhook payload
  signWebhookPayload(payload) {
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${JSON.stringify(payload)}${timestamp}`;
    
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
    
    return {
      signature,
      timestamp,
      payload
    };
  }
  
  // Verify webhook signature
  verifyWebhookSignature(payload, signature, timestamp) {
    const expected = this.signWebhookPayload(payload);
    const timeDiff = Math.abs(Date.now() / 1000 - timestamp);
    
    return signature === expected.signature && timeDiff <= 300;
  }
}

// Usage
const requestSigner = new RequestSigner(process.env.API_SECRET_KEY);

// Sign outgoing request
const signedRequest = requestSigner.signRequest(
  'POST',
  '/v3/company/123/customer',
  JSON.stringify(customerData)
);

// Make request with signature headers
await fetch('https://quickbooks.api.intuit.com/v3/company/123/customer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...signedRequest.headers
  },
  body: JSON.stringify(customerData)
});

// Verify incoming webhook
app.post('/webhooks/secure', (req, res) => {
  const { signature, timestamp } = req.headers;
  const payload = req.body;
  
  if (requestSigner.verifyWebhookSignature(payload, signature, parseInt(timestamp))) {
    // Process webhook
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});
```

## Data Privacy

### GDPR Compliance Implementation

#### Data Subject Rights Handler
```javascript
class GDPRComplianceManager {
  constructor(quickbooksClient) {
    this.quickbooks = quickbooksClient;
    this.dataRetentionPolicy = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years
    this.consentLog = new Map();
  }
  
  // Handle data subject access request (DSAR)
  async handleDataAccessRequest(subjectId, subjectType = 'customer') {
    const accessLog = {
      requestId: this.generateRequestId(),
      subjectId,
      subjectType,
      requestType: 'ACCESS',
      timestamp: new Date(),
      dataRetrieved: [],
      status: 'PROCESSING'
    };
    
    try {
      // Find all data related to the subject
      const subjectData = await this.findSubjectData(subjectId, subjectType);
      
      // Log the access for audit purposes
      accessLog.dataRetrieved = subjectData.map(item => ({
        type: item.type,
        id: item.id,
        lastModified: item.lastModified
      }));
      
      accessLog.status = 'COMPLETED';
      
      // Return data to subject (in real implementation, this would be sent securely)
      return {
        requestId: accessLog.requestId,
        data: subjectData,
        retentionInfo: this.getRetentionInfo()
      };
      
    } catch (error) {
      accessLog.status = 'FAILED';
      accessLog.error = error.message;
      throw error;
    } finally {
      this.logAccessRequest(accessLog);
    }
  }
  
  // Handle data deletion request (Right to be Forgotten)
  async handleDataDeletionRequest(subjectId, subjectType = 'customer') {
    const deletionLog = {
      requestId: this.generateRequestId(),
      subjectId,
      subjectType,
      requestType: 'DELETION',
      timestamp: new Date(),
      dataDeleted: [],
      status: 'PROCESSING'
    };
    
    try {
      // Find all data related to the subject
      const subjectData = await this.findSubjectData(subjectId, subjectType);
      
      // Delete or anonymize data
      for (const item of subjectData) {
        await this.deleteOrAnonymizeData(item);
        deletionLog.dataDeleted.push({
          type: item.type,
          id: item.id,
          action: 'DELETED'
        });
      }
      
      deletionLog.status = 'COMPLETED';
      
      return {
        requestId: deletionLog.requestId,
        message: 'Data deletion completed',
        deletedItems: deletionLog.dataDeleted.length
      };
      
    } catch (error) {
      deletionLog.status = 'FAILED';
      deletionLog.error = error.message;
      throw error;
    } finally {
      this.logAccessRequest(deletionLog);
    }
  }
  
  // Handle data portability request
  async handleDataPortabilityRequest(subjectId, subjectType = 'customer') {
    const portabilityLog = {
      requestId: this.generateRequestId(),
      subjectId,
      subjectType,
      requestType: 'PORTABILITY',
      timestamp: new Date(),
      dataExported: [],
      status: 'PROCESSING'
    };
    
    try {
      // Find all data related to the subject
      const subjectData = await this.findSubjectData(subjectId, subjectType);
      
      // Export data in portable format
      const exportedData = await this.exportSubjectData(subjectData);
      
      portabilityLog.dataExported = subjectData.map(item => ({
        type: item.type,
        id: item.id,
        exported: true
      }));
      
      portabilityLog.status = 'COMPLETED';
      
      return {
        requestId: portabilityLog.requestId,
        data: exportedData,
        format: 'JSON',
        exportDate: new Date()
      };
      
    } catch (error) {
      portabilityLog.status = 'FAILED';
      portabilityLog.error = error.message;
      throw error;
    } finally {
      this.logAccessRequest(portabilityLog);
    }
  }
  
  // Find all data related to a subject
  async findSubjectData(subjectId, subjectType) {
    const subjectData = [];
    
    try {
      // Find customer record
      if (subjectType === 'customer') {
        const customerResponse = await this.quickbooks.makeAPIRequest(`customer/${subjectId}`);
        if (customerResponse.ok) {
          const customer = await customerResponse.json();
          subjectData.push({
            type: 'Customer',
            id: subjectId,
            data: customer,
            lastModified: customer.MetaData.LastUpdatedTime
          });
        }
      }
      
      // Find related transactions
      const transactions = await this.findRelatedTransactions(subjectId);
      subjectData.push(...transactions);
      
      // Find related attachments
      const attachments = await this.findRelatedAttachments(subjectId);
      subjectData.push(...attachments);
      
    } catch (error) {
      console.error('Error finding subject data:', error);
    }
    
    return subjectData;
  }
  
  // Find transactions related to subject
  async findRelatedTransactions(subjectId) {
    const transactions = [];
    
    // Find invoices
    const invoiceResponse = await this.quickbooks.makeAPIRequest(`invoice?where=CustomerRef.value='${subjectId}'`);
    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      if (invoiceData.QueryResponse.Invoice) {
        invoiceData.QueryResponse.Invoice.forEach(invoice => {
          transactions.push({
            type: 'Invoice',
            id: invoice.Id,
            data: invoice,
            lastModified: invoice.MetaData.LastUpdatedTime
          });
        });
      }
    }
    
    // Find payments
    const paymentResponse = await this.quickbooks.makeAPIRequest(`payment?where=CustomerRef.value='${subjectId}'`);
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      if (paymentData.QueryResponse.Payment) {
        paymentData.QueryResponse.Payment.forEach(payment => {
          transactions.push({
            type: 'Payment',
            id: payment.Id,
            data: payment,
            lastModified: payment.MetaData.LastUpdatedTime
          });
        });
      }
    }
    
    return transactions;
  }
  
  // Find attachments related to subject
  async findRelatedAttachments(subjectId) {
    const attachments = [];
    
    // Find attachments linked to customer
    const attachResponse = await this.quickbooks.makeAPIRequest(`attachable?where=AttachableRef.EntityRef.type='Customer' AND AttachableRef.EntityRef.value='${subjectId}'`);
    if (attachResponse.ok) {
      const attachData = await attachResponse.json();
      if (attachData.QueryResponse.Attachable) {
        attachData.QueryResponse.Attachable.forEach(attachment => {
          attachments.push({
            type: 'Attachment',
            id: attachment.Id,
            data: attachment,
            lastModified: attachment.MetaData.LastUpdatedTime
          });
        });
      }
    }
    
    return attachments;
  }
  
  // Delete or anonymize data
  async deleteOrAnonymizeData(item) {
    try {
      switch (item.type) {
        case 'Customer':
          // Anonymize customer data instead of deleting (to maintain referential integrity)
          await this.anonymizeCustomer(item.id);
          break;
          
        case 'Invoice':
        case 'Payment':
          // Delete transaction
          await this.quickbooks.makeAPIRequest(`${item.type.toLowerCase()}/${item.id}`, {
            method: 'POST',
            body: JSON.stringify({
              Id: item.id,
              Active: false // Soft delete
            })
          });
          break;
          
        case 'Attachment':
          // Delete attachment
          await this.quickbooks.makeAPIRequest(`attachable/${item.id}`, {
            method: 'DELETE'
          });
          break;
      }
    } catch (error) {
      console.error(`Error deleting/anonymizing ${item.type} ${item.id}:`, error);
    }
  }
  
  // Anonymize customer data
  async anonymizeCustomer(customerId) {
    const anonymizedData = {
      Id: customerId,
      Name: 'Anonymous Customer',
      CompanyName: 'Anonymous Company',
      PrimaryEmailAddr: {
        Address: 'anonymized@example.com'
      },
      BillAddr: {
        Line1: 'Anonymized Address',
        City: 'Anonymized City',
        CountrySubDivisionCode: 'XX',
        PostalCode: '00000',
        Country: 'XX'
      },
      CustomField: [
        {
          DefinitionId: '1',
          Name: 'Anonymized',
          Type: 'StringType',
          StringValue: 'true'
        }
      ]
    };
    
    await this.quickbooks.makeAPIRequest(`customer/${customerId}`, {
      method: 'POST',
      body: JSON.stringify(anonymizedData)
    });
  }
  
  // Export subject data
  async exportSubjectData(subjectData) {
    const exportData = {
      exportDate: new Date(),
      subjectData: subjectData.map(item => ({
        type: item.type,
        id: item.id,
        data: item.data,
        lastModified: item.lastModified
      }))
    };
    
    return exportData;
  }
  
  // Log access/deletion requests
  logAccessRequest(logEntry) {
    // In real implementation, save to secure audit log
    console.log('GDPR Request Log:', logEntry);
  }
  
  // Get data retention information
  getRetentionInfo() {
    return {
      retentionPeriod: `${this.dataRetentionPolicy / (365 * 24 * 60 * 60 * 1000)} years`,
      retentionReason: 'Legal and regulatory compliance',
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };
  }
  
  // Generate unique request ID
  generateRequestId() {
    return `gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Check data retention compliance
  async checkRetentionCompliance() {
    const cutoffDate = new Date(Date.now() - this.dataRetentionPolicy);
    
    // Find old data that should be reviewed for deletion
    const oldCustomers = await this.findOldData('customer', cutoffDate);
    const oldTransactions = await this.findOldData('invoice', cutoffDate);
    
    return {
      customersToReview: oldCustomers.length,
      transactionsToReview: oldTransactions.length,
      cutoffDate,
      recommendations: this.generateRetentionRecommendations(oldCustomers, oldTransactions)
    };
  }
  
  // Find old data for retention review
  async findOldData(entityType, cutoffDate) {
    const response = await this.quickbooks.makeAPIRequest(`${entityType}?where=MetaData.LastUpdatedTime < '${cutoffDate.toISOString()}'`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.QueryResponse[entityType] || [];
  }
  
  // Generate retention recommendations
  generateRetentionRecommendations(oldCustomers, oldTransactions) {
    const recommendations = [];
    
    if (oldCustomers.length > 0) {
      recommendations.push({
        type: 'CUSTOMER_DATA',
        count: oldCustomers.length,
        action: 'Review for anonymization or deletion',
        priority: 'MEDIUM'
      });
    }
    
    if (oldTransactions.length > 0) {
      recommendations.push({
        type: 'TRANSACTION_DATA',
        count: oldTransactions.length,
        action: 'Archive to long-term storage',
        priority: 'LOW'
      });
    }
    
    return recommendations;
  }
}

// Usage
const gdprManager = new GDPRComplianceManager(quickbooksClient);

// Handle data access request
const accessResult = await gdprManager.handleDataAccessRequest('CUSTOMER_ID_123');
console.log('Data access result:', accessResult);

// Handle data deletion request
const deletionResult = await gdprManager.handleDataDeletionRequest('CUSTOMER_ID_123');
console.log('Data deletion result:', deletionResult);

// Handle data portability request
const portabilityResult = await gdprManager.handleDataPortabilityRequest('CUSTOMER_ID_123');
console.log('Data portability result:', portabilityResult);

// Check retention compliance
const complianceCheck = await gdprManager.checkRetentionCompliance();
console.log('Retention compliance:', complianceCheck);
```

## Performance Optimization

### API Performance Optimization

#### Connection Pooling
```javascript
class ConnectionPoolManager {
  constructor(config) {
    this.maxConnections = config.maxConnections || 10;
    this.connectionTimeout = config.connectionTimeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.connections = [];
    this.availableConnections = [];
    this.waitingQueue = [];
  }
  
  // Get connection from pool
  async getConnection() {
    return new Promise((resolve, reject) => {
      // Check for available connection
      if (this.availableConnections.length > 0) {
        const connection = this.availableConnections.pop();
        resolve(connection);
        return;
      }
      
      // Check if we can create new connection
      if (this.connections.length < this.maxConnections) {
        const connection = this.createConnection();
        this.connections.push(connection);
        resolve(connection);
        return;
      }
      
      // Add to waiting queue
      this.waitingQueue.push({ resolve, reject });
      
      // Set timeout for waiting
      setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
        if (index > -1) {
          this.waitingQueue.splice(index, 1);
          reject(new Error('Connection timeout'));
        }
      }, this.connectionTimeout);
    });
  }
  
  // Return connection to pool
  releaseConnection(connection) {
    // Check if anyone is waiting
    if (this.waitingQueue.length > 0) {
      const waiting = this.waitingQueue.shift();
      waiting.resolve(connection);
      return;
    }
    
    // Add to available connections
    this.availableConnections.push(connection);
    
    // Clean up old connections
    this.cleanupConnections();
  }
  
  // Create new connection
  createConnection() {
    return {
      id: this.generateConnectionId(),
      created: new Date(),
      lastUsed: new Date(),
      activeRequests: 0,
      isHealthy: true
    };
  }
  
  // Execute request with connection pooling
  async executeRequest(url, options = {}) {
    const connection = await this.getConnection();
    
    try {
      connection.lastUsed = new Date();
      connection.activeRequests++;
      
      const response = await this.makeRequest(url, options, connection);
      
      return response;
    } catch (error) {
      connection.isHealthy = false;
      throw error;
    } finally {
      connection.activeRequests--;
      this.releaseConnection(connection);
    }
  }
  
  // Make HTTP request with retry logic
  async makeRequest(url, options, connection) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Connection-Id': connection.id
          }
        });
        
        if (response.ok) {
          return response;
        }
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          await this.delay(delay);
          continue;
        }
        
        // Handle server errors
        if (response.status >= 500) {
          if (attempt < this.retryAttempts) {
            const delay = Math.pow(2, attempt) * 1000;
            await this.delay(delay);
            continue;
          }
        }
        
        return response;
        
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.delay(delay);
        }
      }
    }
    
    throw lastError;
  }
  
  // Clean up unhealthy or old connections
  cleanupConnections() {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    this.connections = this.connections.filter(connection => {
      const isOld = (now - connection.created) > maxAge;
      const isUnhealthy = !connection.isHealthy;
      
      if (isOld || isUnhealthy) {
        console.log(`Removing connection ${connection.id}: old=${isOld}, unhealthy=${isUnhealthy}`);
        return false;
      }
      
      return true;
    });
    
    // Also clean available connections
    this.availableConnections = this.availableConnections.filter(connection => {
      return this.connections.includes(connection);
    });
  }
  
  // Get pool statistics
  getPoolStats() {
    return {
      totalConnections: this.connections.length,
      availableConnections: this.availableConnections.length,
      waitingQueueLength: this.waitingQueue.length,
      maxConnections: this.maxConnections,
      healthyConnections: this.connections.filter(c => c.isHealthy).length,
      totalActiveRequests: this.connections.reduce((sum, c) => sum + c.activeRequests, 0)
    };
  }
  
  // Generate unique connection ID
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const connectionPool = new ConnectionPoolManager({
  maxConnections: 10,
  connectionTimeout: 30000,
  retryAttempts: 3
});

// Make API request using connection pool
const response = await connectionPool.executeRequest(
  'https://quickbooks.api.intuit.com/v3/company/123/customer',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  }
);

// Get pool statistics
const stats = connectionPool.getPoolStats();
console.log('Connection pool stats:', stats);
```

#### Response Caching Strategy
```javascript
class ResponseCacheManager {
  constructor(config) {
    this.cache = new Map();
    this.maxCacheSize = config.maxCacheSize || 1000;
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
  
  // Generate cache key
  generateCacheKey(method, url, body = null) {
    const crypto = require('crypto');
    const keyData = `${method}:${url}:${body || ''}`;
    return crypto.createHash('md5').update(keyData).digest('hex');
  }
  
  // Check if response is cached
  getCachedResponse(method, url, body = null) {
    const cacheKey = this.generateCacheKey(method, url, body);
    const cachedItem = this.cache.get(cacheKey);
    
    if (!cachedItem) {
      this.cacheMisses++;
      return null;
    }
    
    // Check if cache item has expired
    if (Date.now() > cachedItem.expires) {
      this.cache.delete(cacheKey);
      this.cacheMisses++;
      return null;
    }
    
    this.cacheHits++;
    return cachedItem.response;
  }
  
  // Cache response
  cacheResponse(method, url, body, response, ttl = null) {
    const cacheKey = this.generateCacheKey(method, url, body);
    const expires = Date.now() + (ttl || this.defaultTTL);
    
    // Clone response to avoid issues with consumed streams
    const cachedResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: null,
      cached: true,
      expires
    };
    
    // Only cache successful GET requests
    if (method === 'GET' && response.ok) {
      this.cache.set(cacheKey, {
        response: cachedResponse,
        expires,
        created: Date.now()
      });
      
      // Enforce cache size limit
      if (this.cache.size > this.maxCacheSize) {
        this.evictOldest();
      }
    }
    
    return cachedResponse;
  }
  
  // Make cached request
  async makeCachedRequest(url, options = {}) {
    const { method = 'GET', body = null, cache = true, ttl = null } = options;
    
    // Check cache first
    if (cache && method === 'GET') {
      const cachedResponse = this.getCachedResponse(method, url, body);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Make actual request
    const response = await fetch(url, options);
    
    // Cache response if appropriate
    if (cache && method === 'GET' && response.ok) {
      const cachedResponse = this.cacheResponse(method, url, body, response.clone(), ttl);
      return cachedResponse;
    }
    
    return response;
  }
  
  // Evict oldest cache entries
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, value] of this.cache) {
      if (value.created < oldestTime) {
        oldestTime = value.created;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  // Clear cache
  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
  
  // Get cache statistics
  getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;
    
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: `${hitRate.toFixed(2)}%`,
      oldestEntry: this.getOldestEntryTime(),
      newestEntry: this.getNewestEntryTime()
    };
  }
  
  // Get oldest entry time
  getOldestEntryTime() {
    let oldest = null;
    
    for (const value of this.cache.values()) {
      if (!oldest || value.created < oldest) {
        oldest = value.created;
      }
    }
    
    return oldest ? new Date(oldest) : null;
  }
  
  // Get newest entry time
  getNewestEntryTime() {
    let newest = null;
    
    for (const value of this.cache.values()) {
      if (!newest || value.created > newest) {
        newest = value.created;
      }
    }
    
    return newest ? new Date(newest) : null;
  }
  
  // Clean expired entries
  cleanExpiredEntries() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, value] of this.cache) {
      if (now > value.expires) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cleaned ${expiredKeys.length} expired cache entries`);
    }
  }
  
  // Set up automatic cleanup
  startCleanupInterval(intervalMs = 5 * 60 * 1000) { // 5 minutes
    setInterval(() => {
      this.cleanExpiredEntries();
    }, intervalMs);
  }
}

// Usage
const cacheManager = new ResponseCacheManager({
  maxCacheSize: 1000,
  defaultTTL: 5 * 60 * 1000 // 5 minutes
});

// Start automatic cleanup
cacheManager.startCleanupInterval();

// Make cached API request
const response = await cacheManager.makeCachedRequest(
  'https://quickbooks.api.intuit.com/v3/company/123/customer',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    },
    cache: true,
    ttl: 10 * 60 * 1000 // 10 minutes
  }
);

// Get cache statistics
const stats = cacheManager.getCacheStats();
console.log('Cache stats:', stats);
```

## Monitoring & Logging

### Comprehensive Monitoring System

#### API Usage Monitoring
```javascript
class APIMonitoringSystem {
  constructor(config) {
    this.metrics = new Map();
    this.alerts = [];
    this.thresholds = config.thresholds || {};
    this.notificationChannels = config.notificationChannels || [];
  }
  
  // Track API request
  trackRequest(requestData) {
    const {
      method,
      endpoint,
      statusCode,
      responseTime,
      userId,
      companyId,
      error = null
    } = requestData;
    
    const timestamp = new Date();
    const hour = timestamp.getHours();
    const date = timestamp.toISOString().split('T')[0];
    
    // Initialize metrics for this hour if not exists
    const hourKey = `${date}_${hour}`;
    if (!this.metrics.has(hourKey)) {
      this.metrics.set(hourKey, {
        requests: 0,
        errors: 0,
        responseTimeSum: 0,
        statusCodes: new Map(),
        endpoints: new Map(),
        users: new Set(),
        companies: new Set()
      });
    }
    
    const metrics = this.metrics.get(hourKey);
    
    // Update metrics
    metrics.requests++;
    metrics.responseTimeSum += responseTime;
    
    if (error || statusCode >= 400) {
      metrics.errors++;
    }
    
    // Track status codes
    const statusCount = metrics.statusCodes.get(statusCode) || 0;
    metrics.statusCodes.set(statusCode, statusCount + 1);
    
    // Track endpoints
    const endpointCount = metrics.endpoints.get(endpoint) || 0;
    metrics.endpoints.set(endpoint, endpointCount + 1);
    
    // Track users and companies
    if (userId) metrics.users.add(userId);
    if (companyId) metrics.companies.add(companyId);
    
    // Check thresholds and create alerts
    this.checkThresholds(metrics, hourKey);
  }
  
  // Check thresholds and create alerts
  checkThresholds(metrics, hourKey) {
    const errorRate = (metrics.errors / metrics.requests) * 100;
    const avgResponseTime = metrics.responseTimeSum / metrics.requests;
    
    // Error rate threshold
    if (this.thresholds.errorRate && errorRate > this.thresholds.errorRate) {
      this.createAlert({
        type: 'ERROR_RATE',
        severity: 'HIGH',
        message: `Error rate ${errorRate.toFixed(2)}% exceeds threshold ${this.thresholds.errorRate}%`,
        metrics: { errorRate, totalRequests: metrics.requests },
        timestamp: new Date()
      });
    }
    
    // Response time threshold
    if (this.thresholds.avgResponseTime && avgResponseTime > this.thresholds.avgResponseTime) {
      this.createAlert({
        type: 'RESPONSE_TIME',
        severity: 'MEDIUM',
        message: `Average response time ${avgResponseTime.toFixed(2)}ms exceeds threshold ${this.thresholds.avgResponseTime}ms`,
        metrics: { avgResponseTime, totalRequests: metrics.requests },
        timestamp: new Date()
      });
    }
    
    // High traffic alert
    if (this.thresholds.requestsPerHour && metrics.requests > this.thresholds.requestsPerHour) {
      this.createAlert({
        type: 'HIGH_TRAFFIC',
        severity: 'LOW',
        message: `Request volume ${metrics.requests} exceeds threshold ${this.thresholds.requestsPerHour} per hour`,
        metrics: { requestCount: metrics.requests },
        timestamp: new Date()
      });
    }
  }
  
  // Create alert
  createAlert(alertData) {
    const alert = {
      id: this.generateAlertId(),
      ...alertData,
      status: 'NEW'
    };
    
    this.alerts.push(alert);
    
    // Send notifications
    this.sendNotifications(alert);
  }
  
  // Send notifications
  async sendNotifications(alert) {
    for (const channel of this.notificationChannels) {
      try {
        await this.sendToChannel(channel, alert);
      } catch (error) {
        console.error(`Failed to send alert to ${channel.type}:`, error);
      }
    }
  }
  
  // Send to specific channel
  async sendToChannel(channel, alert) {
    switch (channel.type) {
      case 'email':
        await this.sendEmailAlert(channel, alert);
        break;
      case 'slack':
        await this.sendSlackAlert(channel, alert);
        break;
      case 'webhook':
        await this.sendWebhookAlert(channel, alert);
        break;
      default:
        console.log(`Unknown channel type: ${channel.type}`);
    }
  }
  
  // Get monitoring metrics
  getMetrics(timeRange = 24) { // hours
    const cutoffTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    const relevantMetrics = [];
    
    for (const [hourKey, metrics] of this.metrics) {
      const [date, hour] = hourKey.split('_');
      const metricTime = new Date(`${date}T${hour.padStart(2, '0')}:00:00`);
      
      if (metricTime >= cutoffTime) {
        relevantMetrics.push({
          timestamp: metricTime,
          ...metrics,
          avgResponseTime: metrics.requests > 0 ? metrics.responseTimeSum / metrics.requests : 0,
          errorRate: metrics.requests > 0 ? (metrics.errors / metrics.requests) * 100 : 0,
          uniqueUsers: metrics.users.size,
          uniqueCompanies: metrics.companies.size
        });
      }
    }
    
    return relevantMetrics.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  // Get alerts
  getAlerts(status = 'NEW', limit = 50) {
    return this.alerts
      .filter(alert => alert.status === status)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  // Update alert status
  updateAlertStatus(alertId, status) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      alert.updated = new Date();
      return true;
    }
    return false;
  }
  
  // Clean old metrics
  cleanOldMetrics(retentionHours = 168) { // 7 days
    const cutoffTime = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
    const keysToDelete = [];
    
    for (const [hourKey, metrics] of this.metrics) {
      const [date, hour] = hourKey.split('_');
      const metricTime = new Date(`${date}T${hour.padStart(2, '0')}:00:00`);
      
      if (metricTime < cutoffTime) {
        keysToDelete.push(hourKey);
      }
    }
    
    keysToDelete.forEach(key => this.metrics.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cleaned ${keysToDelete.length} old metric entries`);
    }
  }
  
  // Generate unique IDs
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Placeholder notification methods (implement based on your needs)
  async sendEmailAlert(channel, alert) {
    console.log(`Sending email alert to ${channel.email}: ${alert.message}`);
    // Implement email sending logic
  }
  
  async sendSlackAlert(channel, alert) {
    console.log(`Sending Slack alert to ${channel.webhookUrl}: ${alert.message}`);
    // Implement Slack webhook logic
  }
  
  async sendWebhookAlert(channel, alert) {
    console.log(`Sending webhook alert to ${channel.url}: ${alert.message}`);
    // Implement webhook logic
  }
}

// Usage
const monitoringSystem = new APIMonitoringSystem({
  thresholds: {
    errorRate: 5, // 5%
    avgResponseTime: 2000, // 2 seconds
    requestsPerHour: 10000
  },
  notificationChannels: [
    { type: 'email', email: 'admin@example.com' },
    { type: 'slack', webhookUrl: 'https://hooks.slack.com/services/...' }
  ]
});

// Track API request
monitoringSystem.trackRequest({
  method: 'GET',
  endpoint: '/customer',
  statusCode: 200,
  responseTime: 150,
  userId: 'user123',
  companyId: 'company456'
});

// Get metrics
const metrics = monitoringSystem.getMetrics(24);
console.log('API Metrics:', metrics);

// Get alerts
const alerts = monitoringSystem.getAlerts();
console.log('Active Alerts:', alerts);

// Clean old data
monitoringSystem.cleanOldMetrics();
```

#### Performance Monitoring Dashboard
```javascript
class PerformanceDashboard {
  constructor(monitoringSystem) {
    this.monitoringSystem = monitoringSystem;
    this.dashboardData = null;
    this.lastUpdate = null;
  }
  
  // Generate dashboard data
  async generateDashboard(timeRange = 24) {
    const metrics = this.monitoringSystem.getMetrics(timeRange);
    const alerts = this.monitoringSystem.getAlerts();
    
    // Calculate key performance indicators
    const kpis = this.calculateKPIs(metrics);
    
    // Generate charts data
    const charts = this.generateCharts(metrics);
    
    // Create summary
    const summary = this.generateSummary(metrics, alerts);
    
    this.dashboardData = {
      generated: new Date(),
      timeRange,
      kpis,
      charts,
      summary,
      alerts: alerts.slice(0, 10), // Top 10 alerts
      rawMetrics: metrics
    };
    
    this.lastUpdate = new Date();
    
    return this.dashboardData;
  }
  
  // Calculate key performance indicators
  calculateKPIs(metrics) {
    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        throughput: 0
      };
    }
    
    const totalRequests = metrics.reduce((sum, m) => sum + m.requests, 0);
    const totalResponseTime = metrics.reduce((sum, m) => sum + m.responseTimeSum, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
    
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const throughput = totalRequests / metrics.length; // requests per hour
    
    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      throughput: Math.round(throughput),
      trend: this.calculateTrend(metrics, 'avgResponseTime')
    };
  }
  
  // Calculate trend for a metric
  calculateTrend(metrics, metricName) {
    if (metrics.length < 2) return 'stable';
    
    const sorted = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + m[metricName], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m[metricName], 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }
  
  // Generate charts data
  generateCharts(metrics) {
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    
    return {
      responseTime: {
        labels: sortedMetrics.map(m => m.timestamp.toISOString().slice(11, 16)), // HH:MM
        data: sortedMetrics.map(m => m.avgResponseTime)
      },
      
      requestVolume: {
        labels: sortedMetrics.map(m => m.timestamp.toISOString().slice(11, 16)),
        data: sortedMetrics.map(m => m.requests)
      },
      
      errorRate: {
        labels: sortedMetrics.map(m => m.timestamp.toISOString().slice(11, 16)),
        data: sortedMetrics.map(m => m.errorRate)
      },
      
      statusCodes: this.generateStatusCodeChart(metrics)
    };
  }
  
  // Generate status code distribution chart
  generateStatusCodeChart(metrics) {
    const statusCounts = {};
    
    metrics.forEach(metric => {
      metric.statusCodes.forEach((count, status) => {
        statusCounts[status] = (statusCounts[status] || 0) + count;
      });
    });
    
    return {
      labels: Object.keys(statusCounts),
      data: Object.values(statusCounts)
    };
  }
  
  // Generate summary
  generateSummary(metrics, alerts) {
    const totalRequests = metrics.reduce((sum, m) => sum + m.requests, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length;
    
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
    const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;
    
    let healthStatus = 'healthy';
    if (criticalAlerts > 0) healthStatus = 'critical';
    else if (highAlerts > 0) healthStatus = 'warning';
    
    return {
      totalRequests,
      totalErrors,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0,
      activeAlerts: alerts.length,
      criticalAlerts,
      highAlerts,
      healthStatus,
      uptime: '99.9%', // Would be calculated from actual data
      lastIncident: null // Would be tracked separately
    };
  }
  
  // Get dashboard data
  getDashboardData() {
    return this.dashboardData;
  }
  
  // Check if dashboard needs refresh
  needsRefresh(maxAge = 5 * 60 * 1000) { // 5 minutes
    if (!this.lastUpdate) return true;
    return (new Date() - this.lastUpdate) > maxAge;
  }
  
  // Export dashboard data
  exportDashboard(format = 'json') {
    if (!this.dashboardData) {
      throw new Error('No dashboard data available');
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(this.dashboardData, null, 2);
      case 'csv':
        return this.convertToCSV(this.dashboardData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  // Convert dashboard to CSV
  convertToCSV(data) {
    const rows = [
      ['Metric', 'Value'],
      ['Total Requests', data.summary.totalRequests],
      ['Average Response Time', data.summary.avgResponseTime + 'ms'],
      ['Error Rate', data.summary.errorRate + '%'],
      ['Active Alerts', data.summary.activeAlerts],
      ['Health Status', data.summary.healthStatus]
    ];
    
    return rows.map(row => row.join(',')).join('\n');
  }
  
  // Get real-time metrics
  async getRealTimeMetrics() {
    const recentMetrics = this.monitoringSystem.getMetrics(1); // Last hour
    
    if (recentMetrics.length === 0) {
      return {
        currentRPS: 0,
        avgResponseTime: 0,
        errorRate: 0,
        activeUsers: 0
      };
    }
    
    const latest = recentMetrics[0];
    const requestsPerSecond = latest.requests / 3600; // Approximate RPS
    
    return {
      currentRPS: Math.round(requestsPerSecond * 100) / 100,
      avgResponseTime: Math.round(latest.avgResponseTime),
      errorRate: Math.round(latest.errorRate * 100) / 100,
      activeUsers: latest.uniqueUsers,
      timestamp: latest.timestamp
    };
  }
}

// Usage
const dashboard = new PerformanceDashboard(monitoringSystem);

// Generate dashboard
await dashboard.generateDashboard(24); // 24 hours
const dashboardData = dashboard.getDashboardData();

console.log('Performance Dashboard:', dashboardData);

// Get real-time metrics
const realTimeMetrics = await dashboard.getRealTimeMetrics();
console.log('Real-time Metrics:', realTimeMetrics);

// Export dashboard
const csvExport = dashboard.exportDashboard('csv');
console.log('Dashboard CSV:', csvExport);
```

This completes the comprehensive QuickBooks Online Developer Guide with advanced API integration patterns, enterprise features, security implementations, and performance optimization strategies. The guide provides developers with everything needed to build robust, scalable integrations with QuickBooks Online. 

---

*For basic user operations and getting started, see the QuickBooks User Guide. For advanced administration and management, see the QuickBooks Admin Guide. For quick reference materials, see the QuickBooks Reference Guide.*
