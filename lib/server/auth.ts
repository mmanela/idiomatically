import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import type { Db, MongoClient } from "mongodb";
import { UserRole } from "./_graphql/types";

const LOCAL_PASSWORD = "idiomatically-local-development";

function roleForEmail(email: string, adminEmails: string[]) {
  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail === "local-admin@idiomatically.test") {
    return UserRole.Admin;
  }
  if (normalizedEmail === "local-contributor@idiomatically.test") {
    return UserRole.Contributor;
  }
  if (normalizedEmail === "local-general@idiomatically.test") {
    return UserRole.General;
  }
  return adminEmails.includes(normalizedEmail) ? UserRole.Admin : UserRole.General;
}

export function createAuth(options: {
  client: MongoClient;
  database: Db;
  serverUrl: string;
  adminEmails: string[];
  localAuthEnabled: boolean;
}) {
  const secret =
    process.env.BETTER_AUTH_SECRET ||
    (process.env.NODE_ENV === "production"
      ? undefined
      : "idiomatically-development-secret-change-before-production");

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required in production");
  }

  return betterAuth({
    appName: "Idiomatically",
    baseURL: options.serverUrl,
    basePath: "/api/auth",
    secret,
    trustedOrigins: [options.serverUrl],
    database: mongodbAdapter(options.database, {
      client: options.client,
      transaction: false,
    }),
    advanced: {
      cookiePrefix: "idiomatically",
      database: {
        joins: true,
      },
    },
    user: {
      modelName: "authUser",
      additionalFields: {
        role: {
          type: [UserRole.Admin, UserRole.Contributor, UserRole.General],
          input: false,
          required: true,
          defaultValue: UserRole.General,
        },
      },
    },
    session: {
      modelName: "authSession",
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    account: {
      modelName: "authAccount",
    },
    verification: {
      modelName: "authVerification",
    },
    emailAndPassword: {
      enabled: options.localAuthEnabled,
      disableSignUp: !options.localAuthEnabled,
      minPasswordLength: 12,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            data: {
              ...user,
              role: roleForEmail(user.email, options.adminEmails),
            },
          }),
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

export function getLocalIdentity(role: string) {
  const normalizedRole = role.toUpperCase();
  const roles = {
    GENERAL: {
      email: "local-general@idiomatically.test",
      name: "Local general",
    },
    CONTRIBUTOR: {
      email: "local-contributor@idiomatically.test",
      name: "Local contributor",
    },
    ADMIN: {
      email: "local-admin@idiomatically.test",
      name: "Local admin",
    },
  } as const;

  const identity = roles[normalizedRole as keyof typeof roles];
  return identity ? { ...identity, password: LOCAL_PASSWORD } : null;
}
