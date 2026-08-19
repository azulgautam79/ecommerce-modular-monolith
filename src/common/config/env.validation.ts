import Joi from "joi";


export const envValidationSchema = Joi.object({

    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    PORT: Joi.number()
        .port()
        .default(3000),

    DATABASE_URL: Joi.string()
        .uri()
        .required(),

    JWT_ACCESS_SECRET: Joi.string()
        .min(32)
        .required(),

    JWT_REFRESH_SECRET: Joi.string()
        .min(32)
        .required(),

    JWT_ACCESS_EXPIRES_IN: Joi.string()
        .default('15m'),

    JWT_REFRESH_EXPIRES_IN: Joi.string()
        .default('7d'),

    // GOOGLE_CLIENT_ID: Joi.string()
    //     .required(),

    // GOOGLE_CLIENT_SECRET: Joi.string()
    //     .required(),

    // GOOGLE_CALLBACK_URL: Joi.string()
    //     .uri()
    //     .required(),

    GOOGLE_CLIENT_ID: Joi.string().optional(),

    GOOGLE_CLIENT_SECRET: Joi.string().optional(),

    GOOGLE_CALLBACK_URL: Joi.string()
        .uri()
        .optional(),
})