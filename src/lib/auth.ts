// Temporary simplified auth implementation for deployment
export const authOptions = {
  providers: [],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session }) {
      return session;
    },
  },
  secret: "development-secret-do-not-use-in-production",
  debug: false,
};
