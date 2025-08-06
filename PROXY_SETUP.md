# Proxy Setup for IP-API Mixed Content Resolution

This document explains the proxy setup implemented to resolve mixed content errors when accessing the IP-API service.

## Problem
The IP-API service (`http://ip-api.com/json`) uses HTTP protocol, which causes mixed content errors when the application is served over HTTPS. Modern browsers block HTTP requests from HTTPS pages for security reasons.

## Solution
We've implemented a reverse proxy method that routes requests through the application server, avoiding direct HTTP calls from the browser.

## Development Setup (Vite)
The development server is configured with a proxy in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api/ip-location': {
      target: 'http://ip-api.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/ip-location/, '/json'),
      secure: false
    }
  }
}
```

This configuration:
- Intercepts requests to `/api/ip-location`
- Forwards them to `http://ip-api.com/json`
- Changes the origin to avoid CORS issues
- Allows insecure HTTP connections

## Production Deployment

### Option 1: Nginx Reverse Proxy
Add this configuration to your Nginx server block:

```nginx
location /api/ip-location {
    proxy_pass http://ip-api.com/json;
    proxy_set_header Host ip-api.com;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_verify off;
}
```

### Option 2: Apache Reverse Proxy
Enable mod_proxy and add to your virtual host:

```apache
ProxyPreserveHost On
ProxyPass /api/ip-location http://ip-api.com/json
ProxyPassReverse /api/ip-location http://ip-api.com/json
```

### Option 3: Node.js/Express Proxy
If using a Node.js backend, install `http-proxy-middleware`:

```bash
npm install http-proxy-middleware
```

Then add to your Express server:

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/api/ip-location', createProxyMiddleware({
  target: 'http://ip-api.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ip-location': '/json'
  }
}));
```

### Option 4: Vercel Serverless Functions (Recommended)
For Vercel deployments, the project includes a serverless function at `api/ip-location.js` that handles the proxy automatically. The `vercel.json` configuration file ensures proper routing and CORS headers.

**Files included:**
- `api/ip-location.js` - Serverless function that proxies requests to IP-API
- `vercel.json` - Vercel configuration for routing and headers

**No additional setup required** - just deploy to Vercel and the proxy will work automatically.

### Option 5: Cloudflare Workers
Create a Cloudflare Worker with this code:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname === '/api/ip-location') {
    const response = await fetch('http://ip-api.com/json', {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  
  return fetch(request)
}
```

## Testing
To test the proxy setup:

1. Start the development server: `npm run dev`
2. Navigate to the IP Location page
3. Check the browser's Network tab to verify requests go to `/api/ip-location`
4. Verify no mixed content errors in the console

## Alternative Solutions
If proxy setup is not feasible, consider these alternatives:

1. **HTTPS IP-API Service**: Use a paid service that supports HTTPS
2. **Backend API**: Create your own backend endpoint that fetches IP data
3. **CORS Proxy Services**: Use public CORS proxy services (not recommended for production)

## Important: User IP Address Forwarding

### The Problem
When using a proxy server, the IP-API service sees the request coming from your server's IP address instead of the user's actual IP address. This results in showing the server's location (e.g., AWS data center) rather than the user's location.

### The Solution
The Vercel serverless function (`api/ip-location.js`) has been enhanced to:

1. **Extract the user's real IP** from request headers:
   - `x-forwarded-for` (most common)
   - `x-real-ip` (alternative header)
   - Connection remote address (fallback)

2. **Query IP-API for the specific user IP**:
   - Instead of calling `http://ip-api.com/json`
   - It calls `http://ip-api.com/json/{userIP}`

3. **Handle edge cases**:
   - Multiple IPs in forwarded headers (takes the first one)
   - IPv6 addresses and port numbers
   - Local development IPs (127.0.0.1, ::1)

### For Other Proxy Solutions
If you're using Nginx, Apache, or other proxy solutions, ensure they forward the user's IP:

**Nginx:**
```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

**Apache:**
```apache
ProxyPreserveHost On
ProxyPass /api/ip-location http://ip-api.com/json
ProxyPassReverse /api/ip-location http://ip-api.com/json
```

Then modify your backend to extract and use the forwarded IP address.

## Security Considerations
- The proxy forwards all requests to ip-api.com, ensure this aligns with your security policies
- Consider rate limiting to prevent abuse
- Monitor proxy usage and implement logging if needed
- The enhanced solution now correctly forwards the user's IP address to get accurate location data
