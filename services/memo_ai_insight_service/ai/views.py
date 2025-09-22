from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET', 'POST'])
def ai_search(request):
    query = request.data.get('query', '') if request.method == 'POST' else request.GET.get('query', '')
    # 这里可以调用你的 AI 搜索逻辑
    result = {"query": query, "result": f"Mock result for '{query}'"}
    return Response(result)
