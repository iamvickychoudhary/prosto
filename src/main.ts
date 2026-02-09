import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from '@config/app-config.service';
import { HttpExceptionFilter } from '@core/filters/http-exception.filter';
import { TransformInterceptor } from '@core/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get configuration service
  const configService = app.get(AppConfigService);
  // Use resolve() for transient-scoped providers
  const logger = await app.resolve(WinstonLoggerService);

  // Use custom logger
  app.useLogger(logger);

  // Security middleware
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.apiVersion,
  });

  // Global prefix
  app.setGlobalPrefix(configService.apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(logger), new TransformInterceptor());

  // Swagger documentation
  if (configService.isDevelopment) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Prosto Dating App API')
      .setDescription(
        `
## Prosto Dating App Backend API

### Overview
This API provides endpoints for:
- **Login** - OTP-based authentication (phone/email)
- **Registration** - Multi-step profile creation
- **Profile** - Profile updates and photo management

### Authentication
All protected endpoints require a Bearer JWT token in the Authorization header.

### API Version
Current version: **3.3.0**
      `.trim(),
      )
      .setVersion('3.3.0')
      .setContact('Prosto Team', 'https://prosto.app', 'support@prosto.app')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      // Login & Auth
      .addTag('auth', 'OTP-based authentication (login, verify-otp, resend-otp, token refresh)')
      // Registration
      .addTag('registration', 'Multi-step profile registration (draft, profile updates, complete)')
      // User Management
      .addTag('users', 'User management endpoints')
      // Other
      .addTag('ai', 'AI integration endpoints')
      .addTag('search', 'Search endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: 'Prosto Dating App API',
      customfavIcon: 'https://prosto.app/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #e91e63 }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
      },
    });

    logger.log(`📚 Swagger documentation available at /docs`, 'Bootstrap');
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start server
  const port = configService.port;
  const host = configService.host;

  await app.listen(port, host);

  logger.log(
    `🚀 Application is running on: http://${host}:${port}/${configService.apiPrefix}`,
    'Bootstrap',
  );
  logger.log(`🌍 Environment: ${configService.nodeEnv}`, 'Bootstrap');
}

bootstrap();
