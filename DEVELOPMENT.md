# Why TFT - 개발 가이드

## 초기 설정

1. 의존성 설치:
```bash
npm install
```

2. 환경변수 설정:
```bash
# Riot Developer Portal에서 API Key 발급
# https://developer.riotgames.com/
cp .env.example .env.local
# .env.local 파일에 RIOT_API_KEY 입력
```

3. 개발 서버 실행:
```bash
npm run dev
```

## 프로젝트 구조

```
src/
├─ app/                           # Next.js App Router
│   ├─ layout.tsx                # 루트 레이아웃 (QueryProvider)
│   ├─ page.tsx                  # 메인 페이지
│   ├─ globals.css               # 글로벌 스타일
│   ├─ matches/
│   │   ├─ page.tsx             # 매치 리스트 페이지
│   │   └─ [matchId]/page.tsx   # 매치 상세 분석 페이지
│   └─ api/                      # API Routes (Server-side)
│       ├─ summoner/[gameName]/[tagLine]/
│       ├─ matches/by-puuid/[puuid]/
│       └─ matches/[matchId]/
├─ features/                      # 기능별 모듈
│   ├─ analysis/                 # 분석 로직 (핵심)
│   │   ├─ normalizer.ts        # 1계층: 데이터 정규화
│   │   ├─ rule-engine.ts       # 3계층: 규칙 적용
│   │   └─ index.ts             # 통합 분석 함수
│   ├─ match/                    # 매치 관련
│   └─ profile/                  # 프로필 관련
└─ shared/                        # 공유 리소스
    ├─ ui/                       # 재사용 UI 컴포넌트
    │   ├─ AnalysisCard.tsx
    │   ├─ PlacementBadge.tsx
    │   ├─ MatchListItem.tsx
    │   └─ index.ts
    ├─ lib/                      # 유틸리티
    │   ├─ api-client.ts        # API 클라이언트
    │   ├─ queries.ts           # TanStack Query hooks
    │   ├─ query-provider.tsx   # QueryProvider 설정
    │   ├─ format.ts            # 포맷 유틸리티
    │   └─ index.ts
    └─ types/                    # 타입 정의
        └─ analysis.ts          # 분석 관련 타입
```

## 핵심 규칙

### 1. 3계층 분석 아키텍처

분석 로직은 반드시 3개의 계층으로 분리:

1. **Normalizer** (`normalizer.ts`)
   - Riot API → 내부 데이터 구조 변환
   - 분석/판단 로직 금지

2. **Feature Extractor** (`feature-extractor.ts`)
   - 정규화된 데이터 → 분석용 특성 추출
   - 순수 함수, 부작용 없음

3. **Rule Engine** (`rule-engine.ts`)
   - 특성 → 규칙 적용 → 원인 도출
   - 모든 규칙은 `ANALYSIS_RULES` 배열에서 관리

### 2. 2계층 캐싱 전략 (중요!)

#### Layer 1: 서버 캐싱 (Next.js)
- **모든 Riot API 요청은 서버에서 실행**
- `fetch`의 `next.revalidate` 옵션 사용
- API Routes (`/app/api/*`)에서 처리

캐싱 설정:
```typescript
// 소환사 정보: 5분
next: { revalidate: 300 }

// 매치 목록: 1분 (자주 업데이트)
next: { revalidate: 60 }

// 매치 상세: 10분 (불변 데이터)
next: { revalidate: 600 }
```

#### Layer 2: 클라이언트 캐싱 (TanStack Query)
- **UI 레벨 캐싱과 요청 중복 제거**
- Query hooks 사용 (`queries.ts`)
- 계층적 쿼리 키 구조

쿼리 키 구조:
```typescript
['tft', 'summoner', gameName, tagLine]
['tft', 'matches', puuid, count]
['tft', 'match', matchId]
```

**금지사항:**
- ❌ 커스텀 캐시 로직 (Map, WeakMap 등)
- ❌ analysis 모듈 내 캐싱
- ❌ 클라이언트에서 직접 Riot API 호출

### 3. TypeScript 규칙

- `any` 사용 금지
- strict 모드 활성화
- 명시적 타입 선언 (특히 분석 코드)

### 4. 네이밍 규칙

- 분석 함수: 동사 + 명사
  - `normalizeMatch`, `extractFeatures`, `applyRules`
- UI 컴포넌트: 명사 기반
  - `AnalysisCard`, `PlacementBadge`

### 5. 코드 스타일

- 함수는 단일 책임
- 조건문 중첩 최대 2단계
- 가독성 > 성능

## TanStack Query 사용법

### Query Hook 만들기

```typescript
// src/shared/lib/queries.ts
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['tft', 'match', matchId],
    queryFn: () => fetchMatchById(matchId),
    staleTime: 10 * 60 * 1000,
    enabled: !!matchId,
  })
}
```

### 컴포넌트에서 사용

```typescript
const matchQuery = useMatch(matchId)

if (matchQuery.isLoading) return <Loading />
if (matchQuery.error) return <Error />
if (!matchQuery.data) return null

// matchQuery.data 사용
```

## 분석 규칙 추가 방법

`src/features/analysis/rule-engine.ts`의 `ANALYSIS_RULES` 배열에 추가:

```typescript
{
  code: 'UNIQUE_CODE',           // 규칙 식별자
  category: 'ITEM',              // ITEM|CARRY|SYNERGY|LEVEL|ECON|AUGMENT
  condition: (f) => f.xxx < 3,   // 조건 함수
  score: 2,                      // 영향도 (1-3)
  evidence: (f) => ({ xxx: f.xxx }), // 근거 데이터
  messageTemplate: '설명 ({{xxx}})', // 메시지 템플릿
  actionCode: 'ACTION_CODE',     // 개선 방향 (선택)
}
```

## API 엔드포인트

### 서버 API Routes

- `GET /api/summoner/[gameName]/[tagLine]` - 소환사 조회
- `GET /api/matches/by-puuid/[puuid]?count=10` - 매치 ID 목록
- `GET /api/matches/[matchId]` - 매치 상세 정보

모든 API는 Next.js 서버에서 Riot API를 호출하고 캐싱 처리

## 개발 시 주의사항

1. **분석 로직은 features/analysis에만**
   - UI 코드와 분리
   - 순수 함수로 작성

2. **API 호출은 서버에서만**
   - `/app/api/` 라우트 사용
   - 클라이언트는 TanStack Query hooks 사용

3. **캐싱은 2계층 전략 준수**
   - 서버: Next.js fetch 캐싱
   - 클라이언트: TanStack Query

4. **규칙 수정 시**
   - `ANALYSIS_RULES` 배열만 수정
   - 하드코딩된 if/else 금지

5. **타입 안전성**
   - any 금지
   - 런타임 타입 검증 필요 시 명시적 처리

## Rate Limit 처리

- 서버 캐싱으로 API 호출 최소화
- TanStack Query의 retry 설정으로 429 에러 대응
- 매치 목록 로딩 시 150ms 딜레이 (초당 ~6개)
