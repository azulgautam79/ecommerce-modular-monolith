import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import * as os from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on:`);

  const networkInterfaces = os.networkInterfaces();

  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]!) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`http://${net.address}:${port}`);
      }
    }
  }

  console.log(`http://localhost:${port}`);
}
bootstrap();
