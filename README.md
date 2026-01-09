# Voss Taxi - Real-time Booking Display 🚖

A professional, real-time taxi booking display system with automatic token refresh, deployed on Vercel with GitHub integration.

## Features ✨

- 🔄 **Automatic Token Refresh** - No more manual token updates!
- 📊 **Real-time Updates** - Fetches bookings every 30 seconds
- 🔔 **Smart Notifications** - Audio alerts for UTROP and "Under sending" status
- 🎨 **Visual Indicators** - Color-coded urgency (red pulse, yellow glow)
- 🌙 **Dark Mode** - Optimized for office displays
- 🚀 **Serverless Deployment** - Hosted on Vercel for free

## Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔴 Red Pulsing | "Under sending" - Awaiting driver acceptance (chimes every 30 sec) |
| 🟡 Yellow Glow | 5 minutes or less until UTROP |
| ⚪ Normal | Standard booking |

## Architecture

```
taxi-display/
├── api/
│   ├── auth.js          # Token management & refresh
│   └── trips.js         # Fetch trips with auto-refreshed token
├── public/
│   └── index.html       # Frontend display
├── .env.example         # Environment variables template
├── package.json         # Dependencies
├── vercel.json          # Vercel configuration
└── README.md           # This file
```

## Prerequisites 📋

- GitHub account
- Vercel account (free tier is sufficient)
- Taxi4U API credentials (username & password)

## Deployment Guide 🚀

### Step 1: Fork/Clone to GitHub

1. Create a new repository on GitHub
2. Clone this project:
   ```bash
   git clone <your-repo-url>
   cd taxi-display
   ```

3. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **Configure Environment Variables** (CRITICAL):
   - Click **"Environment Variables"**
   - Add the following variables:
     ```
     TAXI4U_USERNAME = your_username
     TAXI4U_PASSWORD = your_password
     TAXI4U_CENTRAL_CODE = VS
     ```
   - Make sure to add them for **Production**, **Preview**, and **Development**
5. Click **"Deploy"**
6. Wait for deployment to complete (1-2 minutes)
7. Your app will be live at: `https://your-project.vercel.app`

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables:
   ```bash
   vercel env add TAXI4U_USERNAME
   vercel env add TAXI4U_PASSWORD
   vercel env add TAXI4U_CENTRAL_CODE
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Step 3: Configure Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these three variables:

| Name | Value | Environment |
|------|-------|-------------|
| `TAXI4U_USERNAME` | Your Taxi4U username | Production, Preview, Development |
| `TAXI4U_PASSWORD` | Your Taxi4U password | Production, Preview, Development |
| `TAXI4U_CENTRAL_CODE` | `VS` (or your code) | Production, Preview, Development |

4. **Important:** After adding variables, trigger a new deployment:
   - Go to **Deployments** tab
   - Click the **︙** menu on the latest deployment
   - Click **"Redeploy"**

### Step 4: Test the Deployment

1. Open your Vercel URL: `https://your-project.vercel.app`
2. You should see the taxi booking display
3. Open browser console (F12) to check for any errors
4. Verify that bookings are loading

## How It Works 🔧

### Automatic Token Management

The application automatically handles token refresh:

1. **Initial Request**: When `/api/trips` is called, it checks if a valid token exists
2. **Token Expired**: If token is expired or missing, it calls `/api/auth` to get a new one
3. **Token Caching**: The token is cached in memory with its expiration time
4. **Automatic Renewal**: Before token expires, a new one is fetched automatically

```mermaid
graph LR
    A[Frontend] --> B[/api/trips]
    B --> C{Token Valid?}
    C -->|No| D[/api/auth]
    D --> E[Taxi4U Auth API]
    E --> F[New Token]
    F --> B
    C -->|Yes| G[Taxi4U Trips API]
    G --> H[Return Trips]
    H --> A
```

### API Endpoints

#### `GET/POST /api/auth`
Returns a valid bearer token, automatically refreshing if needed.

**Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1736604033000
}
```

#### `POST /api/trips`
Fetches current and upcoming taxi bookings.

**Response:**
```json
{
  "items": [
    {
      "internalNo": 123,
      "licenseNo": "T 17",
      "tripStatus": "UnderSending",
      "passengers": [...],
      ...
    }
  ]
}
```

## Local Development 💻

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` with your credentials:
   ```
   TAXI4U_USERNAME=your_username
   TAXI4U_PASSWORD=your_password
   TAXI4U_CENTRAL_CODE=VS
   ```

5. Start development server:
   ```bash
   vercel dev
   ```

6. Open http://localhost:3000

## Customization 🎨

### Change Notification Timing

Edit `public/index.html`, find the notification check:

```javascript
// Change from 30 seconds to 60 seconds
if (!lastChimeTime || (now - lastChimeTime) >= 60000) {
```

### Change Update Interval

Edit `public/index.html`, find the fetch interval:

```javascript
// Change from 30 seconds to 60 seconds
const interval = setInterval(fetchBookings, 60000);
```

### Change Time Range

Edit `api/trips.js`, modify the time range:

```javascript
// Change from 24 hours to 12 hours
maxPickupTime: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()
```

### Add More Status Mappings

Edit `public/index.html`, find `mapTripStatus`:

```javascript
const statusMap = {
    'UnderSending': 'Under sending',
    'Sendt': 'KLAR FOR FASTURERING',
    'YourNewStatus': 'YOUR DISPLAY NAME',
    // Add more here
};
```

## Troubleshooting 🔍

### No bookings showing

**Check 1: Environment Variables**
```bash
vercel env ls
```
Verify that all three variables are set.

**Check 2: API Credentials**
Test login manually:
```bash
curl -X POST https://api.taxi4u.cab/api/Auth \
  -H "Content-Type: application/json" \
  -d '{"user":"your_username","password":"your_password"}'
```

**Check 3: Browser Console**
- Open browser developer tools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### "Authentication failed" error

- Verify username and password are correct
- Check that you're using the correct central code
- Ensure environment variables are set in Vercel

### CORS errors

- Make sure you're accessing the site via the Vercel URL
- Don't open `index.html` directly in browser
- Vercel API routes handle CORS automatically

### Token keeps expiring

This shouldn't happen with automatic refresh, but if it does:
- Check server logs in Vercel dashboard
- Verify the auth endpoint is working
- Check that environment variables are accessible

## Monitoring & Logs 📊

### View Logs in Vercel

1. Go to Vercel dashboard
2. Select your project
3. Click on a deployment
4. View **Function Logs** to see:
   - Token refresh events
   - API call success/failures
   - Error messages

### Enable Debug Logging

The API functions log key events:
- `"Using cached token"` - Token still valid
- `"Fetching new token from API"` - Getting new token
- `"Token cached, expires at: ..."` - New token stored

## Production Best Practices ✅

1. **Use Environment Variables** - Never commit credentials to GitHub
2. **Monitor Logs** - Check Vercel logs regularly for errors
3. **Test After Updates** - Always test after changing environment variables
4. **Use Custom Domain** - Add a custom domain in Vercel settings for cleaner URLs
5. **Enable Auto-Deploy** - Vercel automatically deploys on git push
6. **Backup Configuration** - Keep a backup of your environment variables

## Updating the Application 🔄

When you need to update the application:

1. Make changes to your local files
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. Vercel automatically deploys the new version
4. Check the deployment status in Vercel dashboard

## Security Notes 🔒

- **Never commit `.env` files** - They're in `.gitignore` for a reason
- **Keep credentials secure** - Only store them in Vercel environment variables
- **Token expiration** - Tokens automatically refresh, reducing security risk
- **HTTPS only** - Vercel serves all traffic over HTTPS
- **No client-side credentials** - All API calls go through Vercel serverless functions

## Support & Contact 📞

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Test API endpoints manually using curl
4. Contact your system administrator

## License 📄

MIT License - feel free to modify and use as needed.

---

**Deployment Checklist:**
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked
- [ ] Environment variables added in Vercel
- [ ] First deployment successful
- [ ] Application accessible at Vercel URL
- [ ] Bookings loading correctly
- [ ] Notifications working
- [ ] Tested on big screen display

**Built with ❤️ for Voss Taxi**
