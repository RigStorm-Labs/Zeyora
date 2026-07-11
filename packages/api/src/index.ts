import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { initializePrisma, initializeMongo, initializeRedis, closeConnections } from './config/database';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/error';
import routes from './routes';
import { logger } from './utils/logger';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: [config.clients.user, config.clients.vendor, config.clients.admin],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [config.clients.user, config.clients.vendor, config.clients.admin],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api', routes);

// Socket.io authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.data.user.id}`);

  // Join user's room for notifications
  socket.join(`user:${socket.data.user.id}`);

  // Join partner room for location tracking
  if (socket.data.user.role === 'partner') {
    socket.join('partners');
  }

  // Order tracking
  socket.on('track:order', (orderId: string) => {
    socket.join(`order:${orderId}`);
    logger.info(`User ${socket.data.user.id} tracking order ${orderId}`);
  });

  // Partner location update
  socket.on('location:update', async (data: { latitude: number; longitude: number }) => {
    if (socket.data.user.role === 'partner') {
      const { getPrisma } = await import('./config/database');
      const prisma = getPrisma();
      
      const partner = await prisma.partner.findUnique({
        where: { userId: socket.data.user.id },
      });

      if (partner) {
        await prisma.partner.update({
          where: { id: partner.id },
          data: {
            currentLocation: {
              latitude: data.latitude,
              longitude: data.longitude,
              timestamp: new Date().toISOString(),
            },
          },
        });

        // Broadcast to order room
        const orders = await prisma.order.findMany({
          where: {
            partnerId: partner.id,
            status: { in: ['assigned', 'picked_up', 'in_transit'] },
          },
          select: { id: true },
        });

        orders.forEach((order) => {
          io.to(`order:${order.id}`).emit('location:updated', {
            orderId: order.id,
            partnerId: partner.id,
            location: data,
          });
        });
      }
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.data.user.id}`);
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize database connections
    await initializePrisma();
    await initializeMongo();
    await initializeRedis();

    // Start listening
    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.node}`);
      logger.info(`API: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await closeConnections();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

export { app, io };
