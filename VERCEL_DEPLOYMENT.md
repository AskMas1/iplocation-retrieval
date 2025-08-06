# Vercel Deployment Guide

This guide explains how to deploy the geolocation app to Vercel with the proxy functionality working correctly.

## Files Added for Vercel Support

### 1. `api/ip-location.js`
Serverless function that acts as a proxy to the IP-API service, resolving mixed content errors in production. The function extracts the user's real IP address from request headers and queries the IP-API service for that specific IP, ensuring you get the user's location data instead of the server's location.

### 2. `vercel.json`
Configuration file that:
- Sets up proper routing for the API endpoint
- Configures CORS headers
- Sets function timeout limits

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project root:
```bash
cd geolocation
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (for first deployment)
   - What's your project's name? **geolocation** (or your preferred name)
   - In which directory is your code located? **./**

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

## Verification

After deployment, verify the proxy is working:

1. Visit your deployed app URL
2. Navigate to the "IP Location" page
3. Check the browser's Network tab - you should see requests to `/api/ip-location`
4. Verify no mixed content errors in the console
5. Confirm real IP location data is displayed

## Troubleshooting

### 404 Error on `/api/ip-location`
- Ensure `api/ip-location.js` is in the correct directory
- Check that `vercel.json` is in the project root
- Redeploy the project

### CORS Errors
- Verify the CORS headers in `api/ip-location.js`
- Check the headers configuration in `vercel.json`

### Function Timeout
- The function timeout is set to 10 seconds in `vercel.json`
- If needed, increase the `maxDuration` value

## Environment Variables (Optional)

If you need to configure any environment variables:

1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add any required variables

## Custom Domain (Optional)

To use a custom domain:

1. Go to your project dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow the DNS configuration instructions

## Monitoring

Monitor your deployment:
- **Functions**: Check function logs in the Vercel dashboard
- **Analytics**: View usage statistics
- **Performance**: Monitor Core Web Vitals

## Local Development vs Production

- **Development**: Uses Vite proxy configuration
- **Production**: Uses Vercel serverless function
- Both configurations route `/api/ip-location` to the IP-API service
- The frontend code remains unchanged between environments
