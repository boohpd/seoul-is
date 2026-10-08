# seoul.is — Full Technical Specification v1.0

> 서울/한국 트렌드 자동 큐레이션 플랫폼 통합 기술 명세서
> 작성일: 2026-04-14 | 버전: 1.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Journey](#2-user-journey)
3. [Feature List](#3-feature-list)
4. [Data Structure](#4-data-structure)
5. [Technical Architecture](#5-technical-architecture)
6. [Content Pipeline](#6-content-pipeline)
7. [Internationalization (i18n)](#7-internationalization-i18n)
8. [Revenue Model](#8-revenue-model)
9. [SEO Strategy](#9-seo-strategy)
10. [Deployment & Infrastructure](#10-deployment--infrastructure)
11. [Current Implementation Status](#11-current-implementation-status)
12. [Roadmap](#12-roadmap)

---

## 1. Executive Summary

### 비전
**seoul.is**는 글로벌 외국인을 위한 서울/한국 트렌드 자동 큐레이션 플랫폼이다. K-POP, K-DRAMA, 맛집, 핫플레이스, 라이프스타일, 부동산 등 한국 관련 콘텐츠를 50개 이상의 프리미엄 소스에서 자동 수집하여 매일 업데이트한다.

### 핵심 가치
- **자동화**: 크론 기반 데이터 파이프라인으로 매일 콘텐츠 자동 수집·큐레이션
- **다국어**: IP 기반 자동 언어 감지 (영어 기본, 8개 언어 지원)
- **모바일 퍼스트**: K-POP 관심 글로벌 유저 (동남아, 일본, 중화권) 타겟
- **수익 다각화**: AdSense + 직접 광고 + 여행 제휴 + 쿠폰 플랫폼

### 타겟 유저
| 세그먼트 | 설명 | 비중 |
|---------|------|------|
| K-Culture 팬 | K-POP, K-DRAMA 팔로워 (동남아, 일본, 중화권) | 50% |
| 여행자 | 서울 방문 계획/진행 중인 외국인 | 25% |
| 거주 외국인 | 한국 거주 외국인 (맛집, 라이프스타일, 부동산) | 15% |
| 비즈니스 | 한국 시장 리서치 목적 | 10% |

### 도메인 & 계정
- **도메인**: `seoul.is` (아이슬란드 .is TLD)
- **DNS**: Cloudflare
- **Gmail**: seoulis.info@gmail.com
- **Instagram**: @seoulis_media
- **Telegram**: @SeoulPrimeClub_Chat
- **Google AdSense**: 연동 대기

---

## 2. User Journey

### 2.1 일반 유저 (콘텐츠 소비)

```
┌─────────────────────────────────────────────────────────────────┐
│ ACQUISITION (유입)                                               │
│                                                                  │
│  Google 검색 ──┐                                                 │
│  SNS 공유 ─────┼──→ [seoul.is 메인 페이지]                        │
│  직접 방문 ────┘      │                                          │
│                       ├─ IP 기반 언어 자동 감지                    │
│                       └─ 모바일 퍼스트 다크 UI 렌더링              │
├─────────────────────────────────────────────────────────────────┤
│ ENGAGEMENT (참여)                                                │
│                                                                  │
│  [메인 페이지]                                                    │
│    ├─ Hero 섹션 (오늘의 톱 기사)                                   │
│    ├─ Trending Strip (인기 토픽 필터)                              │
│    ├─ 카테고리별 매거진 그리드 (K-POP → K-DRAMA → ... )           │
│    │   ├─ 대형 카드 1개 + 소형 카드 2개 (데스크탑)                 │
│    │   └─ 수평 스크롤 카드 (모바일)                                │
│    └─ 광고 슬롯 (카테고리 2개마다 삽입)                            │
│                                                                  │
│  [카테고리 페이지] /category/{id}                                 │
│    └─ 해당 카테고리 전체 기사 그리드                                │
│                                                                  │
│  [아티클 페이지] /article/{slug}                                  │
│    ├─ 히어로 이미지                                               │
│    ├─ AI 생성 요약                                                │
│    ├─ "원문 읽기" CTA 버튼 (외부 링크)                             │
│    ├─ 광고 슬롯 (상단, 중간, 하단)                                 │
│    ├─ 소셜 공유 (X, Telegram, Facebook)                           │
│    └─ 관련 기사 6개                                               │
├─────────────────────────────────────────────────────────────────┤
│ MONETIZATION (수익화)                                             │
│                                                                  │
│  ┌─ AdSense 자동 광고 (페이지뷰 기반)                              │
│  ├─ 여행 CTA 섹션 → Booking/Klook/Agoda 어필리에이트 클릭          │
│  ├─ 협찬 기사 (Featured/Sponsored 태그) → 직접 광고 수익            │
│  └─ 쿠폰 다운로드 → QR 사용 → 가맹점 과금                         │
├─────────────────────────────────────────────────────────────────┤
│ RETENTION (재방문)                                                │
│                                                                  │
│  ├─ Telegram 채널 가입 → 실시간 알림                               │
│  ├─ 매일 갱신되는 콘텐츠 → 습관적 방문                              │
│  └─ SNS 공유 → 바이럴 루프                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 가맹점 (쿠폰 시스템)

```
가맹점 등록 신청
  → 관리자 승인
    → 가맹점 대시보드 접근
      → 쿠폰 생성 (할인율, 유효기간, 수량)
        → seoul.is에 쿠폰 노출
          → 유저 다운로드 (QR 생성)
            → 현장 방문 → QR 스캔 사용
              → 가맹점 대시보드에서 사용 현황/유입 트래픽 확인
                → (트래픽 확보 후) 유료 전환
```

### 2.3 광고주 (협찬 콘텐츠)

```
광고주 문의 (/advertise 페이지)
  → 견적/계약
    → 관리자 패널에서 협찬 게시물 작성
      → 카테고리 상단 우선 노출 + "Sponsored" 태그
        → 노출 기간 스케줄링 (시작일~종료일)
          → 성과 리포트 자동 생성 (조회수/클릭수)
            → 광고주에게 리포트 전달
```

---

## 3. Feature List

### 3.1 Core Features (MVP)

| # | 기능 | 설명 | 우선순위 | 상태 |
|---|------|------|----------|------|
| F01 | **자동 콘텐츠 수집** | Google News RSS + 웹 크롤링으로 카테고리별 기사 자동 수집 | P0 | ✅ 구현됨 |
| F02 | **AI 기사 요약** | gsk search를 활용한 기사 enrichment (요약 생성) | P0 | ✅ 구현됨 |
| F03 | **메인 페이지** | Hero + Trending Strip + 카테고리 매거진 그리드 | P0 | ✅ 구현됨 |
| F04 | **아티클 상세 페이지** | 히어로 이미지 + AI 요약 + 원문 링크 + 관련 기사 | P0 | ✅ 구현됨 |
| F05 | **카테고리 페이지** | `/category/{id}` 전체 기사 목록 | P0 | ❌ 미구현 |
| F06 | **반응형 디자인** | 모바일 퍼스트, 태블릿, 데스크탑 대응 | P0 | ✅ 구현됨 |
| F07 | **다크 모드 UI** | 프리미엄 매거진 다크 테마 | P0 | ✅ 구현됨 |
| F08 | **광고 슬롯** | AdSense 자리 (리더보드, 미드, 인아티클) | P0 | ✅ 자리 확보 |
| F09 | **여행 제휴 CTA** | Booking/Klook/Agoda 어필리에이트 링크 섹션 | P0 | ✅ 구현됨 |
| F10 | **Telegram CTA** | Seoul Prime Club 가입 유도 배너 | P0 | ✅ 구현됨 |
| F11 | **소셜 공유** | X, Telegram, Facebook 공유 버튼 | P0 | ✅ 구현됨 |
| F12 | **SEO 메타데이터** | OG, Twitter Card, hreflang, JSON-LD | P0 | ✅ 기본 구현 |
| F13 | **SSG 빌드** | Astro Static Site Generation | P0 | ✅ 구현됨 |

### 3.2 Phase 2 Features

| # | 기능 | 설명 | 우선순위 |
|---|------|------|----------|
| F14 | **다국어 (i18n)** | IP 기반 자동 언어 감지, 8개 언어 라우팅 | P1 |
| F15 | **카테고리 페이지** | View All 클릭 시 전체 기사 그리드 | P1 |
| F16 | **Sitemap/Robots** | SEO용 sitemap.xml, robots.txt 자동 생성 | P1 |
| F17 | **Google Analytics** | GA4 트래킹 설치 | P1 |
| F18 | **Google AdSense** | 실제 광고 코드 삽입 및 승인 | P1 |
| F19 | **자동 배포** | Cloudflare Pages + GitHub Actions CI/CD | P1 |
| F20 | **크론 자동화** | 매일 자동 콘텐츠 갱신 + 빌드 + 배포 | P1 |

### 3.3 Phase 3 Features

| # | 기능 | 설명 | 우선순위 |
|---|------|------|----------|
| F21 | **협찬 콘텐츠 관리** | 관리자 패널에서 Sponsored 게시물 CRUD | P2 |
| F22 | **협찬 스케줄링** | 노출 시작/종료일 설정, 자동 게재/해제 | P2 |
| F23 | **성과 리포트** | 조회수/클릭수 대시보드 → 광고주 제공 | P2 |
| F24 | **쿠폰 시스템** | 가맹점 등록, 쿠폰 생성, QR 다운로드 | P2 |
| F25 | **가맹점 대시보드** | 쿠폰 사용 현황, 유입 트래픽 분석 | P2 |
| F26 | **검색 기능** | 사이트 내 기사 검색 | P2 |
| F27 | **뉴스레터** | 이메일 구독, 주간 다이제스트 자동 발송 | P3 |
| F28 | **PWA** | 오프라인 지원, 홈 화면 설치 | P3 |

---

## 4. Data Structure

### 4.1 Article (기사)

```json
{
  "id": "string (base64url, 24자)",
  "slug": "string (카테고리-해시8자, 예: kpop-e6ddd81a)",
  "title": "string (기사 제목)",
  "description": "string (원문 설명, 200자 이내)",
  "summary": "string (AI 생성 요약, 최대 600자)",
  "url": "string (원문 URL)",
  "image": "string (썸네일 이미지 URL)",
  "source": "string (출처명, 예: Billboard, Netflix)",
  "category": "enum (kpop|kdrama|food|places|ranking|lifestyle|kproperty)",
  "date": "string (ISO 8601 또는 RFC 2822 날짜)",
  "sponsored": "boolean (협찬 여부)",
  "sponsor_name": "string? (협찬사명)",
  "sponsor_start": "string? (협찬 노출 시작일)",
  "sponsor_end": "string? (협찬 노출 종료일)",
  "lang": "string? (원문 언어, 기본 en)",
  "translations": {
    "ko": { "title": "...", "summary": "..." },
    "ja": { "title": "...", "summary": "..." },
    "zh-cn": { "title": "...", "summary": "..." }
  }
}
```

### 4.2 Category (카테고리)

```json
{
  "id": "string (kpop|kdrama|food|places|ranking|lifestyle|kproperty)",
  "name": "string (표시명, 예: K-POP)",
  "emoji": "string (이모지, 예: 🎵)",
  "color": "string (HEX 색상, 예: #FF2D55)",
  "desc": "string (짧은 설명)",
  "sources": ["string (출처 목록)"]
}
```

**카테고리 정의:**

| ID | Name | Emoji | Color | 설명 |
|----|------|-------|-------|------|
| kpop | K-POP | 🎵 | #FF2D55 | 차트, 뉴스, 트렌딩 |
| kdrama | K-DRAMA | 🎬 | #5856D6 | 인기 드라마, 스트리밍 |
| food | FOOD | 🍜 | #FF9500 | 미슐랭, 스트릿푸드 |
| places | HOT PLACES | 📍 | #30D158 | 핫플, 카페, 히든 젬 |
| ranking | RANKING | 🏆 | #FFD60A | 차트, 박스오피스 |
| lifestyle | LIFESTYLE | ✨ | #BF5AF2 | K-Beauty, 패션 |
| kproperty | K-PROPERTY | 🏠 | #0A84FF | 부동산, 투자, 거주 |

### 4.3 Meta (사이트 메타)

```json
{
  "lastUpdated": "string (ISO 8601)",
  "counts": {
    "kpop": "number",
    "kdrama": "number",
    "food": "number",
    "places": "number",
    "ranking": "number",
    "lifestyle": "number",
    "kproperty": "number"
  }
}
```

### 4.4 Featured (에디터 픽)

```json
[
  {
    "articleId": "string",
    "position": "number (노출 순서)",
    "startDate": "string",
    "endDate": "string"
  }
]
```

### 4.5 Coupon (쿠폰 — Phase 3)

```json
{
  "id": "string (UUID)",
  "merchant_id": "string",
  "title": "string (쿠폰명)",
  "description": "string",
  "discount_type": "enum (percent|fixed|freebie)",
  "discount_value": "number",
  "image": "string (쿠폰 이미지 URL)",
  "category": "enum (cafe|restaurant|activity|shopping)",
  "location": {
    "name": "string (매장명)",
    "address": "string",
    "lat": "number",
    "lng": "number",
    "area": "string (예: Gangnam, Hongdae)"
  },
  "valid_from": "string (ISO 8601)",
  "valid_until": "string (ISO 8601)",
  "total_quantity": "number",
  "used_count": "number",
  "status": "enum (active|expired|paused)",
  "created_at": "string",
  "updated_at": "string"
}
```

### 4.6 Merchant (가맹점 — Phase 3)

```json
{
  "id": "string (UUID)",
  "name": "string (업체명)",
  "email": "string",
  "phone": "string",
  "category": "string",
  "address": "string",
  "logo": "string (URL)",
  "plan": "enum (free|basic|premium)",
  "status": "enum (pending|approved|suspended)",
  "dashboard_stats": {
    "total_coupons": "number",
    "total_downloads": "number",
    "total_redemptions": "number",
    "traffic_referrals": "number"
  },
  "created_at": "string",
  "updated_at": "string"
}
```

### 4.7 SponsoredPost (협찬 — Phase 3)

```json
{
  "id": "string (UUID)",
  "advertiser_name": "string",
  "advertiser_email": "string",
  "article": "Article (위 구조와 동일, sponsored=true)",
  "schedule": {
    "start": "string (ISO 8601)",
    "end": "string (ISO 8601)",
    "target_categories": ["string (노출 카테고리)"],
    "position": "enum (top|inline|banner)"
  },
  "performance": {
    "impressions": "number",
    "clicks": "number",
    "ctr": "number (클릭률 %)"
  },
  "pricing": {
    "model": "enum (cpm|cpc|flat)",
    "rate": "number",
    "total_spend": "number"
  },
  "status": "enum (draft|active|paused|completed)",
  "created_at": "string",
  "updated_at": "string"
}
```

### 4.8 Analytics Event (Phase 2+)

```json
{
  "event_type": "enum (page_view|article_click|coupon_download|coupon_redeem|affiliate_click|share)",
  "article_id": "string?",
  "category": "string?",
  "referrer": "string?",
  "user_country": "string (IP 기반)",
  "user_lang": "string",
  "device": "enum (mobile|tablet|desktop)",
  "timestamp": "string (ISO 8601)"
}
```

---

## 5. Technical Architecture

### 5.1 시스템 아키텍처 개요

```
┌──────────────────────────────────────────────────────────────┐
│                     DATA SOURCES (외부)                        │
│                                                               │
│  Google News RSS ─┐                                           │
│  Naver News ──────┤                                           │
│  Melon Charts ────┤                                           │
│  Netflix Top 10 ──┼──→ [Content Pipeline]                     │
│  Billboard KR ────┤       │                                   │
│  Michelin Guide ──┤       ▼                                   │
│  Instagram ───────┘   [data/*.json]                           │
│                          │                                    │
├──────────────────────────┼────────────────────────────────────┤
│                     BUILD LAYER                               │
│                          │                                    │
│                    [Astro SSG]                                 │
│                    astro build                                 │
│                          │                                    │
│                     [dist/]                                    │
│                    정적 HTML                                    │
│                          │                                    │
├──────────────────────────┼────────────────────────────────────┤
│                   HOSTING LAYER                               │
│                          │                                    │
│               [Cloudflare Pages]                              │
│                    ├─ CDN 전역 배포                             │
│                    ├─ SSL/TLS (자동)                           │
│                    ├─ DDoS 방어                                │
│                    └─ Edge Caching                             │
│                          │                                    │
│                  seoul.is (커스텀 도메인)                        │
│                          │                                    │
├──────────────────────────┼────────────────────────────────────┤
│                   CLIENT LAYER                                │
│                          │                                    │
│                  [사용자 브라우저]                               │
│                    ├─ 정적 HTML (빠른 로딩)                     │
│                    ├─ Google AdSense (자동 광고)                │
│                    ├─ GA4 (트래킹)                              │
│                    └─ 언어 감지 (navigator.language)            │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| **프레임워크** | Astro 6.x | SSG 최적화, 빠른 빌드, 제로 JS by default |
| **스타일링** | CSS (커스텀 디자인 시스템) | 외부 의존성 없음, 최소 번들 |
| **폰트** | Inter + Noto Sans KR/JP | 다국어 지원, 웹 최적화 |
| **데이터** | JSON 파일 (data/*.json) | SSG에 최적, DB 불필요 (Phase 1) |
| **콘텐츠 수집** | Node.js (fetch-content.cjs) | Google News RSS 파싱 |
| **AI Enrichment** | gsk search (Genspark CLI) | 기사 요약 자동 생성 |
| **호스팅** | Cloudflare Pages | 무료, 글로벌 CDN, 커스텀 도메인 |
| **DNS** | Cloudflare | 도메인 관리, 캐싱, 보안 |
| **광고** | Google AdSense | 자동 광고 게재 |
| **분석** | Google Analytics 4 | 트래픽 분석, 유저 행동 |
| **이미지** | Unsplash (큐레이션) | 무료, 고품질, 카테고리별 매핑 |

### 5.3 Phase 2+ 기술 확장

| 기능 | 기술 | 용도 |
|------|------|------|
| **DB** | Supabase (PostgreSQL) | 쿠폰, 가맹점, 협찬, 분석 데이터 |
| **API** | Cloudflare Workers | 서버리스 API (쿠폰 검증, QR 생성) |
| **인증** | Supabase Auth | 가맹점/관리자 로그인 |
| **번역** | DeepL API 또는 GPT | 자동 다국어 번역 |
| **스케줄러** | Cloudflare Workers Cron | 매일 콘텐츠 갱신 트리거 |
| **이미지 저장** | Cloudflare R2 | 커스텀 이미지 호스팅 |
| **QR 생성** | qrcode npm | 쿠폰 QR 코드 |
| **이메일** | Resend 또는 Mailgun | 뉴스레터, 리포트 발송 |

### 5.4 API 연동 포인트

| API | 용도 | 인증 방식 | Phase |
|-----|------|-----------|-------|
| Google News RSS | 기사 수집 | 없음 (공개 RSS) | 1 |
| Unsplash | 이미지 | 없음 (Source URL) | 1 |
| Genspark (gsk CLI) | AI 요약 | API Key (pre-configured) | 1 |
| Google AdSense | 광고 | Publisher ID | 2 |
| Google Analytics 4 | 분석 | Measurement ID | 2 |
| Booking.com Affiliate | 호텔 제휴 | Affiliate ID | 2 |
| Klook Affiliate | 투어 제휴 | Affiliate ID | 2 |
| Agoda Affiliate | 숙박 제휴 | Affiliate ID | 2 |
| DeepL / GPT | 번역 | API Key | 2 |
| Supabase | DB/Auth | Project Key | 3 |
| Cloudflare R2 | 이미지 저장 | Account Token | 3 |
| Resend / Mailgun | 이메일 | API Key | 3 |

### 5.5 자동화 / Cron 연동 포인트

```
┌─────────────────────────────────────────────────┐
│  DAILY CRON (매일 06:00 KST)                     │
│                                                  │
│  1. node scripts/fetch-content.cjs               │
│     → Google News RSS 수집                        │
│     → data/*.json 업데이트                         │
│                                                  │
│  2. bash scripts/enrich-articles.sh              │
│     → gsk search로 AI 요약 생성                    │
│     → slug 자동 부여                               │
│                                                  │
│  3. astro build                                  │
│     → dist/ 정적 파일 생성                          │
│                                                  │
│  4. wrangler pages deploy dist/                  │
│     → Cloudflare Pages 배포                        │
│                                                  │
│  (또는 GitHub push → Pages 자동 빌드)               │
└─────────────────────────────────────────────────┘
```

### 5.6 n8n 연동 포인트 (선택 사항)

n8n을 사용할 경우 아래 워크플로우 자동화 가능:

| 워크플로우 | 트리거 | 액션 |
|-----------|--------|------|
| 콘텐츠 갱신 | Schedule (매일 06:00) | SSH → 서버에서 fetch + build + deploy |
| 협찬 스케줄 | Schedule (매시간) | Supabase Query → 만료된 협찬 비활성화 |
| 주간 리포트 | Schedule (매주 월요일) | GA4 API → 리포트 생성 → 이메일 발송 |
| 신규 가맹점 알림 | Webhook (Supabase) | 신규 등록 → Telegram 알림 |
| 쿠폰 만료 알림 | Schedule (매일) | 만료 D-3 가맹점에게 이메일 알림 |
| SNS 자동 포스팅 | Webhook (새 기사 발행) | 인스타/텔레그램에 자동 포스팅 |

---

## 6. Content Pipeline

### 6.1 데이터 수집 흐름

```
[Sources]                [Fetcher]              [Enricher]           [Builder]
                                                                     
Google News    ──RSS──→  fetch-content.cjs  ──→  enrich-articles.sh ──→ astro build
(6 categories)           │                      │                     │
                         ├ RSS XML 파싱          ├ gsk search          ├ SSG 빌드
                         ├ 12개/카테고리 추출      ├ AI 요약 생성         ├ dist/ 출력
                         ├ Unsplash 이미지 매핑   ├ slug 생성            └ Cloudflare
                         └ data/*.json 저장      └ data/*.json 업데이트     배포
```

### 6.2 RSS 소스 (현재)

| 카테고리 | RSS 쿼리 | 최대 수 |
|---------|----------|---------|
| K-POP | `kpop korea music chart 2026` | 12 |
| K-DRAMA | `korean drama kdrama netflix 2026` | 12 |
| FOOD | `seoul restaurant michelin korean food best` | 12 |
| HOT PLACES | `seoul cafe bar hotplace trending travel` | 12 |
| RANKING | `korea chart top ranking box office kpop` | 12 |
| LIFESTYLE | `korea beauty fashion lifestyle seoul trend` | 12 |
| K-PROPERTY | (별도 하드코딩/수동) | 7 |

### 6.3 이미지 전략

**Phase 1 (현재):** 카테고리별 Unsplash 큐레이션 이미지 (12장씩, 순환)
- 무료, API 키 불필요
- 장점: 안정적, 고품질
- 단점: 기사와 정확히 매칭되지 않음

**Phase 2 (계획):**
- 기사 원문에서 OG 이미지 자동 추출
- 없을 경우 Unsplash 폴백
- Cloudflare R2에 캐시 저장

---

## 7. Internationalization (i18n)

### 7.1 지원 언어

| 코드 | 언어 | 국기 | 라우트 | 우선순위 |
|------|------|------|--------|----------|
| en | English | 🇺🇸 | `/` (기본) | P0 |
| ko | 한국어 | 🇰🇷 | `/ko` | P1 |
| ja | 日本語 | 🇯🇵 | `/ja` | P1 |
| zh-cn | 简体中文 | 🇨🇳 | `/zh-cn` | P1 |
| zh-tw | 繁體中文 | 🇹🇼 | `/zh-tw` | P1 |
| vi | Tiếng Việt | 🇻🇳 | `/vi` | P2 |
| id | Bahasa Indonesia | 🇮🇩 | `/id` | P2 |
| th | ภาษาไทย | 🇹🇭 | `/th` | P2 |

### 7.2 구현 방식

1. **언어 감지**: `navigator.language` + Cloudflare `CF-IPCountry` 헤더
2. **라우팅**: Astro 정적 경로 (`/ja/`, `/ko/`, `/zh-cn/` 등)
3. **번역**: 기사 제목/요약 → DeepL API 또는 GPT 자동 번역 (빌드 타임)
4. **UI 텍스트**: JSON 번역 파일 (`i18n/en.json`, `i18n/ko.json`, ...)
5. **hreflang**: `<link rel="alternate">` 태그 (이미 구현됨)
6. **언어 전환**: 헤더 드롭다운 (이미 UI 구현됨, 실제 라우팅 미연결)

---

## 8. Revenue Model

### 8.1 수익 구조 (4단계)

```
                          ┌──────────────────┐
                          │   REVENUE MIX    │
                          └──────┬───────────┘
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                      ▼
    ┌──────────────┐   ┌─────────────────┐   ┌────────────────┐
    │ 1. AdSense   │   │ 2. Affiliate    │   │ 3. Direct Ads  │
    │ (자동 광고)   │   │ (여행 제휴)      │   │ (협찬 콘텐츠)   │
    │              │   │                 │   │                │
    │ CPM 기반     │   │ CPA/CPC 기반     │   │ 정액/CPM/CPC   │
    │ $2~5 RPM    │   │ 3~8% 커미션      │   │ 월 50~500만원   │
    └──────────────┘   └─────────────────┘   └────────────────┘
                                                      │
                                               ┌──────┴───────┐
                                               ▼              ▼
                                        ┌────────────┐ ┌────────────┐
                                        │ 4. 쿠폰    │ │ 5. 데이터  │
                                        │ B2B 과금   │ │ (미래)     │
                                        │            │ │            │
                                        │ 가맹점     │ │ 트렌드     │
                                        │ 월정액     │ │ 리포트     │
                                        └────────────┘ └────────────┘
```

### 8.2 수익 상세

#### R1. Google AdSense (자동 광고)
- **모델**: CPM/CPC (Google이 자동 최적화)
- **예상 RPM**: $2~5 (글로벌 트래픽)
- **광고 위치**: 메인 리더보드, 카테고리 사이, 아티클 내 3곳
- **예상 수익**: 월 10만 PV 기준 $200~500/월

#### R2. 여행/호텔 어필리에이트
- **파트너**: Booking.com, Agoda, Klook, KKday, Trip.com
- **모델**: CPA (예약 완료 시 커미션 3~8%)
- **노출 위치**: 메인 Travel CTA 섹션, 아티클 내 관련 배너
- **예상 수익**: 월 50~200건 전환 시 $500~2,000/월

#### R3. 직접 광고 (협찬 콘텐츠)
- **모델**: 정액 (월 패키지) 또는 CPM/CPC
- **가격**:
  - 배너 광고: 50~200만원/월
  - 협찬 기사 (1건): 30~100만원
  - 카테고리 스폰서십: 300~500만원/월
- **대상**: 한국 관광청, 항공사, 호텔, 식당, K-뷰티 브랜드
- **기능**: 관리자 패널에서 CRUD, 스케줄링, 성과 리포트

#### R4. 쿠폰 플랫폼 (B2B)
- **모델**: 가맹점 월정액
  - Free: 쿠폰 3개, 기본 대시보드
  - Basic (10만원/월): 쿠폰 무제한, 상세 분석
  - Premium (30만원/월): 우선 노출, 프로모션 지원
- **수수료**: 쿠폰 사용 건당 500~1,000원 (또는 월정액에 포함)
- **전략**: 초기 무료 → 트래픽 확보 후 유료 전환

### 8.3 수익 예측 (12개월)

| 월 | PV | AdSense | Affiliate | Direct | Coupon | 합계 |
|----|-----|---------|-----------|--------|--------|------|
| 1~3 | 10K | $50 | $0 | $0 | $0 | $50 |
| 4~6 | 50K | $200 | $300 | $500 | $0 | $1,000 |
| 7~9 | 200K | $800 | $1,000 | $2,000 | $500 | $4,300 |
| 10~12 | 500K | $2,000 | $3,000 | $5,000 | $2,000 | $12,000 |

**연간 합계 예상: $50,000~70,000 (약 6,500만~9,000만원)**

---

## 9. SEO Strategy

### 9.1 On-Page SEO

| 항목 | 구현 | 상태 |
|------|------|------|
| Title 태그 | 페이지별 고유 타이틀 | ✅ |
| Meta Description | 페이지별 고유 설명 | ✅ |
| OG Tags | og:title, og:description, og:image | ✅ |
| Twitter Card | summary_large_image | ✅ |
| hreflang | 8개 언어 alternate 태그 | ✅ |
| canonical | 페이지별 canonical URL | ✅ |
| JSON-LD | WebSite, Article 스키마 | ✅ (기본) |
| Sitemap | sitemap.xml 자동 생성 | ❌ 미구현 |
| Robots.txt | 크롤러 가이드 | ❌ 미구현 |
| Semantic HTML | header, main, article, section | ✅ |
| 이미지 alt | 기사 제목 기반 자동 | ✅ |
| 모바일 최적화 | 반응형 + 모바일 퍼스트 | ✅ |
| 페이지 속도 | SSG, 최소 JS, CDN | ✅ |

### 9.2 키워드 전략

**Primary Keywords:**
- Seoul guide, Korea travel, K-POP news, K-Drama 2026
- Michelin Seoul, Seoul restaurants, Seoul hot places
- Korean beauty, K-beauty, Seoul fashion
- Seoul real estate, Korea property

**Long-tail Keywords:**
- "best restaurants in Seoul 2026"
- "top K-dramas on Netflix this month"
- "BTS comeback news"
- "Seoul Gangnam apartment prices"
- "things to do in Seoul"

---

## 10. Deployment & Infrastructure

### 10.1 현재 인프라

```
DNS: seoul.is → Cloudflare → gensparksite.com (이전 버전)
```

### 10.2 목표 인프라

```
DNS: seoul.is → Cloudflare Pages (Astro 빌드)

GitHub Repo
  └─ push to main
       └─ Cloudflare Pages 자동 빌드
            ├─ npm run fetch (콘텐츠 수집)
            ├─ npm run build (Astro SSG)
            └─ dist/ → CDN 배포 (글로벌)
```

### 10.3 배포 단계

1. **GitHub 리포지토리 생성** (`seoul-is`)
2. **Cloudflare Pages 프로젝트 생성**
   - Framework: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
3. **커스텀 도메인 연결**
   - Cloudflare DNS에서 `seoul.is` → Pages 프로젝트
4. **환경 변수 설정**
   - `NODE_VERSION`: 22
5. **자동 배포**
   - main 브랜치 push 시 자동 빌드/배포

### 10.4 일일 콘텐츠 갱신 (자동화)

**Option A: GitHub Actions**
```yaml
name: Daily Content Update
on:
  schedule:
    - cron: '0 21 * * *'  # 매일 06:00 KST (21:00 UTC)
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run fetch
      - run: npm run build
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: daily content update"
```

**Option B: Cloudflare Workers Cron**
- Workers에서 fetch 스크립트 실행 → Pages 빌드 트리거

---

## 11. Current Implementation Status

### 11.1 파일 구조

```
seoul-is/
├── astro.config.mjs          # Astro 설정 (site: seoul.is, output: static)
├── package.json               # 의존성 (astro ^6.1.5)
├── data/                      # 콘텐츠 데이터 (JSON)
│   ├── kpop.json              # K-POP 기사 12개
│   ├── kdrama.json            # K-DRAMA 기사 12개
│   ├── food.json              # FOOD 기사 12개
│   ├── places.json            # HOT PLACES 기사 3개
│   ├── ranking.json           # RANKING 기사 12개
│   ├── lifestyle.json         # LIFESTYLE 기사 12개
│   ├── kproperty.json         # K-PROPERTY 기사 7개 (하드코딩)
│   ├── featured.json          # 에디터 픽 (비어있음)
│   └── meta.json              # 최종 업데이트 시간
├── scripts/
│   ├── fetch-content.cjs      # RSS 콘텐츠 수집기
│   └── enrich-articles.sh     # AI 요약 생성기
├── src/
│   ├── styles/
│   │   └── global.css         # 디자인 시스템 (토큰, 리셋, 유틸리티)
│   ├── lib/
│   │   ├── categories.js      # 카테고리 정의 + 언어 목록
│   │   └── content.js         # 데이터 로딩 유틸리티
│   ├── layouts/
│   │   └── Base.astro         # HTML 레이아웃 (메타, 폰트, favicon)
│   ├── components/
│   │   ├── Header.astro       # 헤더 (로고, 네비, 언어 선택, 모바일 카테고리 바)
│   │   ├── Footer.astro       # 푸터 (4컬럼 그리드, 링크)
│   │   ├── CategorySection.astro  # 카테고리 매거진 그리드
│   │   └── ContentCard.astro  # 기사 카드 (large/small/hero)
│   └── pages/
│       ├── index.astro        # 메인 페이지
│       └── article/
│           └── [slug].astro   # 아티클 상세 페이지
└── dist/                      # 빌드 출력 (정적 HTML)
```

### 11.2 알려진 이슈

| # | 이슈 | 심각도 | 설명 |
|---|------|--------|------|
| I01 | slug 미생성 | High | 새로 fetch한 데이터에 slug가 없어 아티클 페이지 미생성 |
| I02 | kproperty RSS 없음 | Medium | kproperty는 하드코딩 데이터, RSS 자동 수집 미구현 |
| I03 | places 데이터 부족 | Medium | HOT PLACES RSS 쿼리가 3건만 반환 |
| I04 | 카테고리 페이지 없음 | Medium | `/category/{id}` 라우트 미구현 (View All 링크 깨짐) |
| I05 | 다국어 미연결 | Low | 언어 선택 UI는 있으나 실제 라우팅 없음 |
| I06 | Google News URL | Low | RSS URL이 Google 리다이렉트 URL (원문 URL 아님) |

---

## 12. Roadmap

### Phase 1: MVP 완성 및 배포 (1주)

- [ ] slug 생성 로직 수정 (fetch 스크립트)
- [ ] kproperty RSS 자동 수집 추가
- [ ] places RSS 쿼리 개선
- [ ] 카테고리 페이지 (`/category/[id].astro`) 구현
- [ ] sitemap.xml, robots.txt 추가
- [ ] Cloudflare Pages 배포
- [ ] 커스텀 도메인 연결 (seoul.is)
- [ ] Google Analytics 4 설치
- [ ] Google AdSense 신청

### Phase 2: 수익화 & SEO (2~4주)

- [ ] AdSense 코드 삽입 및 최적화
- [ ] 어필리에이트 링크 실제 ID 연결 (Booking, Klook, Agoda)
- [ ] GA4 이벤트 트래킹 설정
- [ ] 일일 자동 갱신 크론 (GitHub Actions)
- [ ] 다국어 라우팅 구현 (최소 영어/한국어/일본어)
- [ ] JSON-LD Article 스키마 상세화
- [ ] OG 이미지 동적 생성
- [ ] 인스타그램 / 텔레그램 자동 포스팅

### Phase 3: 플랫폼 확장 (1~2개월)

- [ ] Supabase 연동 (DB, Auth)
- [ ] 관리자 패널 (협찬 콘텐츠 CRUD)
- [ ] 협찬 콘텐츠 스케줄링 & 리포트
- [ ] 쿠폰 시스템 MVP
- [ ] 가맹점 대시보드
- [ ] 뉴스레터 구독
- [ ] 검색 기능
- [ ] PWA 지원

### Phase 4: 스케일업 (3개월+)

- [ ] 전체 8개 언어 번역
- [ ] 기사 원문 OG 이미지 자동 추출
- [ ] AI 개인화 추천
- [ ] 커뮤니티 기능 (댓글, 좋아요)
- [ ] 트렌드 데이터 리포트 (B2B 판매)
- [ ] 모바일 앱 (React Native 또는 PWA)

---

## Appendix

### A. 디자인 토큰

```css
--bg: #050505;
--surface: #111111;
--card: #0f0f0f;
--primary: #FF2D55;
--kpop: #FF2D55;
--kdrama: #5856D6;
--food: #FF9500;
--places: #30D158;
--ranking: #FFD60A;
--lifestyle: #BF5AF2;
--kproperty: #0A84FF;
--text: #ffffff;
--text-secondary: #999999;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--max-width: 1280px;
```

### B. 관련 계정

| 서비스 | 계정 | 용도 |
|--------|------|------|
| Gmail | seoulis.info@gmail.com | 메인 이메일 |
| Cloudflare | seoulis.info@gmail.com | DNS, Pages 호스팅 |
| Google AdSense | (연동 대기) | 광고 수익 |
| Google Analytics | (설치 대기) | 트래픹 분석 |
| Instagram | @seoulis_media | SNS 마케팅 |
| Telegram | @SeoulPrimeClub_Chat | 커뮤니티 |
| Twitter | @SeoulIs_Media | SNS 마케팅 |

### C. 경쟁 분석

| 서비스 | 차별점 |
|--------|--------|
| Allkpop | K-POP 전문, 다른 카테고리 없음 |
| Soompi | 엔터 중심, 여행/부동산 없음 |
| Korea JoongAng Daily | 뉴스 중심, 큐레이션 아님 |
| Visit Seoul | 관광청 공식, 업데이트 느림 |
| **seoul.is** | **7개 카테고리 통합, 자동 큐레이션, 다국어, 쿠폰** |

---

*이 문서는 다른 AI 또는 개발팀이 seoul.is 플랫폼을 구축하는 데 필요한 모든 기술적 요구사항을 포함합니다.*
*최종 업데이트: 2026-04-14*
