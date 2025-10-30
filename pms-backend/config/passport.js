const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [profile.id]
        );

        if (existingUser.rows.length > 0) {
          // User exists, return user
          return done(null, existingUser.rows[0]);
        }

        // Check if email already exists with local provider
        const emailUser = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [profile.emails[0].value]
        );

        if (emailUser.rows.length > 0) {
          // Email exists, update with Google ID
          const updatedUser = await pool.query(
            "UPDATE users SET google_id = $1, provider = 'google' WHERE email = $2 RETURNING *",
            [profile.id, profile.emails[0].value]
          );
          return done(null, updatedUser.rows[0]);
        }

        // Create new user
        const newUser = await pool.query(
          "INSERT INTO users (email, name, google_id, provider) VALUES ($1, $2, $3, 'google') RETURNING *",
          [profile.emails[0].value, profile.displayName, profile.id]
        );

        return done(null, newUser.rows[0]);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
