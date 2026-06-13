import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { APP_CONFIG } from 'src/config/app/app.config';
import { ConfigService } from '@nestjs/config';

export function setupApp(
  app: NestExpressApplication,
  logger: Logger,
  config: ConfigService,
) {
  app.use(cookieParser());

  // CORS
  const appCfg = config.getOrThrow<{ corsOrigins: string[] }>(APP_CONFIG);
  const allowList = appCfg.corsOrigins;
  app.enableCors({
    origin: (requestOrigin: string, callBack) => {
      if (!requestOrigin) {
        callBack(null, true);
      }

      if (allowList.includes(requestOrigin)) {
        callBack(null, true);
      }

      // TODO: log warning
      logger.warn(
        `CORS: blocked request from origin "${requestOrigin}" (not in allowList`,
      );
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

  app.enableShutdownHooks();
}
