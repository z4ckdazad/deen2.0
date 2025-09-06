// Simple API Test Script for DeenVerse
// Run this with: node test-api.js

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing DeenVerse API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.message);
    console.log('');

    // Test 2: User Registration
    console.log('2. Testing User Registration...');
    const registerData = {
      fullName: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'student',
      islamicProfile: 'student',
      bio: 'Testing the API'
    };

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    const registerResult = await registerResponse.json();
    
    if (registerResult.success) {
      console.log('✅ User Registration Successful');
      console.log('   User ID:', registerResult.data.user._id);
      console.log('   Token:', registerResult.data.token.substring(0, 20) + '...');
      
      const token = registerResult.data.token;

      // Test 3: Get User Profile
      console.log('\n3. Testing Get Profile...');
      const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const profileResult = await profileResponse.json();
      if (profileResult.success) {
        console.log('✅ Get Profile Successful');
        console.log('   User Name:', profileResult.data.fullName);
        console.log('   User Role:', profileResult.data.role);
      } else {
        console.log('❌ Get Profile Failed:', profileResult.message);
      }

      // Test 4: Create a Post
      console.log('\n4. Testing Create Post...');
      const postData = {
        content: 'This is a test post from the API test script. Alhamdulillah!',
        type: 'general',
        tags: ['test', 'api']
      };

      const postResponse = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      const postResult = await postResponse.json();
      if (postResult.success) {
        console.log('✅ Create Post Successful');
        console.log('   Post ID:', postResult.data._id);
        console.log('   Content:', postResult.data.content.substring(0, 50) + '...');
      } else {
        console.log('❌ Create Post Failed:', postResult.message);
      }

      // Test 5: Get Feed
      console.log('\n5. Testing Get Feed...');
      const feedResponse = await fetch(`${API_BASE_URL}/posts/feed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const feedResult = await feedResponse.json();
      if (feedResult.success) {
        console.log('✅ Get Feed Successful');
        console.log('   Posts Count:', feedResult.data.posts.length);
      } else {
        console.log('❌ Get Feed Failed:', feedResult.message);
      }

      // Test 6: Get Imaam List
      console.log('\n6. Testing Get Imaam List...');
      const imaamResponse = await fetch(`${API_BASE_URL}/imaam`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const imaamResult = await imaamResponse.json();
      if (imaamResult.success) {
        console.log('✅ Get Imaam List Successful');
        console.log('   Imaam Count:', imaamResult.data.imaam.length);
      } else {
        console.log('❌ Get Imaam List Failed:', imaamResult.message);
      }

    } else {
      console.log('❌ User Registration Failed:', registerResult.message);
    }

  } catch (error) {
    console.log('❌ API Test Failed:', error.message);
    console.log('   Make sure the backend server is running on port 5000');
  }

  console.log('\n🎉 API Testing Complete!');
}

// Run the test
testAPI();
