import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { EventQueueNames, SocketChannel } from './event.enum';
import { EventDto } from './event.dto';

@WebSocketGateway({
    namespace: 'chat',
    cors: {
        origin: '*',
    },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    // Map of user emails to their socket IDs
    private emailToSocketMap: Map<string, string[]> = new Map();

    private findEmailBySocketId(socketId: string): string | undefined {
        const map = this.emailToSocketMap

        for (const [email, socketIds] of map.entries()) {
            if (socketIds.includes(socketId)) {
                return email;
            }
        }
        return undefined; // Not found
    }

    @WebSocketServer()
    server: Server;

    private notificationInterval: NodeJS.Timeout;

    constructor(
        private jwtService: JwtService
    ) {
        // Start emitting notifications periodically when the gateway is initialized
        // this.startPeriodicNotifications();
    }

    @SubscribeMessage(SocketChannel.EVENTS)
    findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
        return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
    }

    @SubscribeMessage(SocketChannel.IDENTITY)
    async identity(@MessageBody() data: number): Promise<number> {
        return data;
    }

    // @SubscribeMessage(SocketChannel.MESSAGES)
    // async handleEvent(@MessageBody() data: EventDto): Promise<EventDto> {
    //     console.log('New Event:', data)
    //     return {
    //         ...data,
    //         message: `Hello ${data.email}!`,
    //         type: EventQueueNames.MESSAGE
    //     }
    // }

    // Method to start sending notifications periodically
    startPeriodicNotifications() {
        this.notificationInterval = setInterval(() => {
            this.emitNotification();
        }, 5000); // Emit every 5 seconds (5000 ms)
    }

    // Emit notifications to the 'notifications' channel
    emitNotification() {
        const notificationData: EventDto = {
            email: 'admin@admin.com', // You can customize this data as needed
            message: 'This is a periodic notification.',
            title: 'The Title',
            type: EventQueueNames.MESSAGE,
        };

        this.sendNotificationToUser(notificationData);
    }

    // Stop the periodic notifications when the gateway is destroyed
    onModuleDestroy() {
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
        }
    }

    async handleConnection(client: Socket) {
        const token = client.handshake.auth?.token; // Retrieve token from the handshake auth data

        const jwtPayload = this.jwtService.decode(token);
        const userId = jwtPayload?.sub;
        const email = jwtPayload?.identifier

        if (!userId || !email) {
            client.emit('error', { message: 'Email is required for authentication' });
            client.disconnect();
            return;
        }

        // Add the client's socket ID to the map
        if (this.emailToSocketMap.has(email)) {
            this.emailToSocketMap.get(email).push(client.id);
        } else {
            this.emailToSocketMap.set(email, [client.id]);
        }

        console.log(`Client connected: ${client.id}, Email: ${email}`);
        console.log('Map:', this.emailToSocketMap)
    }

    async handleDisconnect(client: Socket) {
        const email = [...this.emailToSocketMap.keys()].find((key) =>
            this.emailToSocketMap.get(key).includes(client.id),
        );

        if (email) {
            const updatedSockets = this.emailToSocketMap
                .get(email)
                .filter((id) => id !== client.id);

            if (updatedSockets.length > 0) {
                this.emailToSocketMap.set(email, updatedSockets);
            } else {
                this.emailToSocketMap.delete(email);
            }
        }

        console.log(`Client disconnected: ${client.id}`);
    }

    // Method to send notifications to a specific user
    sendNotificationToUser(eventDto: EventDto) {
        const { email } = eventDto;
        const socketIds = this.emailToSocketMap.get(email);

        if (socketIds) {
            socketIds.forEach((socketId) => {
                this.server.to(socketId).emit(SocketChannel.MESSAGES, eventDto);
            });
        } else {
            console.warn(`No active connections for email: ${email}`);
        }
    }

    @SubscribeMessage(SocketChannel.JOIN_ROOM)
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: {
            room: string,
        }
    ) {
        client.join(data.room);
        console.log(`${client.id} joined room: ${data.room}`);
        this.server.to(data.room).emit('messages', {
            message: `User ${this.findEmailBySocketId(client.id)} joined the room.`,
            room: data.room,
            from: client.id
        });
    }

    @SubscribeMessage(SocketChannel.LEAVE_ROOM)
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: {
        room: string,
    }) {
        client.leave(data.room);
        console.log(`${client.id} left room: ${data.room}`);
        this.server.to(data.room).emit('messages', {
            message: `User ${this.findEmailBySocketId(client.id)} left the room.`,
            room: data.room,
        });
    }

    @SubscribeMessage(SocketChannel.GROUP_MESSAGE)
    handleGroupMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: {
            room: string; message: string
        }) {
        this.server.to(data.room).emit(SocketChannel.MESSAGES, {
            message: data.message,
            room: data.room,
            sender: this.findEmailBySocketId(client.id)
        });

        console.log('Room message')
    }
}
