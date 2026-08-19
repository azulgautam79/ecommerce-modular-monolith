import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as os from 'os';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { join } from 'path';
import { randomBytes } from 'crypto';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //! Enable graceful shutdown
  app.enableShutdownHooks();

  //! Static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  //! Versioning
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '', method: RequestMethod.GET }, // GET /
    ],
  });

  //! Helmet
  app.use(helmet());

  //! Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  //! Cors
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  //! Swagger
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription("REST API for ecommerce application")
    .setVersion('1.0.0')
    .setOpenAPIVersion('3.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addServer(
      process.env.API_URL!,
      process.env.NODE_ENV === 'production'
        ? 'Production server'
        : 'Development server',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  //! OpenAPI JSON
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.get(
    '/api/openapi.json',
    (_req: Request, res: Response) => {
      res.json(document);
    },
  );

  //! Scalar
  expressApp.get(
    '/api/docs',
    (_req: Request, res: Response) => {
      const nonce = randomBytes(16).toString('base64');

      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",

          // Scalar CDN + nonce-protected inline scripts
          `script-src 'self' https://cdn.jsdelivr.net 'nonce-${nonce}'`,

          // Scalar injects styles dynamically
          "style-src 'self' 'unsafe-inline'",

          // Local assets only
          "img-src 'self' data:",

          // No external fonts because withDefaultFonts=false
          "font-src 'self' data:",

          // OpenAPI document + Scalar services
          "connect-src 'self' https://api.scalar.com",

          "object-src 'none'",
          "base-uri 'self'",
          "frame-ancestors 'self'",
        ].join('; '),
      );

      res.type('html').send(`
        <!doctype html>
        <html>
          <head>
            <title>API Documentation</title>

            <meta charset="utf-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />

            <meta
              property="csp-nonce"
              content="${nonce}"
            />

            <link
              rel="icon"
              type="image/svg+xml"
              href="/logo.svg"
            />
          </head>

          <body>
            <div id="app"></div>

            <script
          src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"
          nonce="${nonce}"
        ></script>

            <script nonce="${nonce}">
              Scalar.createApiReference('#app', {
                url: '/api/openapi.json',
                theme: 'elysiajs',
                favicon: '/logo.svg',
                logo: '/logo.svg',
                pageTitle: 'API Documentation',
                withDefaultFonts: false,
                telemetry: false,
                agent: {
                  disabled: true,
                },
              });
            </script>
          </body>
        </html>
      `);
    },
  );

  //! Server Ports
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
  console.log(`Scalar Docs: http://localhost:${port}/api/docs`);
  console.log(`OpenAPI JSON: http://localhost:${port}/api/openapi.json`);
}
bootstrap();
