const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
// const GooglePlusTokenStrategy = require('passport-google-plus-token').Strategy;
const GooglePlusTokenStrategy = require('passport-google-oauth20').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('./configuration');
const User = require('./models/user');
const keys = require('./configuration');

//JSON WEB TOKEN STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET
}, async (payload, done) => {
    try {
        //Find the user specified in token
        const user = await User.findById(payload.sub);

        //If user doesn't exists, handle it
        if (!user) {
            return done(null, false);
        }

        //Otherwise, return the user
        done(null, user);

    } catch (error) {
        done(error, false);
    }
}));

//GOOGLE OAUTH STRATEGY
passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: keys.GoogleConfig.clientID,
    clientSecret: keys.GoogleConfig.clientSecret,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log(accessToken, refreshToken, profile);
        const existingUser = await User.findOne({ "google.id": profile.id });
        if (existingUser) {
            return done(null, existingUser);
        }

        //if new account
        const newUser = new User({
            method: 'google',
            google: {
                id: profile.id,
                email: profiles.emails[0].value
            }
        });

        await newUser.save();
        done(null, newUser);
    } catch (error) {
        done(error, false, error.message);
    }

})
);

//LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try {
        //Find the user given the email
        const user = await User.findOne({ 'local.email': email });

        //If not, handle it
        if (!user) {
            return done(null, false);
        }

        //Check if the password is correct
        const isMatch = await user.isValidPassword(password);

        //If not, handle it
        if (!isMatch) {
            return done(null, false);
        }

        //Otherwise, return the user
        done(null, user);
    } catch (error) {
        done(error, false);
    }

}))