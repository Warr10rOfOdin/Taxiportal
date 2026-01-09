const fetch = require('node-fetch');

// Import the auth handler to get valid token
const getAuth = require('./auth');

async function getValidToken() {
  // Simulate a request to auth endpoint
  return new Promise((resolve, reject) => {
    const mockReq = { method: 'GET' };
    const mockRes = {
      setHeader: () => {},
      status: (code) => ({
        json: (data) => {
          if (code === 200) {
            resolve(data.token);
          } else {
            reject(new Error(data.message));
          }
        },
        end: () => {}
      })
    };

    getAuth(mockReq, mockRes);
  });
}

async function fetchTrips(token) {
  const { TAXI4U_CENTRAL_CODE } = process.env;

  const now = new Date();
  const minPickupTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
  const maxPickupTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

  const requestBody = {
    minPickupTime: minPickupTime.toISOString(),
    maxPickupTime: maxPickupTime.toISOString(),
    centralcode: TAXI4U_CENTRAL_CODE || 'VS',
    tripstatuses: [
      "UnderSending",
      "Sent",
      "OnRoute",
      "Arrived",
      "POB",
      "WaitingToPOB"
    ]
  };

  console.log('Fetching trips with body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('https://api.taxi4u.cab/api/Trips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch trips: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log(`Fetched ${data.items?.length || 0} trips`);

  return data;
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
    const token = await getValidToken();

    // Fetch trips using the token
    const tripsData = await fetchTrips(token);

    res.status(200).json(tripsData);
  } catch (error) {
    console.error('Trips error:', error.message);

    res.status(500).json({
      error: 'Failed to fetch trips',
      message: error.message,
      items: []
    });
  }
};
