# 使用官方 Node.js 映像作為基礎
FROM node:20-bullseye-slim

# 設定工作目錄
WORKDIR /app

# 安裝 canvas 所需的系統依賴
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# 複製 package.json 和 package-lock.json（或 yarn.lock）
COPY package*.json ./

# 安裝依賴
RUN npm install --production

# 複製應用程式代碼
COPY . .

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]
