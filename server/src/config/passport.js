require('dotenv').config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const authService = require('../services/auth.service');
const urls = require('./urls');

/**
 * Generic OAuth Callback Handler
 */
const oauthCallback = async (accessToken, refreshToken, profile, done, provider, roleFromQuery) => {
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    const name = profile.displayName || profile.username;
    const profileId = profile.id;

    try {
        const user = await authService.handleOAuthCallback({
            provider,
            profileId,
            email,
            name,
            roleFromQuery,
        });
        return done(null, user);
    } catch (err) {
        // Pass the error to the callback so it can be handled in the route
        // The error will be available in req.session.error or req.authInfo
        const logger = require('../utils/logger');
        logger.error(`[OAuth] ${provider} callback error:`, err.message);
        return done(err, null);
    }
};

const logger = require('../utils/logger');

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const googleCallbackURL = `${urls.getServerUrl()}/api/auth/google/callback`;
    logger.info(`[OAuth] Google callback URL: ${googleCallbackURL}`);
    logger.info(`[OAuth] Environment: NODE_ENV=${process.env.NODE_ENV}, VERCEL=${process.env.VERCEL}, VERCEL_URL=${process.env.VERCEL_URL}`);
    
    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackURL,
        passReqToCallback: true,
    }, (req, accessToken, refreshToken, profile, done) => {
        const roleFromQuery = req.roleFromState;
        oauthCallback(accessToken, refreshToken, profile, done, 'google', roleFromQuery);
    }));
} else {
    logger.warn('Google OAuth credentials not found. Google sign-in will not work.');
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    const githubCallbackURL = `${urls.getServerUrl()}/api/auth/github/callback`;
    logger.info(`[OAuth] GitHub callback URL: ${githubCallbackURL}`);
    logger.info(`[OAuth] Environment: NODE_ENV=${process.env.NODE_ENV}, VERCEL=${process.env.VERCEL}, VERCEL_URL=${process.env.VERCEL_URL}`);
    
    passport.use('github', new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: githubCallbackURL,
        scope: ['user:email'],
        passReqToCallback: true,
    }, (req, accessToken, refreshToken, profile, done) => {
        const roleFromQuery = req.roleFromState;
        oauthCallback(accessToken, refreshToken, profile, done, 'github', roleFromQuery);
    }));
} else {
    logger.warn('GitHub OAuth credentials not found. GitHub sign-in will not work.');
}

module.exports = passport;

