import json
import urllib.request
import urllib.parse
import http.cookiejar
import time

backend = 'http://127.0.0.1:4000'
email = f'ap-bill-debug-{int(time.time()*1000)}@haypbooks.test'
password = 'Password1!'
company_name = f'AP Bill Debug Company {int(time.time()*1000)}'

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

def call(method, path, data=None, headers=None):
    url = backend + path
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    try:
        with opener.open(req) as r:
            text = r.read().decode('utf-8')
            return r.status, json.loads(text), dict(r.getheaders())
    except urllib.error.HTTPError as err:
        text = err.read().decode('utf-8')
        try:
            return err.code, json.loads(text), dict(err.headers)
        except Exception:
            return err.code, text, dict(err.headers)

status, body, headers = call('POST', '/api/test/create-user', {'email': email, 'password': password, 'name': 'AP Bill Debug', 'isEmailVerified': True})
print('create-user', status, body)
status, body, headers = call('POST', '/api/test/create-company', {'email': email, 'name': company_name})
print('create-company', status, body)
company_id = body.get('company', {}).get('id') or body.get('id')
print('company_id', company_id)
status, body, headers = call('POST', '/api/auth/login', {'email': email, 'password': password})
print('login', status, body)
token = body.get('token')
if token:
    status, body, headers = call('POST', '/api/test/force-complete-onboarding', {'email': email, 'mode': 'quick'}, {'Authorization': f'Bearer {token}'})
    print('force-complete-onboarding', status, body)
    status, body, headers = call('POST', f'/api/companies/{company_id}/accounting/accounts/seed-default', headers={'Authorization': f'Bearer {token}'})
    print('seed-default', status, body)
status, body, headers = call('POST', f'/api/companies/{company_id}/ap/vendors', {'name': 'Test Vendor', 'displayName': 'Test Vendor', 'email': 'vendor@example.com', 'phone': '(555) 123-4567'})
print('create-vendor', status, body)
vendor_id = body.get('id')
status, body, headers = call('GET', f'/api/companies/{company_id}/ap/vendors', headers={'Authorization': f'Bearer {token}'})
print('list-vendors', status, body)
status, body, headers = call('GET', f'/api/companies/{company_id}/accounting/accounts', headers={'Authorization': f'Bearer {token}'})
print('list-accounts status', status)
if isinstance(body, list):
    print('account count', len(body))
else:
    print('accounts body', body)

accounts = []
if isinstance(body, list):
    accounts = body
elif isinstance(body, dict):
    if 'accounts' in body and isinstance(body['accounts'], list):
        accounts = body['accounts']
    elif 'data' in body and isinstance(body['data'], list):
        accounts = body['data']

for idx, account in enumerate(accounts[:5]):
    print(idx, account.get('id'), account.get('code'), account.get('name'), account.get('isHeader'))

if accounts:
    account_id = accounts[0].get('id')
    bill_body = {
        'vendorId': vendor_id,
        'dueAt': '2026-05-26',
        'description': '',
        'currency': 'USD',
        'paymentTermId': 'Net 30',
        'lines': [
            {'description': 'E2E bill line item', 'accountId': account_id, 'quantity': 2, 'rate': 25, 'amount': 50}
        ]
    }
    status, body, headers = call('POST', f'/api/companies/{company_id}/ap/bills', bill_body)
    print('create-bill first-account', status, body)
    # try with a known expense account if available
    expense_account = next((a for a in accounts if str(a.get('typeName', '')).upper() in ('EXPENSE', 'EXPENSES') or str(a.get('name', '')).lower().startswith('rent')), None)
    if expense_account and expense_account.get('id') != account_id:
        status, body, headers = call('POST', f'/api/companies/{company_id}/ap/bills', {**bill_body, 'lines': [{'description': 'E2E bill line item', 'accountId': expense_account.get('id'), 'quantity': 2, 'rate': 25, 'amount': 50}]})
        print('create-bill expense-account', status, body)
    status, body, headers = call('POST', f'/api/companies/{company_id}/ap/bills', {**bill_body, 'lines': [{'description': 'E2E bill line item', 'quantity': 2, 'rate': 25, 'amount': 50}]})
    print('create-bill no-account', status, body)
