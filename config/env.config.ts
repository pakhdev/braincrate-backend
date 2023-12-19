export const envConfig = () => ({
    environment: process.env.NODE_ENV,
    port: process.env.API_PORT,
    jwtSecret: process.env.JWT_SECRET,

    mysqlDbName: process.env.MYSQL_DB_NAME,
    mysqlHost: process.env.MYSQL_HOST,
    mysqlPort: +process.env.MYSQL_PORT,
    mysqlUser: process.env.MYSQL_USER,
    mysqlPassword: process.env.MYSQL_PASSWORD,
    mysqlTimezone: process.env.MYSQL_TIMEZONE,
    mysqlSync: process.env.MYSQL_SYNC === 'true',

    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
});
