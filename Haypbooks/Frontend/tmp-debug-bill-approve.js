const axios = require('axios');

;(async () => {
  try {
    const backend = 'http://127.0.0.1:4000';
    const email = `debug-${Date.now()}@haypbooks.test`;
    const password = 'Password1!';
    console.log('email', email);

    let res = await axios.post(`${backend}/api/test/create-user`, {
      email,
      password,
      name: 'Debug',
      isEmailVerified: true,
    }, { validateStatus: () => true });
    console.log('create-user', res.status, res.data);

    res = await axios.post(`${backend}/api/test/create-company`, {
      email,
      name: `Debug ${Date.now()}`,
    }, { validateStatus: () => true });
    console.log('create-company', res.status, res.data);
    const companyId = res.data?.company?.id || res.data?.id;

    res = await axios.post(`${backend}/api/auth/login`, {
      email,
      password,
    }, { validateStatus: () => true });
    console.log('login', res.status, res.data);
    const token = res.data?.token;
    const headers = { Authorization: `Bearer ${token}` };

    res = await axios.post(`${backend}/api/test/force-complete-onboarding`, {
      email,
      mode: 'quick',
    }, { headers, validateStatus: () => true });
    console.log('force-complete', res.status, res.data);

    res = await axios.post(`${backend}/api/companies/${companyId}/accounting/accounts/seed-default`, {}, { headers, validateStatus: () => true });
    console.log('seed-default', res.status, res.data);

    res = await axios.post(`${backend}/api/companies/${companyId}/ap/vendors`, {
      name: 'Debug Vendor',
      displayName: 'Debug Vendor',
      status: 'ACTIVE',
    }, { headers, validateStatus: () => true });
    console.log('create-vendor', res.status, res.data);
    const vendorId = res.data?.id;

    const dueAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
    const billPayload = {
      vendorId,
      dueAt,
      description: '',
      currency: 'USD',
      paymentTermId: 'Net 30',
      lines: [{ description: 'Debug', amount: 50, accountId: null, quantity: 1, rate: 50, taxRate: 0 }],
    };
    res = await axios.post(`${backend}/api/companies/${companyId}/ap/bills`, billPayload, { headers, validateStatus: () => true });
    console.log('create-bill', res.status, res.data);
    const billId = res.data?.id;

    res = await axios.post(`${backend}/api/companies/${companyId}/ap/bills/${billId}/approve`, {}, { headers, validateStatus: () => true });
    console.log('approve-bill', res.status, res.data);
  } catch (err) {
    console.error('ERROR', err?.response?.status, err?.response?.data, err?.message);
  }
})();
