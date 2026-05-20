import time
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Redis
import json

embeddings = HuggingFaceEmbeddings(
    model_name="jhgan/ko-sbert-nli",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)

REDIS_URL = "redis://localhost:6380"
INDEX_NAME = "semantic_cache_index"

index_schema = {
    "text": [{"name": "question"}],
    "tag": [{"name": "answer"}]
}
async def ask_question_semantic_stream(llm, message):
    score_threshold = 0.4

    try:
        vector_db = Redis.from_existing_index(
            embeddings,
            index_name=INDEX_NAME,
            redis_url=REDIS_URL,
            schema=index_schema
        )

        results = vector_db.similarity_search_with_score(message, k=1)
        print(results)
    except Exception as e:
        print(f"Redis 연결 실패 혹은 인덱스 없음: {e}")
        results = []

    if results and results[0][1] <= score_threshold:
        doc, score = results[0]
        print(f"캐시 히트: {score:.4f}")

        cached_content = doc.metadata["answer"]
        for char in cached_content:
            time.sleep(0.005)
            content = char.replace("\n", "[BR]")
            payload = json.dumps({"text": content}, ensure_ascii=False)
            yield f"data: {payload}\n\n"
        return

    print(f"API 호출")
    full_content = ""
    for chunk in llm.stream(message):
        if chunk.content:
            full_content += chunk.content
            display_text = chunk.content.replace("\n", "[BR]")
            yield f"data: {json.dumps({'text': display_text}, ensure_ascii=False)}\n\n"

    if full_content:
        Redis.from_texts(
            texts=[message],
            embedding=embeddings,
            metadatas=[{"question": message, "answer": full_content}],
            index_name=INDEX_NAME,
            redis_url=REDIS_URL,
        )