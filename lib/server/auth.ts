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

  validateAuthConfiguration({
    serverUrl: options.serverUrl,
    localAuthEnabled: options.localAuthEnabled,
    secret,
  });

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

function validateAuthConfiguration(options: {
  serverUrl: string;
  localAuthEnabled: boolean;
  secret?: string;
}) {
  let publicUrl: URL;
  try {
    publicUrl = new URL(options.serverUrl);
  } catch {
    throw new Error("SERVER_URL must be a valid absolute URL");
  }

  if (!["http:", "https:"].includes(publicUrl.protocol)) {
    throw new Error("SERVER_URL must use HTTP or HTTPS");
  }

  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    if (!process.env.SERVER_URL) {
      throw new Error("SERVER_URL is required in production");
    }
    if (publicUrl.protocol !== "https:") {
      throw new Error("SERVER_URL must use HTTPS in production");
    }
    if (["localhost", "127.0.0.1"].includes(publicUrl.hostname)) {
      throw new Error("SERVER_URL must use the public production hostname");
    }
    if (
      !options.secret ||
      options.secret.length < 32 ||
      options.secret.includes("AT_LEAST_32_CHARACTERS") ||
      options.secret.includes("change-before-production")
    ) {
      throw new Error(
        "BETTER_AUTH_SECRET must be a non-placeholder value of at least 32 characters in production",
      );
    }
  }

  if (!options.localAuthEnabled) {
    requireGoogleCredential("GOOGLE_CLIENT_ID");
    requireGoogleCredential("GOOGLE_CLIENT_SECRET");
  }
}

function requireGoogleCredential(
  name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET",
) {
  const value = process.env[name]?.trim();
  if (
    !value ||
    value.toLowerCase().includes("disabled") ||
    value.startsWith("GOOGLE_CLIENT_")
  ) {
    throw new Error(
      `${name} must be configured when Google authentication is enabled`,
    );
  }
}

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
