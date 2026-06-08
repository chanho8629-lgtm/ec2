# BIDEO

<div align="center">
  <img src="docs/images/logo.png" width="220" alt="BIDEO Logo" />

  <h3>AI 기반 디지털 아트 전시·거래 플랫폼</h3>

  <p>
    <b>BIDEO</b>는 영상·이미지 작품을 등록하고, 갤러리로 전시하며,<br>
    경매·결제·정산까지 연결하는 창작자 중심 디지털 아트 플랫폼입니다.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Spring%20Boot-3.5.10-6DB33F?logo=springboot&logoColor=white" />
    <img src="https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white" />
    <img src="https://img.shields.io/badge/FastAPI-AI%20Server-009688?logo=fastapi&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/AWS-EC2%20%7C%20S3-FF9900?logo=amazonaws&logoColor=white" />
  </p>

  <img src="docs/images/bideo-main-page.png" width="100%" alt="BIDEO 메인 페이지" />
</div>

---

## 목차

- [기획 의도](#-기획-의도)
- [기대 효과](#-기대-효과)
- [주요 기능](#-주요-기능)
- [기능 구현 상세](#-기능-구현-상세)
- [프로젝트 사용 기술](#️-프로젝트-사용-기술)
- [화면 및 자료](#️-화면-및-자료)
- [데이터 분석 / AI 근거 자료](#-데이터-분석--ai-근거-자료)
- [ERD / 데이터 모델](#️-erd--데이터-모델)
- [배포 구조](#-배포-구조)
- [실행 방법](#️-실행-방법)
- [담당 업무](#-담당-업무)
- [트러블슈팅](#-트러블슈팅)
- [QA 테스트](#-qa-테스트)

---

## 🎯 기획 의도

<div align="center">
  <img src="docs/images/bideo-creator-problem-summary.png" width="49%" alt="BIDEO 창작자 문제 분석" />
  <img src="docs/images/bideo-market-growth.png" width="49%" alt="BIDEO 시장 성장 분석" />
</div>

디지털 창작자는 작품을 공개하고 수익화할 수 있는 채널이 필요하지만, 일반적인 SNS는 전시·거래·정산 흐름이 분리되어 있습니다.<br>
BIDEO는 창작자가 작품을 올리고, 사용자는 작품을 탐색·소장·입찰할 수 있도록 **콘텐츠 플랫폼과 커머스 기능을 하나로 연결**하는 것을 목표로 기획되었습니다.

### 주요 기획 배경

1. **창작자 수익화 채널 부족**
   - 영상·이미지 작품은 노출은 가능하지만 실제 판매, 경매, 정산까지 이어지는 구조가 부족합니다.

2. **작품 탐색 품질 개선 필요**
   - 사용자가 원하는 작품을 찾기 위해 태그, 검색, 추천, 유사도 분석이 함께 동작해야 했습니다.

3. **AI 기반 운영 자동화 필요**
   - 작품 품질 점수, 예상 조회수, 인기 가능성, 경매 분석처럼 운영자가 수동으로 판단하기 어려운 영역을 AI로 보조했습니다.

4. **안전한 거래와 관리자 기능 필요**
   - 신고, 제재, 결제 검증, 출금 요청, 관리자 페이지를 통해 플랫폼 운영 안정성을 확보했습니다.

---

## ✨ 기대 효과

<div align="center">
  <img src="docs/images/bideo-intro-main.png" width="100%" alt="BIDEO 소개 메인 페이지" />
</div>

1. **🎨 창작자 성장 지원**
   - 작품 등록, 갤러리 구성, 콘테스트 참여, 경매 판매를 통해 창작자가 포트폴리오와 수익화를 함께 관리할 수 있습니다.

2. **📈 AI 기반 작품 분석**
   - 조회수 예측, 인기 분류, 유사 작품 추천, 경매 RAG 분석으로 작품 운영과 거래 판단을 보조합니다.

3. **💳 거래 신뢰성 확보**
   - Bootpay 결제, 주문 관리, 정산·출금 요청, 관리자 검수 흐름을 통해 거래 이후까지 관리합니다.

4. **🛡️ 운영 리스크 감소**
   - 신고, 숨김, 차단, 회원 제재, 관리자 대시보드로 서비스 운영 중 발생할 수 있는 문제를 추적합니다.

---

## 🧩 주요 기능

| 구분 | 기능 |
|---|---|
| **회원/인증** | 일반 회원가입/로그인, OAuth2 로그인, JWT 인증, Redis Refresh Token 검증, 이메일/휴대폰 인증, 비밀번호 재설정, 관리자 로그인 |
| **프로필/소셜** | 프로필/배너 이미지 S3 업로드, 닉네임 수정, 팔로우/팔로워/팔로잉, 차단/차단 해제, 뱃지 조회 |
| **작품** | 작품 등록, 수정, 삭제, 상세 조회, 피드 조회, 파일 업로드, S3 URL 변환, 태그, 조회수, 좋아요, 댓글, 북마크, 다운로드 |
| **갤러리** | 갤러리 생성, 수정, 삭제, 목록/상세 조회, 커버 이미지 업로드, 작품 연결, 태그, 좋아요, 댓글, 유사 갤러리/작품 추천 |
| **콘테스트** | 콘테스트 목록, 상세, 등록/수정, 작품 출품, 수상작 선정, 내 공모전/내 출품작 조회, 공유 |
| **검색/탐색** | 통합 검색, 최근 검색어 저장, 인기 검색어, 추천 검색어, 작품/갤러리/태그 기반 탐색 |
| **경매** | 작품 경매 등록, 경매 조회, 입찰, 최고가 갱신, 관심 경매, 경매 마감 스케줄러, 낙찰자 주문/결제 생성, AI 경매 분석 |
| **결제/주문/정산** | Bootpay 결제 요청, 서버 영수증 검증, 주문 조회, 구매/판매 내역, 카드 등록, 정산, 출금 요청 |
| **메시지/알림** | WebSocket/STOMP 채팅, RabbitMQ 메시지 중계, 채팅방, 메시지 전송, 읽지 않은 메시지 수, 메시지 좋아요, 알림 목록/설정 |
| **신고/운영** | 신고 접수, 숨김/차단, 회원 제재, 문의/FAQ, 관리자 검수 |
| **관리자** | 회원, 작품, 경매, 결제, 신고, 제재, 문의, 출금 관리, 관리자 대시보드 |
| **AI/분석** | 이미지 생성/분석, 조회수 회귀 예측, 인기 분류, 유사도 추천, 갤러리 추천, 경매 RAG 분석 |

---

## 🔎 기능 구현 상세

### 사용자/인증

| 기능 | 구현 내용 | 주요 파일 |
|---|---|---|
| 회원가입/로그인 | 이메일 기반 가입, 로그인, 로그아웃, JWT 발급/검증 | `AuthController`, `AuthService`, `JwtTokenProvider` |
| OAuth2 로그인 | Google, Kakao, Naver OAuth2 사용자 정보 매핑 및 회원 upsert | `CustomOAuth2UserService`, `OAuth2SuccessHandler`, `OAuth2Attribute` |
| 인증 유지 | Refresh Token을 Redis에 저장하고 쿠키 토큰과 비교 | `JwtTokenProvider`, `RedisConfig` |
| 이메일/휴대폰 인증 | 인증번호 발송, 확인, 비밀번호 재설정 | `VerificationService`, `MailService`, `SmsService` |
| 관리자 로그인 | 일반 사용자 로그인과 분리된 관리자 로그인 모달 및 권한 진입 | `admin-auth-modal.js`, `AdminPageController` |

### 작품/갤러리

| 기능 | 구현 내용 | 주요 파일 |
|---|---|---|
| 작품 CRUD | 작품 등록/수정/삭제/상세/피드 API, 파일/태그/갤러리 연결 저장 | `WorkAPIController`, `WorkService`, `WorkMapper.xml` |
| 작품 파일 업로드 | 이미지/영상 파일을 AWS S3에 저장하고 DB에는 object key 저장 | `S3FileService`, `WorkFileVO` |
| 작품 URL 변환 | 상세/피드 응답 시 S3 key를 presigned URL로 변환 | `WorkService.applyFileUrls` |
| 작품 반응 | 조회수 증가, 좋아요, 댓글, 북마크, 다운로드 | `CommentService`, `BookmarkService`, `DownloadsController` |
| 갤러리 CRUD | 갤러리 생성/수정/삭제/상세/목록, 커버 이미지, 작품 연결, 태그 저장 | `GalleryAPIController`, `GalleryService`, `GalleryMapper.xml` |
| 갤러리 추천 | 갤러리와 작품 텍스트/태그 기반 유사 작품 추천 | `GalleryService`, `WorkService`, `FastAPI gallery/work router` |

### 경매/결제/정산

| 기능 | 구현 내용 | 주요 파일 |
|---|---|---|
| 경매 등록/조회 | 작품 기반 경매 생성, 시작가/현재가/상태/마감 시간 관리 | `AuctionCommandService`, `AuctionQueryService` |
| 입찰 | 입찰 유효성 검증, 최고가 갱신, 이전 winning bid 해제, 새 winning bid 저장 | `BidCommandService`, `BidQueryService` |
| 경매 마감 | 스케줄러가 만료 경매를 닫고 낙찰 주문/결제 대기 데이터 생성 | `AuctionClosureService` |
| AI 경매 분석 | 경매/작품 정보를 FastAPI RAG 분석으로 전달하고 요약 리포트 반환 | `AuctionRagService`, `auction_rag_service.py` |
| Bootpay 결제 | 클라이언트 결제 성공 후 서버에서 receiptId 조회 및 금액/주문/구매자 검증 | `PaymentService`, `BootpayClient`, `pay.js` |
| 주문/정산/출금 | 주문 조회, 판매 내역, 정산 상태, 출금 요청과 관리자 승인 조회 | `OrderService`, `PaymentService`, `AdminWithdrawalService` |

### 커뮤니케이션/운영

| 기능 | 구현 내용 | 주요 파일 |
|---|---|---|
| 실시간 채팅 | WebSocket/STOMP 연결, RabbitMQ fanout 중계, 채팅방/메시지 저장 | `WebSocketConfig`, `RabbitConfig`, `MessageService`, `ChatRelayListener` |
| 알림 | 알림 목록, 읽지 않은 알림, 알림 설정 관리 | `NotificationAPIController`, `NotificationService`, `NotificationSettingService` |
| 신고/제재 | 신고 접수, 관리자 신고 조회, 회원 제재 생성/수정/만료 복구 | `ReportAPIController`, `AdminReportService`, `AdminRestrictionService` |
| 관리자 | 회원/작품/경매/결제/신고/제재/문의/출금 관리 화면과 API | `controller/admin`, `service/admin`, `templates/admin` |

### AI/데이터

| 기능 | 구현 내용 | 주요 파일 |
|---|---|---|
| 작품 조회수 예측 | 작품 등록 입력값을 회귀 모델에 전달해 예상 조회수 산출 | `WorkAPIController`, `work_service.py`, `bideo_regressor.pkl` |
| 인기 분류 | 작품 피처 기반 인기 가능성/분류 결과 산출 | `work_service.py`, `bideo_classifier.pkl` |
| 이미지 생성/분석 | FastAPI 이미지 파이프라인 호출, 결과 이미지를 S3에 업로드 | `WorkAPIController`, `ai_service.py` |
| 유사도 추천 | TF-IDF와 cosine similarity 기반 작품/갤러리 추천 | `work_recommend_service.py`, `gallery_service.py` |
| 경매 RAG | 작품 이미지/경매 데이터 기반 입찰 리스크와 낙찰 가능성 분석 | `AuctionRagService`, `auction_rag_service.py` |

---

## 🛠️ 프로젝트 사용 기술

| 구분 | 기술/도구 |
|---|---|
| **Backend** | Java 17, Spring Boot 3.5.10, Spring Security, JWT, MyBatis |
| **Frontend** | Thymeleaf, HTML, CSS, JavaScript |
| **AI Server** | FastAPI, Python 3.11, scikit-learn, pandas, numpy, TF-IDF, cosine similarity |
| **RAG/LLM** | OpenAI API, RAGAnything, LightRAG |
| **Database** | PostgreSQL, Redis |
| **Message** | RabbitMQ, WebSocket |
| **Storage** | AWS S3 |
| **Infra** | AWS EC2, Docker, GitHub Actions |
| **Payment** | Bootpay |
| **API/Library** | Swagger UI, OAuth2 Client, Solapi, Gmail SMTP, Lombok |
| **Test** | JUnit5, Spring Boot Test, MyBatis Test, Spring Security Test |

---

## 🖼️ 화면 및 자료

### 메인 페이지

<img src="docs/images/bideo-main-page.png" width="100%" alt="BIDEO 메인 페이지 캡처" />

### BIDEO 시스템 플로우차트

`C:\Users\chanh\Desktop\포토폴리오\저찬호\정찬호_BIDEO_플로우차트.pptx`의 슬라이드를 PNG로 캡처해 정리했습니다. 갤러리 CRUD, 작품 CRUD, S3 업로드, Bootpay 결제 검증, 경매 입찰/낙찰, AI 분석 흐름을 백엔드와 프론트엔드 기준으로 나누어 표현했습니다.

<div align="center">
  <img src="docs/portfolio/bideo-flowchart/bideo-flowchart-01.png" width="100%" alt="BIDEO 플로우차트 표지" />
  <img src="docs/portfolio/bideo-flowchart/bideo-flowchart-02.png" width="100%" alt="BIDEO 갤러리 생성 플로우차트" />
</div>

<details>
<summary>전체 BIDEO 플로우차트 캡처 27장 보기</summary>

<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-01.png" width="100%" alt="BIDEO flowchart slide 01" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-02.png" width="100%" alt="BIDEO flowchart slide 02" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-03.png" width="100%" alt="BIDEO flowchart slide 03" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-04.png" width="100%" alt="BIDEO flowchart slide 04" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-05.png" width="100%" alt="BIDEO flowchart slide 05" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-06.png" width="100%" alt="BIDEO flowchart slide 06" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-07.png" width="100%" alt="BIDEO flowchart slide 07" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-08.png" width="100%" alt="BIDEO flowchart slide 08" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-09.png" width="100%" alt="BIDEO flowchart slide 09" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-10.png" width="100%" alt="BIDEO flowchart slide 10" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-11.png" width="100%" alt="BIDEO flowchart slide 11" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-12.png" width="100%" alt="BIDEO flowchart slide 12" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-13.png" width="100%" alt="BIDEO flowchart slide 13" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-14.png" width="100%" alt="BIDEO flowchart slide 14" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-15.png" width="100%" alt="BIDEO flowchart slide 15" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-16.png" width="100%" alt="BIDEO flowchart slide 16" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-17.png" width="100%" alt="BIDEO flowchart slide 17" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-18.png" width="100%" alt="BIDEO flowchart slide 18" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-19.png" width="100%" alt="BIDEO flowchart slide 19" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-20.png" width="100%" alt="BIDEO flowchart slide 20" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-21.png" width="100%" alt="BIDEO flowchart slide 21" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-22.png" width="100%" alt="BIDEO flowchart slide 22" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-23.png" width="100%" alt="BIDEO flowchart slide 23" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-24.png" width="100%" alt="BIDEO flowchart slide 24" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-25.png" width="100%" alt="BIDEO flowchart slide 25" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-26.png" width="100%" alt="BIDEO flowchart slide 26" />
<img src="docs/portfolio/bideo-flowchart/bideo-flowchart-27.png" width="100%" alt="BIDEO flowchart slide 27" />

</details>

### 작품 AI 분석 / 경매 인사이트

<div align="center">
  <img src="docs/images/bideo-ai-analysis-modal.png" width="49%" alt="BIDEO AI 작품 분석 모달" />
  <img src="docs/images/bideo-auction-insight.png" width="49%" alt="BIDEO 경매 인사이트" />
</div>

### 포트폴리오 UI/UX 캡처

구현 기능을 면접/포트폴리오에서 설명하기 쉽도록 별도 `/portfolio/flowchart` 화면을 만들고, 기획 배경·백엔드 흐름·AI 활용·트러블슈팅 전후 상태를 캡처했습니다.

<div align="center">
  <img src="docs/portfolio/screenshots/00-planning-background.png" width="100%" alt="BIDEO 기획 배경 포트폴리오 캡처" />
  <img src="docs/portfolio/screenshots/01-overview.png" width="100%" alt="BIDEO 아키텍처 플로우 캡처" />
  <img src="docs/portfolio/screenshots/02-backend.png" width="100%" alt="BIDEO 백엔드 플로우 캡처" />
  <img src="docs/portfolio/screenshots/03-ai-usage.png" width="100%" alt="BIDEO AI 활용 캡처" />
</div>

<details>
<summary>트러블슈팅 실패/수정 캡처 보기</summary>

<img src="docs/portfolio/screenshots/04-troubleshooting-failure.png" width="100%" alt="BIDEO 트러블슈팅 실패 캡처" />
<img src="docs/portfolio/screenshots/05-troubleshooting-fixed.png" width="100%" alt="BIDEO 트러블슈팅 수정 완료 캡처" />

</details>

### 작품 샘플

<div align="center">
  <img src="docs/images/work_001.png" width="15%" alt="work 001" />
  <img src="docs/images/work_024.png" width="15%" alt="work 024" />
  <img src="docs/images/work_066.png" width="15%" alt="work 066" />
  <img src="docs/images/work_100.png" width="15%" alt="work 100" />
  <img src="docs/images/work_150.png" width="15%" alt="work 150" />
  <img src="docs/images/work_200.png" width="15%" alt="work 200" />
</div>

### 배지 시스템

<div align="center">
  <img src="docs/images/first_video_badge.png" width="120" alt="첫 영상 배지" />
  <img src="docs/images/first_sell_badge.png" width="120" alt="첫 판매 배지" />
  <img src="docs/images/contest_award_badge.png" width="120" alt="콘테스트 수상 배지" />
  <img src="docs/images/auction_price_of_1_million_won_badge.png" width="120" alt="경매 100만원 배지" />
</div>

---

## 📊 데이터 분석 / AI 근거 자료

본 프로젝트는 단순 CRUD가 아니라 작품 데이터를 분석하여 **예측·추천·경매 분석**에 활용합니다.

<div align="center">
  <img src="docs/images/bideo-usage-rate.png" width="49%" alt="BIDEO 사용률 분석" />
  <img src="docs/images/bideo-mobile-content-core.png" width="49%" alt="BIDEO 모바일 콘텐츠 분석" />
</div>

| 자료 | 위치 | 활용 |
|---|---|---|
| DB 전체 스키마 | `src/main/resources/sql/create_all_tables.sql` | 회원, 작품, 갤러리, 경매, 결제, 메시지, 관리자 테이블 설계 |
| AI 피처 컬럼 추가 | `src/main/resources/sql/2026-05-13_work_ai_features.sql` | 작품 예측에 필요한 피처 저장 컬럼 추가 |
| AI 피처 산출 SQL | `src/main/resources/sql/2026-05-13_fill_work_ai_features.sql` | 제목 길이, 설명 길이, 태그 수, 썸네일 여부, 반응 점수 계산 |
| 태그/더미 데이터 | `src/main/resources/sql/2026-05-15_seed_tags_500.sql`, `seed_presentation_v3.sql` | 추천·검색·시연용 데이터 구성 |
| 회귀/분류 모델 | `fastapi/basic/models/*.pkl` | 예상 조회수, 인기 가능성 예측 |
| 추천 로직 | `fastapi/basic/service/work_recommend_service.py` | TF-IDF와 cosine similarity 기반 유사 작품 추천 |
| 경매 RAG | `fastapi/basic/service/auction_rag_service.py` | 작품·경매 자료 기반 분석 리포트 생성 |

### AI 분석 피처

작품 등록 및 운영 데이터에서 다음 피처를 생성해 예측에 사용했습니다.

- `title_length`: 제목 길이
- `description_length`: 설명 길이
- `tag_count`: 태그 수
- `thumbnail_exists`: 썸네일 존재 여부
- `is_ai_generated`: AI 생성 작품 여부
- `ai_quality_score`: 품질 점수
- `watch_completion_rate`: 추정 완주율
- `engagement_score`: 좋아요·댓글·저장 기반 참여 점수
- `reaction_score`: 사용자 반응 합계
- `short_video_score`: 숏폼 가중치

### AI 예측 처리 순서

```mermaid
sequenceDiagram
    actor User as 사용자
    participant WorkAPI as Spring Boot 작품 API
    participant S3 as AWS S3
    participant DB as PostgreSQL
    participant FastAPI as FastAPI AI 서버
    participant Model as ML/RAG 모델

    User->>WorkAPI: 작품 등록 요청
    WorkAPI->>S3: 이미지/영상 파일 업로드
    S3-->>WorkAPI: 파일 URL 반환
    WorkAPI->>DB: 작품 기본 정보 저장
    WorkAPI->>WorkAPI: 제목/설명/태그/썸네일 피처 생성
    WorkAPI->>FastAPI: /api/work/regression 조회수 예측 요청
    FastAPI->>Model: 회귀 모델 실행
    Model-->>FastAPI: 예상 조회수 반환
    WorkAPI->>FastAPI: /api/work/classification 인기 분류 요청
    FastAPI->>Model: 분류 모델 실행
    Model-->>FastAPI: 인기 가능성 반환
    FastAPI-->>WorkAPI: AI 분석 결과 반환
    WorkAPI->>DB: 예측 조회수/인기 확률/품질 점수 저장
    WorkAPI-->>User: 작품 등록 완료 및 분석 결과 표시
```

### 추천 처리 순서

```mermaid
flowchart TD
    A[사용자 작품/갤러리 조회] --> B[Spring Boot 추천 요청]
    B --> C[후보 작품 데이터 조회]
    C --> D[FastAPI 추천 API 호출]
    D --> E[제목 + 설명 + 태그 텍스트 벡터화]
    E --> F[TF-IDF / Cosine Similarity 계산]
    F --> G[유사도 높은 후보 정렬]
    G --> H[이미 포함된 작품 제외]
    H --> I[추천 작품/갤러리 반환]
    I --> J[메인/상세/갤러리 화면 노출]
```

---

## 🗂️ ERD / 데이터 모델

전체 테이블은 `src/main/resources/sql/create_all_tables.sql` 기준으로 설계했습니다.

| 도메인 | 주요 테이블 |
|---|---|
| **회원** | `tbl_member`, `tbl_oauth`, `tbl_follow`, `tbl_block`, `tbl_badge`, `tbl_member_badge` |
| **작품** | `tbl_work`, `tbl_work_file`, `tbl_work_tag`, `tbl_work_view`, `tbl_work_like` |
| **갤러리** | `tbl_gallery`, `tbl_gallery_tag`, `tbl_gallery_work`, `tbl_gallery_like` |
| **콘테스트** | `tbl_contest`, `tbl_contest_tag`, `tbl_contest_entry` |
| **상호작용** | `tbl_comment`, `tbl_comment_like`, `tbl_bookmark`, `tbl_like`, `tbl_hide` |
| **경매** | `tbl_auction`, `tbl_bid`, `tbl_auction_wishlist` |
| **결제/정산** | `tbl_order`, `tbl_payment`, `tbl_settlement`, `tbl_withdrawal_request` |
| **메시지/알림** | `tbl_message_room`, `tbl_message`, `tbl_notification`, `tbl_notification_setting` |
| **관리자** | `tbl_report`, `tbl_member_restriction`, `tbl_display_control`, `tbl_inquiry`, `tbl_faq` |

```mermaid
erDiagram
    MEMBER {
        bigint id PK
        varchar email
        varchar nickname
        varchar role
        datetime created_datetime
    }

    WORK {
        bigint id PK
        bigint member_id FK
        varchar title
        text description
        bigint predicted_views
        double predicted_popular_probability
        datetime created_datetime
    }

    WORK_FILE {
        bigint id PK
        bigint work_id FK
        text file_path
        varchar file_type
        int sort_order
    }

    TAG {
        bigint id PK
        varchar name
        varchar type
    }

    WORK_TAG {
        bigint work_id FK
        bigint tag_id FK
    }

    GALLERY {
        bigint id PK
        bigint member_id FK
        varchar title
        text description
    }

    GALLERY_WORK {
        bigint gallery_id FK
        bigint work_id FK
        int sort_order
    }

    CONTEST {
        bigint id PK
        bigint member_id FK
        varchar title
        datetime start_datetime
        datetime end_datetime
    }

    CONTEST_ENTRY {
        bigint id PK
        bigint contest_id FK
        bigint work_id FK
        bigint member_id FK
    }

    AUCTION {
        bigint id PK
        bigint work_id FK
        bigint seller_id FK
        numeric start_price
        numeric current_price
        varchar status
    }

    BID {
        bigint id PK
        bigint auction_id FK
        bigint bidder_id FK
        numeric bid_price
        datetime created_datetime
    }

    ORDERS {
        bigint id PK
        bigint member_id FK
        bigint auction_id FK
        numeric total_price
        varchar status
    }

    PAYMENT {
        bigint id PK
        bigint order_id FK
        varchar receipt_id
        numeric paid_amount
        varchar status
    }

    SETTLEMENT {
        bigint id PK
        bigint seller_id FK
        bigint order_id FK
        numeric settlement_amount
        varchar status
    }

    COMMENT {
        bigint id PK
        bigint member_id FK
        bigint target_id
        varchar target_type
        text content
    }

    BOOKMARK {
        bigint id PK
        bigint member_id FK
        bigint work_id FK
    }

    MESSAGE_ROOM {
        bigint id PK
        datetime created_datetime
    }

    MESSAGE {
        bigint id PK
        bigint room_id FK
        bigint sender_id FK
        text content
    }

    REPORT {
        bigint id PK
        bigint reporter_id FK
        bigint target_id
        varchar target_type
        varchar status
    }

    MEMBER ||--o{ WORK : registers
    MEMBER ||--o{ GALLERY : owns
    MEMBER ||--o{ CONTEST : creates
    MEMBER ||--o{ BID : bids
    MEMBER ||--o{ ORDERS : orders
    MEMBER ||--o{ COMMENT : writes
    MEMBER ||--o{ BOOKMARK : saves
    MEMBER ||--o{ REPORT : reports

    WORK ||--o{ WORK_FILE : has
    WORK ||--o{ WORK_TAG : tagged
    TAG ||--o{ WORK_TAG : maps
    GALLERY ||--o{ GALLERY_WORK : contains
    WORK ||--o{ GALLERY_WORK : displayed_in
    CONTEST ||--o{ CONTEST_ENTRY : receives
    WORK ||--o{ CONTEST_ENTRY : submitted

    WORK ||--o| AUCTION : listed_as
    AUCTION ||--o{ BID : receives
    AUCTION ||--o| ORDERS : closes_to
    ORDERS ||--o| PAYMENT : paid_by
    ORDERS ||--o| SETTLEMENT : settled_by

    MESSAGE_ROOM ||--o{ MESSAGE : contains
    MEMBER ||--o{ MESSAGE : sends
```

### 경매/결제 순서

```mermaid
sequenceDiagram
    actor Seller as 판매자
    actor Buyer as 입찰자
    participant AuctionAPI as 경매 API
    participant FastAPI as AI 경매 분석
    participant DB as PostgreSQL
    participant Payment as Bootpay
    participant Admin as 관리자

    Seller->>AuctionAPI: 작품 경매 등록
    AuctionAPI->>FastAPI: 작품 기반 경매 분석 요청
    FastAPI-->>AuctionAPI: 예상 낙찰가/입찰 추천/성공 가능성
    AuctionAPI->>DB: 경매 정보와 AI 분석 결과 저장
    Buyer->>AuctionAPI: 입찰 요청
    AuctionAPI->>DB: 현재 최고가 검증
    AuctionAPI->>DB: 입찰 내역 저장 및 최고가 갱신
    AuctionAPI-->>Buyer: 입찰 결과 반환
    AuctionAPI->>DB: 경매 마감 및 낙찰자 확정
    Buyer->>Payment: 결제 요청
    Payment-->>AuctionAPI: 결제 검증 결과
    AuctionAPI->>DB: 주문/결제/정산 데이터 생성
    Admin->>DB: 결제·정산·출금 상태 확인
```

---

## 🚀 배포 구조

BIDEO는 EC2에서 Docker 컨테이너로 실행되며, 하나의 이미지 안에서 Spring Boot와 FastAPI가 함께 동작합니다.

```mermaid
flowchart TB
    A[GitHub Push] --> B[GitHub Actions]
    B --> C[Gradle Test / Build]
    C --> D[app.jar 생성]
    B --> E[FastAPI requirements 설치]
    D --> F[Docker Image Build]
    E --> F
    F --> G[EC2로 이미지 배포]
    G --> H[DB 스키마 보정 스크립트 실행]
    H --> I[bideo 컨테이너 재시작]

    subgraph EC2[bideo Docker Container]
        J[Spring Boot :10000]
        K[FastAPI Uvicorn :8000]
        L[start-bideo.sh]
        L --> J
        L --> K
        J --> K
    end

    I --> L
    J --> M[(PostgreSQL)]
    J --> N[(Redis Session/Cache)]
    J --> O[(RabbitMQ)]
    J --> P[AWS S3]
    J --> Q[Bootpay]
    J --> R[OAuth / SMTP / Solapi]
```

### 배포 핵심

- `Dockerfile`: Spring Boot JAR와 FastAPI 런타임을 하나의 이미지에 포함
- `scripts/docker/start-bideo.sh`: Uvicorn과 Spring Boot를 같이 실행
- `FASTAPI_BASE_URL`: 컨테이너 내부 기본값 `http://127.0.0.1:8000`
- `.github/workflows/deploy.yml`: GitHub Actions 기반 EC2 배포
- `scripts/deploy/ensure-db-schema.sh`: 배포 전 DB 스키마 보정

---

## ⚙️ 실행 방법

### 1. 환경 변수

`application.yml`은 민감 정보를 직접 저장하지 않고 환경 변수로 주입합니다.

```bash
EC2_HOST=
PSQL_PORT=
PSQL_DATABASE=
PSQL_USERNAME=
PSQL_PASSWORD=
REDIS_PORT=
RABBITMQ_HOST=
RABBITMQ_PORT=
RABBITMQ_USER=
RABBITMQ_PASS=
JWT_SECRET=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET_NAME=
AWS_REGION=
BOOTPAY_JS_APPLICATION_ID=
BOOTPAY_REST_CLIENT_KEY=
BOOTPAY_PRIVATE_KEY=
FASTAPI_BASE_URL=
```

### 2. Spring Boot 실행

```bash
./gradlew bootRun
```

### 3. FastAPI 실행

```bash
cd fastapi/basic
pip install -r requirements-container.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

### 4. 접속

- Spring Boot: `http://localhost:10000`
- Swagger UI: `http://localhost:10000/swagger-ui/index.html`
- FastAPI Health: `http://127.0.0.1:8000/api/health`

---

## 👨‍💻 담당 업무

| 영역 | 구현 내용 |
|---|---|
| **작품** | 작품 등록/수정/삭제/상세/피드, 파일 업로드, 태그, 갤러리 연결, 조회수, 좋아요, 댓글, 북마크, S3 presigned URL 변환 |
| **갤러리** | 갤러리 생성/수정/삭제/목록/상세, 커버 이미지 업로드, 작품 연결, 태그 저장, 좋아요/댓글, 유사 갤러리/작품 추천 |
| **AI** | FastAPI 회귀/분류 모델 연동, 작품 예측 결과 저장, 이미지 생성/분석 파이프라인, 작품/갤러리 추천, 경매 RAG 분석 |
| **경매** | 경매 등록/조회, 입찰 검증, 최고가 갱신, winning bid 관리, 경매 마감 스케줄러, 낙찰 주문/결제 대기 생성 |
| **결제/정산** | Bootpay 결제 요청, 서버 영수증 검증, 주문/결제 상태 변경, 판매 내역, 정산/출금 요청, 관리자 승인 조회 |
| **회원/프로필** | JWT 인증, OAuth2 연동 구조, 이메일/휴대폰 인증, 프로필/배너 S3 업로드, 팔로우/차단/뱃지 |
| **커뮤니케이션** | WebSocket/STOMP 채팅, RabbitMQ 메시지 중계, 채팅방/메시지 API, 알림 목록/설정 |
| **관리자** | 회원/작품/경매/결제/신고/제재/문의/출금 관리 API와 화면 연결 |
| **인프라** | EC2 Docker 배포, Spring Boot + FastAPI 통합 실행, GitHub Actions 배포, DB 스키마 보정 스크립트 |
| **문서/포트폴리오** | README 구조화, BIDEO 플로우차트 27장 캡처, 포트폴리오용 Flowchart UI/UX 화면과 트러블슈팅 캡처 구성 |

### 구현 흐름 요약

```mermaid
flowchart LR
    A[사용자 로그인/JWT] --> B[작품 등록]
    B --> C[AWS S3 파일 업로드]
    B --> D[FastAPI AI 예측/분류]
    B --> E[갤러리 연결]
    E --> F[검색/추천/피드 노출]
    B --> G[경매 등록]
    G --> H[입찰/마감/낙찰]
    H --> I[Bootpay 결제 검증]
    I --> J[주문/정산/출금]
    F --> K[댓글/좋아요/북마크/채팅/알림]
    K --> L[신고/관리자 운영]
```

---

## 🔥 트러블슈팅

### 1. Spring Boot와 FastAPI 호출 주소 문제

#### 문제 상황

Spring Boot에서 AI 예측 API를 호출할 때 로컬 개발 환경과 EC2 Docker 환경의 FastAPI 주소가 달라 호출 실패가 발생할 수 있었습니다.

#### 원인

EC2 배포에서는 Spring Boot와 FastAPI가 같은 컨테이너 안에서 실행되기 때문에 외부 도메인이 아니라 컨테이너 내부 주소로 호출해야 했습니다.

#### 해결 방안

- `FASTAPI_BASE_URL` 환경 변수를 도입했습니다.
- Docker 실행 시 기본값을 `http://127.0.0.1:8000`으로 설정했습니다.
- `scripts/docker/start-bideo.sh`에서 Uvicorn과 Spring Boot를 함께 실행하도록 구성했습니다.

---

### 2. AI 모델 입력 피처 불일치 문제

#### 문제 상황

작품 예측 모델은 학습 당시 사용한 피처 순서와 실제 API 입력 순서가 다르면 예측값이 불안정해질 수 있었습니다.

#### 원인

제목 길이, 설명 길이, 태그 수, 썸네일 여부, 품질 점수 등 여러 피처가 Java와 Python 사이에서 전달되기 때문에 필드 누락이나 순서 불일치 위험이 있었습니다.

#### 해결 방안

- `fastapi/basic/models/*features.pkl`에 학습 피처 목록을 저장했습니다.
- FastAPI `WorkService`에서 모델과 피처 목록을 함께 로드해 입력 순서를 맞췄습니다.
- `2026-05-13_work_ai_features.sql`로 DB에 예측 결과와 피처 컬럼을 명확히 분리했습니다.

---

### 3. EC2 DB 스키마 누락 문제

#### 문제 상황

로컬 개발 DB와 EC2 PostgreSQL의 스키마가 다르면 경매, 결제, 관리자 기능에서 컬럼 또는 테이블 누락 오류가 발생할 수 있었습니다.

#### 원인

프로젝트 후반에 경매, AI 피처, 관리자 컬럼이 추가되면서 기존 EC2 DB에 모든 변경사항이 반영되지 않을 가능성이 있었습니다.

#### 해결 방안

- `ensure_database_schema.sql`로 필수 스키마를 보정했습니다.
- `2026-05-20_create_missing_auction_tables.sql`로 경매 관련 누락 테이블을 보완했습니다.
- `scripts/deploy/ensure-db-schema.sh`를 통해 배포 과정에서 스키마 확인 흐름을 추가했습니다.

---

### 4. 파일 업로드와 S3 저장 안정성 문제

#### 문제 상황

작품 이미지·영상 파일과 프로필/배너 이미지가 함께 사용되면서 파일 URL 길이, 업로드 경로, 저장소 분리 문제가 발생할 수 있었습니다.

#### 원인

로컬 정적 파일과 S3 URL이 혼재되어 있고, 영상 파일은 이미지보다 크기 때문에 업로드 제한과 URL 컬럼 길이를 함께 고려해야 했습니다.

#### 해결 방안

- `S3FileService`로 파일 저장 책임을 분리했습니다.
- `spring.servlet.multipart.max-file-size=100MB`로 대용량 업로드를 허용했습니다.
- `alter_upload_columns_to_text.sql`로 업로드 URL 컬럼을 `text` 타입으로 보정했습니다.

---

## ✅ QA 테스트

| 구분 | 테스트 내용 |
|---|---|
| 회원 | 회원가입, 로그인, OAuth 로그인, JWT 인증, 로그아웃 |
| 작품 | 등록, 상세, 수정, 삭제, 파일 업로드, 좋아요, 댓글 |
| 갤러리 | 갤러리 생성, 작품 연결, 상세 조회, 유사 추천 |
| 경매 | 경매 등록, 입찰, 낙찰, 관심 경매 |
| 결제 | Bootpay 결제 요청, 결제 검증, 주문 조회 |
| AI | 조회수 예측, 인기 분류, 유사 작품 추천, 경매 분석 |
| 관리자 | 회원 조회, 신고 처리, 작품 관리, 결제/출금 관리 |
| 배포 | EC2 Docker 실행, FastAPI health check, DB 연결, S3 업로드 |

---

## 📌 총평

### 좋았던 점

- Spring Boot 기반 서비스에 FastAPI AI 서버를 결합하면서 백엔드와 데이터 분석 흐름을 함께 경험할 수 있었습니다.
- 단순 게시판 구조가 아니라 작품, 갤러리, 콘테스트, 경매, 결제, 정산, 관리자까지 이어지는 서비스 흐름을 설계했습니다.
- AWS EC2, S3, Docker, GitHub Actions를 사용해 실제 배포 환경에 가까운 구조를 구성했습니다.

### 아쉬웠던 점

- 프로젝트 초반에는 5명으로 시작했지만 진행 과정에서 최종적으로 2명이 핵심 기능을 맡아 완성해야 했습니다. 인원이 줄어들면서 기획, 개발, 테스트, 배포를 병행해야 했고, 기능 우선순위와 역할 분담을 더 빠르게 재정리할 필요가 있었습니다.
- 팀 구성 변화가 생긴 뒤 소통 방식도 함께 흔들렸습니다. 작업 현황, API 변경사항, DB 컬럼 추가, 배포 이슈를 즉시 공유하지 못하면 같은 문제를 반복해서 확인하게 되었고, 짧은 회의와 기록 중심의 공유가 중요하다는 점을 느꼈습니다.
- AI 모델과 DB 피처가 함께 변경되기 때문에 초기에 피처 버전 관리 기준을 더 명확히 잡았으면 유지보수가 쉬웠을 것 같습니다.
- 경매와 결제는 예외 상황이 많아 테스트 케이스를 더 세분화할 필요가 있었습니다.
- 관리자 기능은 운영 흐름과 직접 연결되므로 화면 단위 QA 기록을 더 체계적으로 남기는 것이 필요했습니다.

### 배운 점

- AI 모델은 예측 정확도뿐 아니라 서비스 DB 구조, API 입력값, 배포 환경까지 함께 맞아야 안정적으로 운영된다는 점을 배웠습니다.
- 팀원이 줄어든 상황에서는 기능을 많이 만드는 것보다 반드시 완성해야 하는 핵심 흐름을 먼저 정하고, 변경사항을 문서와 커밋 단위로 남기는 것이 협업 비용을 줄인다는 점을 배웠습니다.
- 결제·정산·신고·제재처럼 운영 리스크가 있는 기능은 개발 초기부터 예외 흐름을 구체적으로 설계해야 한다는 점을 체감했습니다.
- EC2 배포에서는 애플리케이션 실행뿐 아니라 DB 스키마, 환경 변수, 내부 API 주소, 파일 저장소까지 함께 검증해야 한다는 점을 확인했습니다.

---

**작성자:** 정찬호 &nbsp;&nbsp;&nbsp;&nbsp; **TEAM:** BIDEO<br>
**기간:** 2026.04 ~ 2026.05
