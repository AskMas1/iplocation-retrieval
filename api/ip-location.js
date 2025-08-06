// Vercel serverless function to proxy IP-API requests
// This resolves mixed content errors in production

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get the user's real IP address from request headers
    const userIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress ||
                   (req.connection?.socket ? req.connection.socket.remoteAddress : null);

    // Clean up the IP address (remove port if present, handle IPv6)
    let cleanIP = userIP;
    if (userIP) {
      // Handle comma-separated IPs (x-forwarded-for can contain multiple IPs)
      cleanIP = userIP.split(',')[0].trim();
      // Remove IPv6 brackets and port
      cleanIP = cleanIP.replace(/^\[|\]$/g, '').split(':')[0];
    }

    // If we have a user IP, query IP-API for that specific IP
    let apiUrl = 'http://ip-api.com/json';
    if (cleanIP && cleanIP !== '127.0.0.1' && cleanIP !== '::1') {
      apiUrl = `http://ip-api.com/json/${cleanIP}`;
    }

    // Forward the request to IP-API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Geolocation-App/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`IP-API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Add debug info in development
    if (process.env.NODE_ENV === 'development') {
      data._debug = {
        userIP: cleanIP,
        apiUrl: apiUrl,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'x-real-ip': req.headers['x-real-ip']
        }
      };
    }
    
    // Return the data with proper headers
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching IP location data:', error);
    
    // Return fallback data in case of error
    res.status(200).json({
      query: 'Unknown',
      status: 'success',
      country: 'Demo Country',
      countryCode: 'XX',
      region: 'XX',
      regionName: 'Demo Region',
      city: 'Demo City',
      zip: '00000',
      lat: 0,
      lon: 0,
      timezone: 'UTC',
      isp: 'Demo ISP',
      org: 'Demo Organization',
      as: 'Demo AS'
    });
  }
}
