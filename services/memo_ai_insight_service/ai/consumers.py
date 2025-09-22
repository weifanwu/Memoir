import json
from kafka import KafkaConsumer, KafkaProducer
import os
import threading
from .ai_logic import perform_ai_search  # 你自己写的 AI 分析函数

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9093")
REQUEST_TOPIC = "ai-search-requests"
RESULT_TOPIC = "ai-search-results"

# Kafka producer & consumer
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

consumer = KafkaConsumer(
    REQUEST_TOPIC,
    bootstrap_servers=[KAFKA_BROKER],
    group_id="ai-search-django",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="earliest"
)

def start_consumer():
    print("Django Kafka consumer started...")
    for message in consumer:
        data = message.value
        diaryid = data.get("diaryid")
        query = data.get("query")
        username = data.get("username")
        
        print(f"Received request: {data}")

        # 调用 AI 分析函数
        result = perform_ai_search(query)  # 返回字典，例如 {"risk": "low", "indicators": [...]}

        # 发送结果到 Kafka topic
        producer.send(
            RESULT_TOPIC,
            key=diaryid.encode("utf-8"),
            value={"diaryid": diaryid, "username": username, "result": result}
        )
        producer.flush()
        print(f"Sent result for diaryid={diaryid} to Kafka")
        
# 启动 consumer 在后台线程
threading.Thread(target=start_consumer, daemon=True).start()