const JWT = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../configuration');

signToken = user => {
    return JWT.sign({
        iss: 'crackerrank',
        sub: user.id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1)
    }, JWT_SECRET);
};

module.exports = {
    signUp: async (req, res, next) => {
        console.log('signup')
        const { email, password } = req.value.body;

        //check if there is a user with the same email
        const foundUser = await User.findOne({ 'local.email': email })

        if (foundUser) {
            return res.status(403).json({ error: 'Email is already taken' })
        }
        //create a new user
        const newUser = new User({
            method: 'local',
            local: {
                email: email,
                password: password
            }
        });
        await newUser.save();

        //respond with token
        // res.json({user: 'created'});

        //generate token  
        const token = signToken(newUser);
        res.status(200).json({ token });
    },

    signIn: async (req, res, next) => {
        const token = signToken(req.user);
        res.status(401).json({ token });
    },

    googleOAuth: async (req, res, next) => {
        //Generate token
        const token = signToken(req.user);
        res.status(200).json({ token });
    },

    secret: async (req, res, next) => {
        res.json({ secret: 'secret resource' });
    }
}