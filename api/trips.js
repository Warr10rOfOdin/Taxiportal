const fetch = require('node-fetch');

// Import the getValidToken function from auth module
const { getValidToken } = require('./auth');

async function fetchTrips(token) {
  const { TAXI4U_CENTRAL_CODE } = process.env;
  const centralCode = TAXI4U_CENTRAL_CODE || 'VS';

  // Try the triplists endpoint with minimal parameters
  // The exact schema is not documented, so we'll try different formats
  const requestBody = {
    CentralCode: centralCode,
    ListType: 0 // 0 = Pending/Active trips
  };

  console.log('Fetching trips with body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('https://api.taxi4u.cab/api/triplists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`Failed to fetch trips: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log(`Fetched trips from API, response type: ${Array.isArray(data) ? 'array' : 'object'}`);

  // Normalize response to match expected format
  return {
    items: Array.isArray(data) ? data : (data.items || data.trips || data.list || [])
  };
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get valid token (will use cached token if still valid)
    const tokenData = await getValidToken();

    // Fetch trips using the token
    const tripsData = await fetchTrips(tokenData.token);

    res.status(200).json(tripsData);
  } catch (error) {
    console.error('Trips error:', error.message);
    console.error('Full error:', error);

    res.status(500).json({
      error: 'Failed to fetch trips',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      items: []
    });
  }
};
