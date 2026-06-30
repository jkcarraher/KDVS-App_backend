import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ListenerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private listeners = new Set<string>();

  handleConnection(client: Socket) {
    console.log(
      `[Socket Connected] ${client.id} | Active sockets: ${this.server.sockets.sockets.size}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.listeners.delete(client.id);

    console.log(
      `[Socket Disconnected] ${client.id} | Listeners: ${this.listeners.size}`,
    );

    this.broadcastCount();
  }

  @SubscribeMessage('startListening')
  startListening(@ConnectedSocket() client: Socket) {
    this.listeners.add(client.id);

    console.log(
      `[Listener Started] ${client.id} | Current listeners: ${this.listeners.size}`,
    );

    this.broadcastCount();
  }

  @SubscribeMessage('stopListening')
  stopListening(@ConnectedSocket() client: Socket) {
    this.listeners.delete(client.id);

    console.log(
      `[Listener Stopped] ${client.id} | Current listeners: ${this.listeners.size}`,
    );

    this.broadcastCount();
  }

  private broadcastCount() {
    console.log(
      `[Broadcast] Listener count = ${this.listeners.size}`,
    );

    this.server.emit('listenerCount', {
      count: this.listeners.size,
    });
  }
}