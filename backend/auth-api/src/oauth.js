import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { createUser, findUserByEmail, updateUser } from "./store.js";
import { ROLES } from "./constants.js";

async function upsertSocialUser({ email, name, provider }) {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized) return null;
  const existing = findUserByEmail(normalized);
  if (existing) {
    return updateUser(existing.id, {
      name: existing.name || name || "",
      provider,
      isActive: true,
    });
  }
  return createUser({
    name: name || "",
    email: normalized,
    provider,
    role: ROLES.USER,
    isActive: true,
  });
}

export function setupOauth() {
  const googleClientID = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const githubClientID = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const apiBase = process.env.API_BASE_URL || "http://localhost:5001";

  const providers = {
    google: Boolean(googleClientID && googleClientSecret),
    github: Boolean(githubClientID && githubClientSecret),
  };

  if (providers.google) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientID,
          clientSecret: googleClientSecret,
          callbackURL: `${apiBase}/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const user = await upsertSocialUser({
              email,
              name: profile.displayName,
              provider: "google",
            });
            return done(null, user || false);
          } catch (error) {
            return done(error);
          }
        },
      ),
    );
  }

  if (providers.github) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: githubClientID,
          clientSecret: githubClientSecret,
          callbackURL: `${apiBase}/auth/github/callback`,
          scope: ["user:email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const primary = profile.emails?.[0]?.value || profile._json?.email;
            const user = await upsertSocialUser({
              email: primary,
              name: profile.displayName || profile.username,
              provider: "github",
            });
            return done(null, user || false);
          } catch (error) {
            return done(error);
          }
        },
      ),
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((_id, done) => done(null, null));

  return providers;
}
