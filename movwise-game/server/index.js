/**
 * Main Server Entry Point
 * Socket.IOサーバーの初期化と各種ハンドラーの統合
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSpectatorSocket } from './socket/spectatorSocket.js';
import subscriptionRoutes from './routes/subscription.js';
import logger from './utils/logger.js';

// 環境変数読み込み - 環境に応じて設定ファイルを選択
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

const app = express();
const server = createServer(app);

// CORS設定 - 環境に応じて許可するオリジンを設定
const developmentOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080"
];

const productionOrigins = [
  process.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://your-production-domain.com',
  'https://your-production-domain.com',
  'https://www.your-production-domain.com'
];

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? productionOrigins
  : developmentOrigins;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// セキュリティヘッダー設定
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// リクエストログ（全環境で使用）
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.api(req.method, req.url, res.statusCode, duration);
  });
  next();
});

// Subscription API routes
app.use('/api/subscription', subscriptionRoutes);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Spectator mode socket handlerをセットアップ
setupSpectatorSocket(io);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// サーバー起動
const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  logger.start('MovWISE Game サーバー起動完了');
  logger.info(`📡 Server running on port ${PORT}`);
  logger.info(`🌐 WebSocket URL: ws://localhost:${PORT}`);
  logger.info(`🔗 API URL: http://localhost:${PORT}`);
  logger.info(`💳 Subscription API: http://localhost:${PORT}/api/subscription`);
  logger.info('👁️ Spectator mode enabled');
  logger.info('💰 Payment system enabled');
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Log Level: ${process.env.LOG_LEVEL || 'info'}`);
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  logger.handleError(error, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.handleError(error, 'Unhandled Rejection');
});

export { app, server, io };