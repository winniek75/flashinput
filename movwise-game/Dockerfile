# MovWISE Game - Production Dockerfile
# Node.js 20のアルペイン版を使用

FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージマネージャーファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production && npm cache clean --force

# アプリケーションコードをコピー
COPY . .

# ビルド実行
RUN npm run build:prod

# ログディレクトリ作成
RUN mkdir -p logs uploads

# 非ルートユーザーを作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S movwise -u 1001

# ファイルの所有権を変更
RUN chown -R movwise:nodejs /app

# 非ルートユーザーに切り替え
USER movwise

# ポート3002を公開
EXPOSE 3002

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# アプリケーションを起動
CMD ["npm", "start"]