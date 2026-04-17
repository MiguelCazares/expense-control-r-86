import * as Joi from 'joi';

export interface AppConfig {
  port: number;
  env: string;
}

export const appValidationSchema = {
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'local')
    .default('development'),
  PORT: Joi.number().default(3000),
};

export default (): { app: AppConfig } => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
});
