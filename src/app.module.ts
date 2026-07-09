import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig, { appValidationSchema } from 'src/config/app.config';
import databaseConfig, {
  databaseValidationSchema,
} from 'src/config/database.config';
import jwtConfig, { jwtValidationSchema } from 'src/config/jwt.config';
import loggerConfig, { loggerValidationSchema } from 'src/config/logger.config';
import { DatabaseModule } from 'src/infrastructure/database.module';
import { LoggerModule } from 'src/infrastructure/logger.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { OwnersModule } from 'src/owners/owners.module';
import { BusesModule } from 'src/buses/buses.module';
import { DriversModule } from 'src/drivers/drivers.module';
import { IncomeModule } from 'src/income/income.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { ShiftsModule } from 'src/shifts/shifts.module';
import { CashFlowModule } from 'src/cash-flow/cash-flow.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, loggerConfig],
      validationSchema: Joi.object({
        ...appValidationSchema,
        ...databaseValidationSchema,
        ...jwtValidationSchema,
        ...loggerValidationSchema,
      }),
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    DatabaseModule,
    LoggerModule,
    AuthModule,
    OwnersModule,
    BusesModule,
    DriversModule,
    IncomeModule,
    ExpensesModule,
    ShiftsModule,
    CashFlowModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
