import { Controller, Get } from '@nestjs/common';
import { ListenerGateway } from '../listener.gateway';

@Controller({
  path: 'metrics',
  version: '1',
})
export class ListnersController {
  constructor(private readonly listenerGateway: ListenerGateway) {}

  @Get('listeners')
  getListeners() {
    const count = this.listenerGateway.getListenerCount();

    return {
      schemaVersion: 1,
      label: 'Current Listeners',
      message: String(count),
      color: count > 0 ? 'brightgreen' : 'red',
    };
  }
}