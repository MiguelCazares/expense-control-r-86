import * as Joi from 'joi';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export const jwtValidationSchema = {
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().required(),
};

export default (): { jwt: JwtConfig } => ({
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
});
