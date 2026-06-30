import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ListenerGateway } from './listener.gateway';

@Injectable()
export class ListenerTask {
  constructor(
    private readonly listenerGateway: ListenerGateway,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  runListenerHeatbeat() {
    this.listenerGateway.logListenerCount();
  }
}