# Stage 1: Build Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Nhận API base URL vào lúc build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:alpine AS runner

# Xóa default html nếu có
RUN rm -rf /usr/share/nginx/html/*

# Copy build output sang thư mục nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
