const cors = require('cors');

/**
 * CORS configuration
 */
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
    optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);

