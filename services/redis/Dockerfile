# 基础镜像
FROM redis:7.2-alpine

# 设置工作目录（可选）
WORKDIR /data

# 拷贝自定义配置文件（如果有）
# COPY redis.conf /usr/local/etc/redis/redis.conf

# 暴露端口
EXPOSE 6379

# 启动 Redis
# 如果有自定义配置，用 CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
CMD ["redis-server"]