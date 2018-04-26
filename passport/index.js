const JWT = require("jsonwebtoken");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../app/users/model");
const config = require("../config");

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: config.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub);

        if (!user) {
          return done(null, false);
        }

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          return done(null, false);
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
          return done(null, false);
        }

        // Otherwise, return the user
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

const signToken = user => {
  return JWT.sign(
    {
      iss: config.JWT_ISS,
      sub: user.id,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 1)
    },
    config.JWT_SECRET
  );
};

const requireAuthMiddleware = (req, res, next) =>
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          code: 401
        }
      });
    }
    req.user = user;
    next();
  })(req);

module.exports = {
  signToken,
  passport,
  requireAuthMiddleware
};
