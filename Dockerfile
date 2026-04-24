# Stage 1: Build
FROM node:16-alpine AS build
WORKDIR /app

# BƯỚC QUAN TRỌNG: Cài đặt build tools cho Alpine
#RUN apk add --no-cache python3 make g++


COPY package*.json ./
# Dùng npm ci thay vì npm install để đảm bảo tính ổn định (Senior Tip)
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Run với Nginx
FROM nginx:alpine
# Lưu ý: 'angular-ecommerce' lấy từ outputPath trong angular.json
COPY --from=build /app/dist/angular-ecommerce /usr/share/nginx/html

# Copy file cấu hình Nginx (sẽ tạo ở bước 3)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy chứng chỉ SSL có sẵn của Hoa vào Nginx
COPY ssl-localhost/localhost.crt /etc/nginx/ssl/localhost.crt
COPY ssl-localhost/localhost.key /etc/nginx/ssl/localhost.key

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]