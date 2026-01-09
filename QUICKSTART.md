# Quick Start - Deploy in 5 Minutes ⚡

## Prerequisites
- GitHub account
- Vercel account (free)
- Taxi4U username & password

## Step-by-Step Deployment

### 1. Upload to GitHub (2 minutes)

```bash
# Create new repo on github.com, then:
git init
git add .
git commit -m "Initial commit: Voss Taxi Display"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taxi-display.git
git push -u origin main
```

### 2. Deploy to Vercel (3 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `taxi-display` repository
4. **Add Environment Variables:**
   ```
   TAXI4U_USERNAME = your_username
   TAXI4U_PASSWORD = your_password
   TAXI4U_CENTRAL_CODE = VS
   ```
5. Click **"Deploy"**

### 3. Done! 🎉

Your display is now live at: `https://your-project.vercel.app`

## Common Issues

**No bookings showing?**
- Check that environment variables are set correctly in Vercel
- Go to: Project Settings → Environment Variables
- Make sure all 3 variables are there

**Need to update credentials?**
1. Go to Vercel project → Settings → Environment Variables
2. Edit the variable
3. Go to Deployments → Latest deployment → Redeploy

## Display on Office Screen

1. Open the Vercel URL in Chrome
2. Press F11 for fullscreen
3. The display auto-updates every 30 seconds

## Need Help?

See the full README.md for detailed troubleshooting.
