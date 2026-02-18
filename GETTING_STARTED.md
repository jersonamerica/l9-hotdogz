# Getting Started Checklist

## Before Running: Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm or yarn available
- [ ] MongoDB Atlas account (free tier OK)
- [ ] Google Cloud account for OAuth

## Configuration Steps

### 1. MongoDB Setup (5 mins)

- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a cluster (free tier)
- [ ] Create a database user with username & password
- [ ] Allow your IP in Network Access
- [ ] Copy your connection string

### 2. Google OAuth Setup (5 mins)

- [ ] Go to https://console.cloud.google.com/
- [ ] Create a new project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Add authorized URIs:
  - [ ] `http://localhost:3000` (JavaScript origin)
  - [ ] `http://localhost:3000/api/auth/callback/google` (redirect URI)
- [ ] Copy Client ID and Client Secret

### 3. Environment Setup (2 mins)

- [ ] Open `.env.local` in the project root
- [ ] Update `MONGODB_URI` with your connection string
- [ ] Update `GOOGLE_CLIENT_ID` with your Client ID
- [ ] Update `GOOGLE_CLIENT_SECRET` with your Client Secret

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/equipment-manager?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=7e489acb9507ee32d95249e09a21fb5a6d77c3d945d2fd43d6370c1192a1aa83
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Running the Application

- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Open browser to http://localhost:3000
- [ ] Should redirect to /login
- [ ] Click "Sign in with Google"
- [ ] Complete authentication
- [ ] Should see landing page with your info

## Testing Features

- [ ] Google login works
- [ ] User info displays correctly
- [ ] Can navigate to /dashboard
- [ ] Can navigate to /profile
- [ ] Sign Out button works
- [ ] After logout, redirected to /login
- [ ] Can login again

## Build Verification

- [ ] Run `npm run build`
- [ ] Should see "✓ Compiled successfully"
- [ ] No errors in the output

## Documentation

- [ ] Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for overview
- [ ] Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
- [ ] Read [README.md](./README.md) for complete documentation

## Common Issues

### Can't connect to MongoDB

- [ ] Check connection string in .env.local
- [ ] Verify IP is whitelisted in MongoDB Atlas
- [ ] Verify username and password are correct

### Google signin doesn't work

- [ ] Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
- [ ] Check Google OAuth redirect URI includes full path
- [ ] Check Google+ API is enabled
- [ ] Try incognito window (clear cookies)

### Build fails

- [ ] Delete .next folder: `rm -rf .next`
- [ ] Run build again: `npm run build`
- [ ] Check for typos in .env.local

## Next Steps

Once everything is working:

1. [ ] Consider deploying to Vercel
2. [ ] Start building equipment features
3. [ ] Add equipment database schema
4. [ ] Create equipment management pages
5. [ ] Add equipment filtering/search

---

**Total Setup Time: ~15 minutes**

Need help? See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions with screenshots-style steps.
