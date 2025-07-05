/**
 * Main Server Entry Point
 * Socket.IOサーバーの初期化と各種ハンドラーの統合
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSpectatorSocket } from './socket/spectatorSocket.js';

const app = express();
const server = createServer(app);

// CORS設定
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

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
  console.log('');
  console.log('🚀 ======================================');
  console.log('🚀 MovWISE Game サーバー起動完了');
  console.log('🚀 ======================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log('👁️ Spectator mode enabled');
  console.log('🚀 ======================================');
  console.log('');
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});

export { app, server, io };