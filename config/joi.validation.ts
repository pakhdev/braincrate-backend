import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    API_PORT: Joi.number().default(3003),
    MAX_JSON_PAYLOAD: Joi.string().default('50mb'),
    MYSQL_DB_NAME: Joi.string().required(),
    MYSQL_HOST: Joi.string().required(),
    MYSQL_PORT: Joi.number().default(3306),
    MYSQL_USER: Joi.string().required(),
    MYSQL_PASSWORD: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    MYSQL_TIMEZONE: Joi.string().default('Europe/Madrid'),
    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
});
