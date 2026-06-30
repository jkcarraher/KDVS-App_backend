import { Module } from '@nestjs/common';
import { ListenerGateway } from './listener.gateway';
import { ListenerTask } from './listener.task';

@Module({
  imports: [],
  providers: [
    ListenerGateway,
    ListenerTask,
  ],
  exports: [
    ListenerTask,
  ],
})
export class ListenerModule {}