import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface UserToken {
  id: string;
  email: string;
  role: string;
  providerId: string;
}

export function generateToken(user: UserToken): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      providerId: user.providerId,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): UserToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserToken;
  } catch (error) {
    return null;
  }
}

// Temporary simplified auth implementation for deployment
export const authOptions = {
  providers: [],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async session({ session }: { session: any }) {
      return session;
    },
    async jwt({ token }: { token: any }) {
      return token;
    },
  },
  secret: "development-secret-do-not-use-in-production",
  debug: false,
};
