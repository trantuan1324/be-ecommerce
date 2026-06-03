import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { parseEnvOrigins } from './utils/parse-env-origins';
import { ValidationPipe, VersioningType } from '@nestjs/common';

const getCorsAllowedOrigins = () => {
  return parseEnvOrigins(process.env.CLIENT_URL, process.env.CORS_OTHER_URL);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsAllowedOrigins = getCorsAllowedOrigins();
  app.enableCors({
    origin: corsAllowedOrigins,
    credentials: true,
  });

  app.use(cookieParser());

  // CORS
  const allowList = getCorsAllowedOrigins();
  app.enableCors({
    origin: (requestOrigin: string, callBack) => {
      if (!requestOrigin) {
        callBack(null, true);
      }

      if (allowList.includes(requestOrigin)) {
        callBack(null, true);
      }

      // TODO: log warning
      callBack(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    credentials: true,
  });

  // ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
