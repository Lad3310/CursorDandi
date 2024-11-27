import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: "select_account",
        },
      },
    }),
  ],
  debug: true,
  logger: {
    error: (code, ...message) => {
      console.error('NextAuth Error:', code, message);
    },
  },
  pages: {
    error: '/auth/error',
    signIn: '/auth/signin',
  }
});

export { handler as GET, handler as POST }; 