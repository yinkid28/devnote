import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log('✅ [JWT Callback] Triggered', { token, account, user });

      // Only create a new backendToken on first login
      if (account && user) {
        try {
          const customToken = jwt.sign(
            {
              user_id: user.id,
              email: user.email,
              name: user.name,
              avatar: user.image || '',
            },
            process.env.JWT_SECRET!,
            {
              algorithm: 'HS256',
              expiresIn: '10h',
            }
          );

          console.log('✅ [JWT Callback] Custom backendToken created');
          token.backendToken = customToken;
        } catch (err) {
          console.error('❌ [JWT Callback] Failed to create custom backendToken:', err);
        }
      }

      // Always return the token (including backendToken if it exists)
      if (!token.backendToken) {
        console.warn('⚠️ [JWT Callback] No backendToken on token');
      }

      return token;
    },

    async session({ session, token }) {
      console.log('✅ [Session Callback] Triggered', { session, token });

      if (token.backendToken) {
        session.backendToken = token.backendToken;
        console.log('✅ [Session Callback] backendToken added to session');
      } else {
        console.warn('⚠️ [Session Callback] No backendToken found on token');
      }

      if (session.user) {
        session.user.id = token.sub || session.user.id;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
