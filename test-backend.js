// Test script to check backend connectivity
const testBackend = async (url) => {
  try {
    console.log(`Testing backend at: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('✅ Backend is working!');
    console.log('Response:', data);
    return true;
  } catch (error) {
    console.log('❌ Backend connection failed');
    console.log('Error:', error.message);
    return false;
  }
};

// Test different possible URLs
const testUrls = [
  'https://safespace-backend-production.up.railway.app/health',
  'https://safespace-backend-production.up.railway.app/api/health',
  'https://safespace-backend-production.up.railway.app/',
  'https://safespace-backend-production.up.railway.app/api/'
];

console.log('Testing backend connectivity...\n');

testUrls.forEach(async (url) => {
  await testBackend(url);
  console.log('---');
}); 