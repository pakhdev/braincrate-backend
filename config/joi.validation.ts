import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
    PORT: Joi.number().default(3002),
});
