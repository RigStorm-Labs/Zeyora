import { PrismaClient } from '@prisma/client';
import { MongoClient, Db } from 'mongodb';
import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

let prisma: PrismaClient;
let mongoClient: MongoClient;
let mongoDb: Db;
let redis: Redis;

export const initializePrisma = async (): Promise<PrismaClient> => {
  prisma = new PrismaClient({
    log: config.node === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected successfully');
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error);
    throw error;
  }

  return prisma;
};

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Prisma not initialized. Call initializePrisma() first.');
  }
  return prisma;
};

export const initializeMongo = async (): Promise<Db> => {
  try {
    mongoClient = new MongoClient(config.mongodb.uri);
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    logger.info('MongoDB connected successfully');
    return mongoDb;
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
};

export const getMongo = (): Db => {
  if (!mongoDb) {
    throw new Error('MongoDB not initialized. Call initializeMongo() first.');
  }
  return mongoDb;
};

export const initializeRedis = async (): Promise<Redis> => {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.error('Redis connection failed after 3 retries');
        return null;
      }
      return Math.min(times * 100, 3000);
    },
  });

  redis.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  return redis;
};

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error('Redis not initialized. Call initializeRedis() first.');
  }
  return redis;
};

export const closeConnections = async (): Promise<void> => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('PostgreSQL disconnected');
    }
    if (mongoClient) {
      await mongoClient.close();
      logger.info('MongoDB disconnected');
    }
    if (redis) {
      await redis.quit();
      logger.info('Redis disconnected');
    }
  } catch (error) {
    logger.error('Error closing connections:', error);
  }
};
