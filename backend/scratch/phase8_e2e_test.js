const BASE_URL = 'http://localhost:5000';

async function runPhase8Suite() {
  console.log('====================================================');
  console.log('  STARTING PHASE 8 END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  const results = {};

  // 1. Health Check
  try {
    const health = await fetch(`${BASE_URL}/api/health`).then(r => r.json());
    results['Health Check'] = health.status === 'success' ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Health Check'] = 'FAIL';
  }

  // 2. Authentication Test
  let adminToken = '';
  let salesToken = '';
  let warehouseToken = '';
  let accountsToken = '';

  try {
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@erp.com', password: 'Password123!' }),
    }).then(r => r.json());

    const salesRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sales@erp.com', password: 'Password123!' }),
    }).then(r => r.json());

    const warehouseRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'warehouse@erp.com', password: 'Password123!' }),
    }).then(r => r.json());

    const accountsRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'accounts@erp.com', password: 'Password123!' }),
    }).then(r => r.json());

    adminToken = adminRes.data?.token;
    salesToken = salesRes.data?.token;
    warehouseToken = warehouseRes.data?.token;
    accountsToken = accountsRes.data?.token;

    // Test invalid credentials
    const invalidRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@erp.com', password: 'WrongPassword!' }),
    });

    results['Authentication'] = adminToken && salesToken && warehouseToken && accountsToken && invalidRes.status === 401 ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Authentication'] = 'FAIL';
  }

  // 3. Role Authorization Matrix Test
  try {
    // Accounts role trying to perform stock adjustment (Restricted -> HTTP 403)
    const accountsAdjustRes = await fetch(`${BASE_URL}/api/inventory/adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accountsToken}` },
      body: JSON.stringify({ productId: '123', movementType: 'IN', quantity: 5, reason: 'Unauthorized Test' }),
    });

    // Warehouse role trying to perform stock adjustment (Allowed -> HTTP 200/404)
    const warehouseAdjustRes = await fetch(`${BASE_URL}/api/inventory/adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${warehouseToken}` },
      body: JSON.stringify({ productId: 'invalid-id', movementType: 'IN', quantity: 5, reason: 'Authorized Test' }),
    });

    results['Role Authorization'] = accountsAdjustRes.status === 403 && warehouseAdjustRes.status !== 403 ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Role Authorization'] = 'FAIL';
  }

  // 4. Customer CRM Test
  let testCustomerId = '';
  try {
    const createCustRes = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({
        name: 'Phase 8 Audit Customer',
        mobile: '9876543210',
        email: `audit_${Date.now()}@customer.com`,
        businessName: 'Phase 8 Enterprise Solutions',
        gstNumber: '27AAAAA0000A1Z5',
        customerType: 'WHOLESALE',
        address: 'Phase 8 Tech Park, Mumbai',
      }),
    }).then(r => r.json());

    testCustomerId = createCustRes.data?.customer?.id;

    // Add note
    const noteRes = await fetch(`${BASE_URL}/api/customers/${testCustomerId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({ note: 'E2E Phase 8 Follow-up call logged.' }),
    }).then(r => r.json());

    results['Customer CRM'] = testCustomerId && noteRes.success ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Customer CRM'] = 'FAIL';
  }

  // 5. Products Catalog Test
  let testProductId = '';
  const uniqueSku = `P8-SKU-${Date.now()}`;
  try {
    const createProdRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Phase 8 Precision Gearbox',
        sku: uniqueSku,
        category: 'Machinery',
        unitPrice: 12500,
        currentStock: 50,
        minimumStock: 10,
        warehouseLocation: 'Bay 4 - Rack 2',
      }),
    }).then(r => r.json());

    testProductId = createProdRes.data?.product?.id;

    // Test duplicate SKU rejection
    const dupSkuRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Duplicate Product',
        sku: uniqueSku,
        category: 'Machinery',
        unitPrice: 500,
        currentStock: 10,
        minimumStock: 5,
        warehouseLocation: 'Bay 1',
      }),
    });

    results['Products Catalog'] = testProductId && dupSkuRes.status === 409 ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Products Catalog'] = 'FAIL';
  }

  // 6. Inventory Status & Movement Log Test
  try {
    const invRes = await fetch(`${BASE_URL}/api/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(r => r.json());

    const movRes = await fetch(`${BASE_URL}/api/inventory/movements`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(r => r.json());

    results['Inventory Status'] = invRes.success && movRes.success ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Inventory Status'] = 'FAIL';
  }

  // 7. Sales Challan Draft Creation Test
  let testChallanId = '';
  try {
    const draftRes = await fetch(`${BASE_URL}/api/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({
        customerId: testCustomerId,
        items: [{ productId: testProductId, quantity: 5 }],
      }),
    }).then(r => r.json());

    testChallanId = draftRes.data?.challan?.id;

    // Verify stock was NOT reduced upon draft creation
    const prodCheck = await fetch(`${BASE_URL}/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(r => r.json());

    results['Sales Challan Draft'] = testChallanId && draftRes.data?.challan?.status === 'DRAFT' && prodCheck.data?.product?.currentStock === 50 ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Sales Challan Draft'] = 'FAIL';
  }

  // 8. Successful Challan Confirmation Test
  try {
    const confirmRes = await fetch(`${BASE_URL}/api/challans/${testChallanId}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
    }).then(r => r.json());

    // Verify stock deducted from 50 -> 45
    const prodAfter = await fetch(`${BASE_URL}/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(r => r.json());

    results['Challan Confirmation'] = confirmRes.success && confirmRes.data?.challan?.status === 'CONFIRMED' && prodAfter.data?.product?.currentStock === 45 ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Challan Confirmation'] = 'FAIL';
  }

  // 9. Insufficient Stock Rejection Test (HTTP 409)
  try {
    const excessiveDraft = await fetch(`${BASE_URL}/api/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({
        customerId: testCustomerId,
        items: [{ productId: testProductId, quantity: 9999 }],
      }),
    }).then(r => r.json());

    const failConfirmRes = await fetch(`${BASE_URL}/api/challans/${excessiveDraft.data.challan.id}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    results['Insufficient Stock Guard'] = failConfirmRes.status === 409 ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Insufficient Stock Guard'] = 'FAIL';
  }

  // 10. Atomic Stock Transaction Rollback Test
  try {
    // Create a product with low stock (2 units)
    const lowStockProd = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Atomic Test Item Low Stock',
        sku: `ATOMIC-LOW-${Date.now()}`,
        category: 'Test',
        unitPrice: 100,
        currentStock: 2,
        minimumStock: 1,
        warehouseLocation: 'A1',
      }),
    }).then(r => r.json());

    // Create multi-item challan: 1 unit of testProductId (available 45) + 5 units of lowStockProd (available 2 -> FAIL)
    const multiDraft = await fetch(`${BASE_URL}/api/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({
        customerId: testCustomerId,
        items: [
          { productId: testProductId, quantity: 1 },
          { productId: lowStockProd.data.product.id, quantity: 5 },
        ],
      }),
    }).then(r => r.json());

    // Attempt confirm
    const atomicRes = await fetch(`${BASE_URL}/api/challans/${multiDraft.data.challan.id}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    // Check that testProductId stock is STILL 45 (NOT reduced to 44!)
    const prod1Check = await fetch(`${BASE_URL}/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(r => r.json());

    results['Atomic Transaction Rollback'] = atomicRes.status === 409 && prod1Check.data?.product?.currentStock === 45 ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Atomic Transaction Rollback'] = 'FAIL';
  }

  // 11. Product Snapshot Test
  try {
    // Fetch original challan item snapshot
    const challanDetail = await fetch(`${BASE_URL}/api/challans/${testChallanId}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    }).then(r => r.json());

    const snapshotName = challanDetail.data?.challan?.items[0]?.productNameSnapshot;

    // Modify master product name
    await fetch(`${BASE_URL}/api/products/${testProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'MODIFIED MASTER NAME DOES NOT ALTER HISTORICAL SNAPSHOT',
        sku: uniqueSku,
        category: 'Machinery',
        unitPrice: 99999,
        minimumStock: 10,
        warehouseLocation: 'Bay 4',
      }),
    });

    // Re-fetch old challan detail and verify snapshot remains unchanged
    const reFetchChallan = await fetch(`${BASE_URL}/api/challans/${testChallanId}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    }).then(r => r.json());

    results['Product Snapshot Integrity'] = reFetchChallan.data?.challan?.items[0]?.productNameSnapshot === snapshotName ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Product Snapshot Integrity'] = 'FAIL';
  }

  // 12. Invalid Status Transitions Test
  try {
    // Attempt to confirm an already CONFIRMED challan
    const invalidTransRes = await fetch(`${BASE_URL}/api/challans/${testChallanId}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    results['Status Transition Validation'] = invalidTransRes.status === 400 ? 'PASS' : 'FAIL';
  } catch (err) {
    results['Status Transition Validation'] = 'FAIL';
  }

  // Print Complete Results Summary
  console.log('--- PHASE 8 E2E TEST SUMMARY RESULTS ---');
  let passCount = 0;
  let totalCount = Object.keys(results).length;

  for (const [testName, status] of Object.entries(results)) {
    console.log(`${testName.padEnd(32)}: [ ${status} ]`);
    if (status === 'PASS') passCount++;
  }

  console.log(`\nOVERALL SUITE RESULT: ${passCount}/${totalCount} PASSED`);
  console.log('====================================================\n');
}

runPhase8Suite().catch(console.error);
