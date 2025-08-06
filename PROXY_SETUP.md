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

### Option 4: Cloudflare Workers
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

## Security Considerations
- The proxy forwards all requests to ip-api.com, ensure this aligns with your security policies
- Consider rate limiting to prevent abuse
- Monitor proxy usage and implement logging if needed
- Be aware that the IP address seen by ip-api.com will be your server's IP, not the client's IP
