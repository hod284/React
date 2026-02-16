# ---------- 1단계: React build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 의존성 먼저 복사 (캐시 최적화)
COPY package*.json ./
RUN npm ci

# 소스 복사
COPY . .

# Vite build (dist 생성)
RUN npm run build


# ---------- 2단계: nginx ----------
FROM nginx:alpine

# nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]