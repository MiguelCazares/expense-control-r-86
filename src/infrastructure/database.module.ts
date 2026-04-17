import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('db.host'),
        port: config.get<number>('db.port'),
        username: config.get('db.username'),
        password: config.get('db.password'),
        database: config.get('db.name'),
        entities: [__dirname + '/../**/*.entity.{ts,js}'],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
