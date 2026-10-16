import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
async function bootstrap() {
  if (process.env.DEMO_MODE !== 'true') throw new Error('API de demonstração bloqueada. Defina DEMO_MODE=true somente em ambiente local.');
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' });
  await app.listen(Number(process.env.PORT ?? 3001), '127.0.0.1');
  console.log(`API mock Kawaii em http://127.0.0.1:${process.env.PORT ?? 3001} (uso local)`);
}
void bootstrap();
