# Equipment Manager - Gmail Auth App

A modern Next.js application with Gmail authentication, MongoDB database integration, and TailwindCSS styling.

## Features

✅ **Gmail Authentication** - Secure login and registration using Google OAuth  
✅ **MongoDB Integration** - User data stored in MongoDB Atlas  
✅ **Type-Safe** - Built with TypeScript for better developer experience  
✅ **Modern UI** - Styled with TailwindCSS  
✅ **Protected Routes** - Middleware-based route protection  
✅ **Session Management** - NextAuth.js for secure session handling

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js with Google Provider
- **Styling**: TailwindCSS
- **ORM**: Mongoose

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier available)
- Google Cloud Console account for OAuth credentials

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster
4. Go to "Database Access" and create a database user with a strong password
5. Go to "Network Access" and add your IP address (or 0.0.0.0/0 for development)
6. Click "Connect" and copy the connection string
7. Replace `<username>` and `<password>` with your actual credentials

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the "Google+ API"
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Select "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret

### 4. Configure Environment Variables

Update `.env.local` with your credentials:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/equipment-manager?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=7e489acb9507ee32d95249e09a21fb5a6d77c3d945d2fd43d6370c1192a1aa83

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

Replace the placeholder values with your actual credentials.

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/     # NextAuth API route
│   ├── login/                       # Login page
│   ├── dashboard/                   # Dashboard page (protected)
│   ├── profile/                     # Profile page (protected)
│   ├── layout.tsx                   # Root layout with SessionProvider
│   ├── page.tsx                     # Landing page (protected)
│   └── providers.tsx                # NextAuth SessionProvider wrapper
├── components/
│   ├── LoginForm.tsx                # Login form component
│   └── LogoutButton.tsx             # Logout button component
├── lib/
│   ├── auth.ts                      # NextAuth configuration
│   └── db.ts                        # MongoDB connection utility
├── models/
│   └── User.ts                      # User database schema
└── types/
    └── next-auth.d.ts              # NextAuth type definitions

middleware.ts                        # Route protection middleware
```

## How It Works

### Authentication Flow

1. **User visits the app** → Redirected to `/login` if not authenticated
2. **Clicks "Sign in with Google"** → Google OAuth popup appears
3. **User grants permission** → Callback to `/api/auth/callback/google`
4. **User registered in MongoDB** (if new) with:
   - Email
   - Name (from Google profile)
   - Profile image
   - Google ID
5. **Redirected to landing page** with session established
6. **Can navigate to protected routes** (dashboard, profile)

### Protected Routes

Routes protected by middleware (in `middleware.ts`):

- `/` - Landing page
- `/dashboard` - Equipment management
- `/profile` - User profile

Login page (`/login`) is publicly accessible.

## Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Database Schema

### User Collection

```typescript
{
  _id: ObjectId
  email: string (unique, lowercase)
  name: string
  image: string (URL to profile picture)
  googleId: string (unique)
  createdAt: Date
  updatedAt: Date
}
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables:
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (your production domain)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
5. Deploy!

Update Google OAuth redirect URIs to include your production domain:

```
https://yourdomain.com/api/auth/callback/google
```

## Troubleshooting

### "MONGODB_URI is not defined"

- Make sure `.env.local` is in the root directory
- Verify all environment variables are set correctly

### "Error connecting to Google"

- Check Google OAuth credentials in `.env.local`
- Verify redirect URIs are correctly configured in Google Cloud Console

### "Invalid host header"

- If running on a different port, update `NEXTAUTH_URL` in `.env.local`

### Module not found errors

- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`

## Next Steps

You can now:

- Add equipment management features to the dashboard
- Create user profile editing functionality
- Add equipment categories and filtering
- Implement search and export features
- Add email notifications
- Create admin panels

## Support

For issues or questions:

1. Check the [Next.js documentation](https://nextjs.org/)
2. Check the [NextAuth.js documentation](https://next-auth.js.org/)
3. Check the [MongoDB documentation](https://docs.mongodb.com/)

## License

MIT
