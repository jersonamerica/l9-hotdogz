import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "./db";
import { User } from "@/models/User";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface CustomToken extends JWT {
  id?: string;
  role?: string;
  isOnboarded?: boolean;
}

interface CustomSession extends Session {
  user?: {
    name?: string | null;
    image?: string | null;
    id?: string;
    role?: string;
    isOnboarded?: boolean;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      try {
        await connectDB();

        // Check if user exists by providerId
        let dbUser = await User.findOne({ providerId: account.providerAccountId });

        if (!dbUser) {
          // Create new user
          dbUser = await User.create({
            providerId: account.providerAccountId,
            name: user.name,
            image: user.image,
          });
        }

        return true;
      } catch (error) {
        console.error("=== SIGN IN ERROR ===");
        console.error("Error during sign in:", error);
        console.error("Provider ID:", account.providerAccountId);
        console.error("=== END SIGN IN ERROR ===");
        return false;
      }
    },

    async jwt({ token, account, trigger }) {
      const customToken = token as CustomToken;

      // Refresh user data on sign-in or session update
      if (account || trigger === "update" || !customToken.id) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ providerId: token.sub });
          if (dbUser) {
            customToken.id = dbUser._id.toString();
            customToken.role = dbUser.role;
            customToken.isOnboarded = dbUser.isOnboarded || false;
          }
        } catch (error) {
          console.error("Error getting user ID:", error);
        }
      }

      return customToken;
    },

    async session({ session, token }) {
      const customSession = session as CustomSession;
      const customToken = token as CustomToken;

      if (customSession.user) {
        customSession.user.id = customToken.id;
        customSession.user.role = customToken.role;
        customSession.user.isOnboarded = customToken.isOnboarded;
      }

      return customSession;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
