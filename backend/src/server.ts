import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { ENV } from './config/env';
import { connectDatabase } from './config/db';
import { pagerHealth } from './services/pagerHealth.service';

const server = http.createServer(app);

export const ioServer = new SocketIOServer(server, {
  cors: {
    origin: ENV.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Real-Time Tactical WebSocket Gateway
ioServer.on('connection', (socket) => {
  console.log(`🔌 [Socket.IO] Responder terminal connected: ${socket.id}`);

  // Join incident command channel
  socket.on('incident:join_room', (incidentId: string) => {
    socket.join(`incident:${incidentId}`);
    console.log(`📡 [Socket.IO] Terminal ${socket.id} joined incident room: ${incidentId}`);
  });

  // Leave incident command channel
  socket.on('incident:leave_room', (incidentId: string) => {
    socket.leave(`incident:${incidentId}`);
  });

  // Join hardware pager device channel for direct paging
  socket.on('device:listen', (deviceId: string) => {
    socket.join(`device:${deviceId}`);
    console.log(`📟 [Socket.IO] Listening to hardware pager: ${deviceId}`);
  });

  // Handle tactical chat in channel
  socket.on('chat:send', (data: { channelKey: string; message: any }) => {
    ioServer.to(data.channelKey).emit('chat:message', data.message);
  });

  socket.on('disconnect', () => {
    // Terminal disconnected
  });
});

async function bootstrap() {
  try {
    // 1. Connect database (Mongoose / MongoDB Atlas with graceful in-memory fallback)
    await connectDatabase();

    // 2. Start background telemetry and deadman switch monitor
    pagerHealth.startMonitoring(10000);

    // 3. Start HTTP and WebSocket listener
    server.listen(ENV.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 RESQLINK TACTICAL NETWORK INITIALIZED`);
      console.log(`📡 Server listening on: http://localhost:${ENV.PORT}`);
      console.log(`📖 Swagger API Docs:    http://localhost:${ENV.PORT}/api/docs`);
      console.log(`📟 Pager Mesh Telemetry: ACTIVE`);
      console.log(`💻 Web Portal / Demo:   http://localhost:${ENV.PORT}/`);
      console.log(`=======================================================`);
    });
  } catch (err: any) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

// Graceful termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.');
  pagerHealth.stopMonitoring();
  server.close(() => process.exit(0));
});

bootstrap();

