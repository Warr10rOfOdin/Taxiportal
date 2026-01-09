const fetch = require('node-fetch');

// Import the getValidToken function from auth module
const { getValidToken } = require('./auth');

async function fetchTrips(token) {
  const { TAXI4U_CENTRAL_CODE } = process.env;
  const centralCode = TAXI4U_CENTRAL_CODE || 'VS';

  const now = new Date();
  const minPickupTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
  const maxPickupTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

  // Use correct schema from Swagger documentation
  // Mode 0 = Pending trips, Mode 1 = Finished trips, Mode 2 = Search
  const requestBody = {
    centralCode: centralCode,
    mode: 0, // Mode 0 for pending/active trips
    objValues: {}  // Mode 0 might not need time filters
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
  console.log(`Fetched ${Array.isArray(data) ? data.length : 0} trips from API`);

  // Log first trip for debugging
  if (Array.isArray(data) && data.length > 0) {
    console.log('Sample trip data:', JSON.stringify(data[0], null, 2));
  }

  // Transform API response to match frontend expectations
  const trips = Array.isArray(data) ? data : [];
  const transformedTrips = trips.map(trip => {
    // Get first passenger for address info (most trips have one passenger)
    const firstPassenger = trip.passengers && trip.passengers[0];

    // Build pickup address from available fields
    let pickupAddress = '';
    if (firstPassenger) {
      const parts = [
        firstPassenger.fromStreet,
        firstPassenger.fromPostalCode,
        firstPassenger.fromCity
      ].filter(Boolean);
      pickupAddress = parts.join(', ');
    }

    // Build dropoff address from available fields
    let dropoffAddress = '';
    if (firstPassenger) {
      const parts = [
        firstPassenger.toStreet,
        firstPassenger.toPostalCode,
        firstPassenger.toCity
      ].filter(Boolean);
      dropoffAddress = parts.join(', ');
    }

    return {
      ...trip,
      // Add computed fields for frontend
      pickupAddress: pickupAddress || 'Ikke angitt',
      dropoffAddress: dropoffAddress || 'Ikke angitt',
      comment: trip.messageToCar || '',
      // Transform passenger fields to match frontend
      passengers: (trip.passengers || []).map(p => ({
        ...p,
        name: p.clientName || p.taxiAccountNo || 'Ukjent',
        phoneNo: p.tel
      }))
    };
  });

  console.log('Sample transformed trip:', JSON.stringify(transformedTrips[0], null, 2));

  return {
    items: transformedTrips
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
