const fetch = require('node-fetch');

// In-memory token cache
let tokenCache = {
  token: null,
  expiresAt: null
};

async function fetchToken() {
  const { TAXI4U_USERNAME, TAXI4U_PASSWORD } = process.env;

  if (!TAXI4U_USERNAME || !TAXI4U_PASSWORD) {
    throw new Error('Missing required environment variables: TAXI4U_USERNAME, TAXI4U_PASSWORD');
  }

  console.log('Fetching new token from API');

  const response = await fetch('https://api.taxi4u.cab/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: TAXI4U_USERNAME,
      password: TAXI4U_PASSWORD
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Authentication failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data || !data.accessToken) {
    throw new Error('No access token received from authentication API');
  }

  // Cache token for 50 minutes (tokens typically expire after 60 minutes)
  const expiresAt = Date.now() + (50 * 60 * 1000);
  tokenCache = {
    token: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: expiresAt
  };

  console.log(`Token cached, expires at: ${new Date(expiresAt).toISOString()}`);

  return tokenCache;
}

function isTokenValid() {
  if (!tokenCache.token || !tokenCache.expiresAt) {
    return false;
  }

  // Check if token expires in less than 5 minutes
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return (tokenCache.expiresAt - now) > fiveMinutes;
}

async function getValidToken() {
  if (isTokenValid()) {
    console.log('Using cached token');
    return tokenCache;
  }

  return await fetchToken();
}

// Export the token management functions for use in other API routes
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const tokenData = await getValidToken();

    res.status(200).json({
      token: tokenData.token,
      expiresAt: tokenData.expiresAt
    });
  } catch (error) {
    console.error('Auth error:', error.message);

    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

// Export the getValidToken function for use by other API routes
module.exports.getValidToken = getValidToken;
