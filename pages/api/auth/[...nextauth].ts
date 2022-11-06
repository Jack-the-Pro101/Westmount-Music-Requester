import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  pages: {
    signIn: "/authentication/login",
    signOut: "/authentication/logout",
    error: "/authentication/error", // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },

  callbacks: {
    async signIn({ account, profile }) {
      if (profile?.email != null && !profile.email.endsWith("@hwdsb.on.ca")) {
        return false;
      }

      return true;
    },
  },

  secret: process.env.JWT_SECRET,
});
