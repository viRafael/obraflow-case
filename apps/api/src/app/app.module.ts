import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from '../common/errors/all-exceptions.filter.js';
import { createValidationPipe } from '../common/validation/validation.js';
import { HealthController } from '../health/health.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [HealthController],
  providers: [
    // Registrados aqui (e não no main.ts) para valerem também nos testes e2e.
    { provide: APP_PIPE, useFactory: createValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
