import { Module } from '@nestjs/common';
import { ListenerGateway } from './listener.gateway';
import { ListenerTask } from './listener.task';
import { ListnersController } from './controllers/listeners.controller';

@Module({
  imports: [],
  controllers:[
    ListnersController,
  ],
  providers: [
    ListenerGateway,
    ListenerTask,
  ],
  exports: [
    ListenerTask,
  ],
})
export class ListenerModule {}