# BIDEO AI 모델 카드

## 목적

BIDEO는 작품 등록·탐색·경매 과정에서 사용자의 판단을 보조하기 위해 조회수 예측, 인기 분류, 유사도 추천, 이미지 생성, 경매 RAG 분석을 제공합니다. AI 결과는 참고 정보이며 작품 가치나 투자 수익을 보장하지 않습니다.

## 저장 모델

| 모델 | 구현 | 주요 설정 | 입력 |
|---|---|---|---|
| 조회수 예측 | `RandomForestRegressor` | 300 trees, `random_state=42` | 25개 반응·품질·업로드 피처 |
| 인기 분류 | `RandomForestClassifier` | 300 trees, threshold `0.5`, `random_state=42` | 19개 작품·경매·반응 피처 |

모델과 피처 목록, LabelEncoder, 분류 임계값은 `fastapi/basic/models/*.pkl`로 버전 관리하며 Git LFS로 저장합니다.

## 서비스 연동

1. Spring Boot가 작품 입력과 활동 데이터를 정규화합니다.
2. FastAPI `/api/work/regression` 또는 `/api/work/classification`에 요청합니다.
3. FastAPI가 저장된 피처 순서대로 입력 배열을 구성합니다.
4. 모델 결과를 작품 데이터에 저장하고 화면에 참고값으로 표시합니다.

추천 기능은 작품에 TF-IDF·cosine similarity를 사용하고, 갤러리 유사도는 제목·설명·태그·작품 토큰의 cosine score를 사용합니다. 경매 분석은 RAGAnything·LightRAG와 LLM을 결합합니다.

## 검증 상태

- 모델 타입, 피처 개수, 임계값과 API 입력 검증은 저장소에서 재현 가능합니다.
- FastAPI 갤러리 유사도 정렬·자기 자신 제외·결과 제한 테스트를 CI에서 수행합니다.
- 학습 원본 데이터셋과 고정 평가셋은 저장소에 포함되어 있지 않아 MAE, RMSE, R², Precision, Recall, F1을 현재 상태에서 재계산할 수 없습니다.
- 따라서 README에는 확인되지 않은 정확도나 수익률을 표시하지 않습니다.

## 한계와 개선 계획

- 반응 수치가 적은 신규 작품은 예측 오차가 커질 수 있습니다.
- 운영 데이터 변화에 따른 모델 성능 저하를 감시하는 기준이 필요합니다.
- 학습 데이터 버전, 평가 지표, 모델 SHA를 함께 기록하는 모델 레지스트리가 필요합니다.
- 경매 RAG 결과는 생성형 AI 추정이므로 실제 낙찰가 또는 수익을 보장하지 않습니다.
