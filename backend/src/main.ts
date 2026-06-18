import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  const apiPrefix = process.env.API_PREFIX ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // ── 1. CORS — must be FIRST, before helmet and any other middleware ──
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:4200'];
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? corsOrigins.filter(o => !o.includes('localhost'))
    : corsOrigins;
  logger.log(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`);
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── 2. Helmet — after CORS so preflight OPTIONS aren't blocked ──
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  }));
  app.use(compression());

  // ── 3. Request logging + timeout (with CORS headers in 504 response) ──
  app.use((req, res, next) => {
    const start = Date.now();
    logger.log(`→ ${req.method} ${req.originalUrl}`);
    res.setTimeout(55000, () => {
      logger.error(`Timeout: ${req.method} ${req.originalUrl} — no respondió en 55s`);
      // Include CORS header so the browser shows the real error, not "CORS blocked"
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      res.status(504).json({
        statusCode: 504,
        message: 'Gateway Timeout — el servidor no respondió a tiempo',
        error: 'Gateway Timeout',
      });
    });
    res.on('finish', () => {
      logger.log(`← ${req.method} ${req.originalUrl} ${res.statusCode} — ${Date.now() - start}ms`);
    });
    next();
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CB Tomelloso API')
      .setDescription('API REST oficial del Club Baloncesto Tomelloso')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger disponible en: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend CB Tomelloso corriendo en: http://0.0.0.0:${port}/${apiPrefix}`);
}
bootstrap();
