# Start backend with test endpoints enabled
$env:ALLOW_TEST_ENDPOINTS_TOKEN='devtoken'
$env:NODE_ENV='test'
Set-Location "C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend"
# Redirect logs so background process output is available for debugging
node dist/src/main.js > backend.log 2>&1
