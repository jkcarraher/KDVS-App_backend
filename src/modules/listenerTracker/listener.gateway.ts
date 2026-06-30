import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ListenerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ListenerGateway.name);

  @WebSocketServer()
  server!: Server;

  private listeners = new Set<string>();

  public logListenerCount() {
    this.logger.log(
      `Heartbeat | Active sockets: ${this.server.sockets.sockets.size} | Active listeners: ${this.listeners.size}`,
    );
  }

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    this.listeners.delete(client.id);
    this.broadcastCount();
  }

  @SubscribeMessage('startListening')
  startListening(@ConnectedSocket() client: Socket) {
    this.listeners.add(client.id);
    this.broadcastCount();
  }

  @SubscribeMessage('stopListening')
  stopListening(@ConnectedSocket() client: Socket) {
    this.listeners.delete(client.id);
    this.broadcastCount();
  }

  private broadcastCount() {
    this.server.emit('listenerCount', {
      count: this.listeners.size,
    });
  }
}