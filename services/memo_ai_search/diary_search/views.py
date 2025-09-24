from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Diary
from .serializers import DiarySerializer

import weaviate
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Weaviate as LangchainWeaviate
from langchain_community.chat_models import ChatOpenAI

import os

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

client = weaviate.Client("http://127.0.0.1:8090")

schema = client.schema.get()
if not any(c["class"] == "Diary" for c in schema["classes"]):
    class_obj = {
        "class": "Diary",
        "vectorizer": "none",
        "properties": [
            {"name": "title", "dataType": ["text"]},
            {"name": "content", "dataType": ["text"]},
            {"name": "date", "dataType": ["date"]},
        ]
    }
    client.schema.create_class(class_obj)

embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

vector_db = LangchainWeaviate(client, "Diary", "content", attributes=["title", "date"])

class AddDiaryView(APIView):
    def post(self, request):
        serializer = DiarySerializer(data=request.data)
        if serializer.is_valid():
            diary = serializer.save()
            vector_db.add_texts(
                [diary.content],
                metadatas=[{"title": diary.title, "date": str(diary.date)}],
            )
            return Response({"message": "Diary added successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SearchDiaryView(APIView):
    def post(self, request):
        query = request.data.get("query")
        if not query:
            return Response({"error": "Query is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Manually embed the query using OpenAIEmbeddings
        query_embedding = embeddings.embed_query(query)
        # Use similarity_search_by_vector to perform a nearVector search
        docs = vector_db.similarity_search_by_vector(query_embedding, k=5)

        combined_text = "\n\n".join([f"{d.metadata['date']} - {d.metadata['title']}: {d.page_content}" for d in docs])

        chat = ChatOpenAI(openai_api_key=OPENAI_API_KEY, temperature=0)
        summary_prompt = f"以下是用户日记内容:\n{combined_text}\n\n请帮我总结这些日记，并回答用户的问题: {query}"
        summary = chat.call_as_llm(summary_prompt)

        return Response({
            "query": query,
            "summary": summary,
            "related_diaries": [
                {"title": d.metadata['title'], "date": d.metadata['date'], "content": d.page_content}
                for d in docs
            ]
        })