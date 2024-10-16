// const login = async (req, res) => {
//     // TODO: Implement login logic
//     res.status(200).json({ message: 'Login endpoint' });
//   };

//   export default {
//     login
//   };


const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../config/app');
const User = require('../models/user');

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Create new user if not found
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      });
      await user.save();
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));