import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SERVER_VERSION } from 'apps/immich/src/constants/server_version.constant';
import { getLogLevels } from '@app/common';
import { RedisIoAdapter } from '../../immich/src/middlewares/redis-io.adapter.middleware';
import { MicroservicesModule } from './microservices.module';

const logger = new Logger('ImmichMicroservice');

async function bootstrap() {
  const app = await NestFactory.create(MicroservicesModule, {
    logger: getLogLevels(),
  });

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(3002, () => {
    const envName = (process.env.NODE_ENV || 'development').toUpperCase();
    logger.log(`Running Immich Microservices in ${envName} environment - version ${SERVER_VERSION}`);
  });
}
bootstrap();
