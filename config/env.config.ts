export const envConfig = () => ({
    environment: process.env.NODE_ENV,
    apiPrefix: process.env.API_PREFIX,
    port: process.env.API_PORT,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresInSeconds: Number(process.env.JWT_EXPIRATION_TIME_HOURS) * 60 * 60,
    jwtExpiresInHours: process.env.JWT_EXPIRATION_TIME_HOURS,
    cookieSecureFlag: process.env.COOKIE_SECURE_FLAG.toLowerCase() === 'true',
    frontEndUrl: process.env.FRONTEND_URL,

    mysqlDbName: process.env.MYSQL_DB_NAME,
    mysqlHost: process.env.MYSQL_HOST,
    mysqlPort: +process.env.MYSQL_PORT,
    mysqlUser: process.env.MYSQL_USER,
    mysqlPassword: process.env.MYSQL_PASSWORD,
    mysqlTimezone: process.env.MYSQL_TIMEZONE,
    mysqlSync: process.env.MYSQL_SYNC.toLowerCase() === 'true',

    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleLinkUrl: process.env.GOOGLE_LINK_URL,
    googleAuthUrl: process.env.GOOGLE_AUTH_URL,
});
