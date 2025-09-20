# 第一阶段：构建阶段
FROM node:21.5.0 as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# 第二阶段：运行阶段
FROM node:21.5.0
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
