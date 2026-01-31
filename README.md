# Why TFT

TFT(Teamfight Tactics) 포스트게임 분석 서비스

## 프로젝트 목표

특정 매치가 왜 그런 결과로 끝났는지를 **규칙 기반의 결정론적 분석**을 통해 설명합니다.

- ❌ 메타 추천이나 통계 사이트가 아닙니다
- ✅ 경기 종료 시점의 데이터를 기반으로 명확한 근거와 함께 분석을 제공합니다

## 핵심 원칙

1. **포스트게임 분석만** - 실시간 기능 없음
2. **휴리스틱 > AI 추론** - 규칙 기반 분석
3. **설명 가능성 우선** - 모든 결과는 근거와 함께 제공

## 기술 스택

- Next.js 14 (App Router)
- TypeScript (Strict Mode)
- TanStack Query (React Query)
- Tailwind CSS
- Riot Games API

## 아키텍처

### 2계층 캐싱 전략
1. **서버 캐싱** (Next.js): Riot API Rate Limit 보호
2. **클라이언트 캐싱** (TanStack Query): UI 레벨 최적화

### 3계층 분석 아키텍처
1. **Normalizer**: API 데이터 정규화
2. **Feature Extractor**: 특성 추출
3. **Rule Engine**: 규칙 기반 분석

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 Riot API Key 입력

# 개발 서버 실행
npm run dev
```

## 프로젝트 구조

```
src/
├─ app/                    # Next.js App Router
│   ├─ page.tsx           # 메인 페이지
│   ├─ matches/           # 매치 관련 페이지
│   └─ api/               # API Routes
├─ features/              # 기능별 모듈
│   ├─ match/            # 매치 데이터 관리
│   ├─ analysis/         # 분석 로직 (3계층)
│   └─ profile/          # 프로필 관리
└─ shared/               # 공유 리소스
    ├─ ui/              # UI 컴포넌트
    ├─ lib/             # 유틸리티
    └─ types/           # 공통 타입
```

## 분석 아키텍처

분석 로직은 3개의 독립된 계층으로 구성됩니다:

1. **Normalizer** - Riot API 응답을 내부 구조로 변환
2. **Feature Extractor** - 분석에 필요한 특성 추출
3. **Rule Engine** - 규칙 기반 분석 및 원인 도출
