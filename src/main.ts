import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api')) {
      req.url = req.url.replace('/api', '');
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
