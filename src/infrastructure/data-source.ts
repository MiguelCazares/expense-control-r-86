/* c8 ignore start */
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Mismo criterio que ConfigModule en app.module.ts: sin esto el CLI de TypeORM
// corre las migraciones contra la base real aunque NODE_ENV sea 'test'.
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.{ts,js}'],
  migrations: ['database/migrations/*.{ts,js}'],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
/* c8 ignore end */
