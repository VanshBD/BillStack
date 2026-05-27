/*
 * Central environment configuration loader for the backend.
 * Loads environment variables once and validates required vars.
 */
const path = require('path');
const Joi = require('joi');

// Load .env and .env.local (overrides .env) if present
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE: Joi.string().uri().default('mongodb://localhost:27017/enterprise-invoice'),
  PORT: Joi.number().default(8888),
  JWT_SECRET: Joi.string().default('dev_jwt_secret'),
  OPENAI_API_KEY: Joi.string().allow('', null),
  PUBLIC_SERVER_FILE: Joi.string().default('http://localhost:8888/'),
  RESEND_API: Joi.string().allow('', null),
  BILLSTACK_APP_EMAIL: Joi.string().email().default('noreply@billstack.app'),
  DO_SPACES_SECRET: Joi.string().allow('', null),
  DO_SPACES_KEY: Joi.string().allow('', null),
  DO_SPACES_URL: Joi.string().allow('', null),
  DO_SPACES_NAME: Joi.string().allow('', null),
  REGION: Joi.string().allow('', null),
  SMTP_HOST: Joi.string().allow('', null),
  SMTP_PORT: Joi.number().allow(null),
  SMTP_USER: Joi.string().allow('', null),
  SMTP_PASS: Joi.string().allow('', null),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
}).unknown(true);

const { value: envVars, error } = envVarsSchema.validate(process.env, {
  abortEarly: false,
});
if (error) {
  console.error('Environment validation error:', error.message);
  throw new Error(`Config validation error: ${error.message}`);
}

// Warn if we're using fallback values (helpful during local development)
if (envVars.NODE_ENV === 'development') {
  if (!process.env.DATABASE) {
    console.warn('⚠️  Using fallback DATABASE (mongodb://127.0.0.1:27017/billstack-db). Update your .env to set DATABASE.');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  Using fallback JWT_SECRET for development. Set JWT_SECRET in your .env for proper security.');
  }
}

const config = {
  nodeEnv: envVars.NODE_ENV,
  database: envVars.DATABASE,
  port: Number(envVars.PORT),
  jwtSecret: envVars.JWT_SECRET,
  openAiKey: envVars.OPENAI_API_KEY,
  publicServerFile: envVars.PUBLIC_SERVER_FILE,
  resendApi: envVars.RESEND_API,
  appEmail: envVars.BILLSTACK_APP_EMAIL,
  smtp: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
    secure: envVars.SMTP_SECURE,
  },
  doSpaces: {
    secret: envVars.DO_SPACES_SECRET,
    key: envVars.DO_SPACES_KEY,
    url: envVars.DO_SPACES_URL,
    bucket: envVars.DO_SPACES_NAME,
    region: envVars.REGION,
  },
};

module.exports = config;
