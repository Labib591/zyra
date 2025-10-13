import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.OAUTH_CLIENT_ID!,
            clientSecret: process.env.OAUTH_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                // id: { label: "ID", type: "text", placeholder: "1" },
                email: { label: "Email", type: "email", placeholder: "you@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    return null;
                }

                // Check if user has a password (not an OAuth user)
                if (!user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                };
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            // Handle OAuth sign in
            if (account?.provider === "google") {
                if (!user.email) {
                    return false;
                }

                // Check if user exists
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                // Create user if they don't exist
                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "User",
                            password: null,
                        }
                    });
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // On initial sign in (when user object exists)
            if (user) {
                // Check if this is OAuth provider (Google, etc.)
                if (account?.provider === "google") {
                    // For OAuth providers, always fetch user from database
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });
                    if (dbUser) {
                        token.id = dbUser.id;
                    }
                } else if (user.id) {
                    // For credentials provider, user.id is already correct
                    token.id = user.id as string;
                }
            }
            // If token still doesn't have ID, try to fetch from database
            if (!token.id && token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email }
                });
                if (dbUser) {
                    token.id = dbUser.id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
};

