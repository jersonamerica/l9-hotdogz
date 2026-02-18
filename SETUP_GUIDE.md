# Quick Start Guide

Follow these steps to get your Equipment Manager application running locally.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up MongoDB Atlas (Database)

### Create MongoDB Account

1. Go to https://www.mongodb.com/cloud/atlas and create a free account
2. Create a new organization and project
3. Click "Build a Database" and select the free shared tier

### Create Database User

1. In the left sidebar, go to **Database Access**
2. Click **Add New Database User**
3. Choose "Password" as the authentication method
4. Enter a username (e.g., `equipmentmanager`)
5. Enter a strong password (save this!)
6. Set Database User Privileges to "Read and write to any database"
7. Click **Add User**

### Allow Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For development, click **Allow Access from Anywhere** (or enter your IP)
4. Confirm the changes

### Get Connection String

1. Go to **Database** section
2. Click the **Connect** button on your cluster
3. Select "Drivers" and "Node.js"
4. Copy the connection string
5. The string should look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 3: Set Up Google OAuth (Authentication)

### Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name (e.g., "Equipment Manager")
5. Click **CREATE**
6. Wait for the project to be created, then select it

### Enable Google+ API

1. In the search bar, type "Google+ API"
2. Click on it and click **ENABLE**
3. Wait for it to enable

### Create OAuth Credentials

1. Go to **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth client ID**
4. If prompted, configure OAuth consent screen first:
   - Choose **External** (or **Internal** if available for your domain)
   - Fill in the required fields:
     - App name: "Equipment Manager"
     - User support email: (your email)
     - Developer contact: (your email)
   - Click **SAVE AND CONTINUE**
   - Skip optional scopes and click **SAVE AND CONTINUE**
   - Review and go back to create credentials

5. For **Application type**, select **Web application**
6. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`

7. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`

8. Click **CREATE**
9. Copy the **Client ID** and **Client Secret** (save these!)

## Step 4: Configure Environment Variables

1. Create or open `.env.local` in the project root
2. Fill in the variables with your credentials:

```env
# MongoDB Connection String (from Step 2)
# Replace username and password with the ones you created
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/equipment-manager?retryWrites=true&w=majority

# NextAuth Settings (keep as is)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=7e489acb9507ee32d95249e09a21fb5a6d77c3d945d2fd43d6370c1192a1aa83

# Google OAuth Credentials (from Step 3)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Step 5: Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Step 6: Test the Application

1. Open http://localhost:3000 in your browser
2. You should be redirected to `/login`
3. Click "Sign in with Google"
4. Complete the Google authentication flow
5. You should be redirected to the landing page (/) with your user info displayed
6. Try navigating to `/dashboard` and `/profile`
7. Click "Sign Out" to test logout

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### "Cannot connect to MongoDB"

- Verify `MONGODB_URI` is correct in `.env.local`
- Check that your IP is added to Network Access in MongoDB Atlas
- Confirm the username and password are correct

### "Google sign-in not working"

- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env.local`
- Verify redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Ensure Google+ API is enabled in Google Cloud Console

### "Middleware not working"

- Make sure you're accessing protected routes like `/` or `/dashboard`
- Try in an incognito window to test without cached sessions

## What's Next?

The basic authentication is working! You can now:

- Add equipment tracking features to the dashboard
- Create forms for adding/editing equipment
- Add user profile settings
- Implement equipment search and filtering
- Add more fields to the User model

For detailed documentation, see [README.md](./README.md)
