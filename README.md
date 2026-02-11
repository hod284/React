# 서버 모니터링 대시보드 (TypeScript)

Spring Boot 백엔드와 WebSocket을 활용한 실시간 서버 모니터링 대시보드입니다.

## 주요 기능

### 인증 시스템
- 관리자 회원가입 및 로그인
- JWT 기반 인증
- Redis를 통한 Refresh Token 관리
- 자동 토큰 갱신

### 실시간 모니터링
- WebSocket(STOMP)을 통한 실시간 데이터 수신
- 2초마다 자동 업데이트
- CPU, 메모리, 쓰레드 모니터링

### 대시보드 화면
1. **메인 대시보드**
   - 전체 시스템 메트릭 요약
   - CPU, 메모리, 쓰레드 실시간 차트
   - 시스템 정보 패널

2. **CPU 상세 모니터링**
   - 시스템 CPU 사용률
   - 프로세스 CPU 사용률
   - 60개 데이터 포인트 히스토리

3. **메모리 상세 모니터링**
   - 전체 메모리 사용률
   - Heap/Non-Heap 메모리
   - 메모리 사용 추이

4. **쓰레드 상세 모니터링**
   - 활성 쓰레드 수
   - 데몬 쓰레드 수
   - Peak 쓰레드 수

## 기술 스택

### Frontend
- React 18 with TypeScript
- React Router v6
- Axios (HTTP 클라이언트)
- Recharts (차트 라이브러리)
- STOMP.js + SockJS (WebSocket)

### Backend (기존)
- Spring Boot
- Spring Security + JWT
- Redis
- WebSocket (STOMP)
- Micrometer (메트릭)

## 설치 및 실행

### 1. 프로젝트 설치
```bash
cd monitoring-dashboard
npm install
```

### 2. 백엔드 서버 실행
백엔드 Spring Boot 애플리케이션을 먼저 실행해주세요 (포트 8080).

### 3. 프론트엔드 실행
```bash
npm start
```

브라우저에서 http://localhost:3000 으로 접속하세요.

## TypeScript 특징

### 타입 안정성
- 모든 컴포넌트와 함수에 타입 지정
- 인터페이스를 통한 명확한 데이터 구조
- 컴파일 타임 오류 감지

### 주요 타입 정의
```typescript
// src/types/index.ts에 정의된 타입들
- AuthResponse: 인증 응답 타입
- User: 사용자 정보 타입
- MetricsData: 메트릭 데이터 타입
- ChartDataPoint: 차트 데이터 포인트 타입
```

### 컴포넌트 Props 타입
모든 컴포넌트는 명확한 Props 인터페이스를 가집니다:
- LoginPageProps
- DashboardPageProps
- MetricCardProps
- ChartCardProps
- DetailLayoutProps

## 백엔드 수정 사항

백엔드 코드에서 다음 부분을 수정해야 합니다:

### 1. UserRepository 수정
`UserRepositry.java`의 쿼리 수정:
```java
@Query("SELECT u FROM User u WHERE u.username = :mid")
public Optional<User> findbyUserId(@Param("mid") String mid);
```

### 2. WebSocket CORS 설정
`WebsoketConfig.java`의 STOMP 엔드포인트:
```java
@Override 
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws-monitoring")
        .setAllowedOriginPatterns("*")
        .withSockJS();
}
```

### 3. SecurityConfig 수정
`LoginSecurity.java`에서 WebSocket 엔드포인트 허용:
```java
.requestMatchers("/ws-monitoring/**").permitAll()
```

## API 엔드포인트

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

### 모니터링 API (관리자 전용)
- `GET /api/monitoring/meterics/cpu` - CPU 메트릭
- `GET /api/monitoring/metrics/memory` - 메모리 메트릭
- `GET /api/monitoring/metrics/threads` - 쓰레드 메트릭
- `GET /api/monitoring/metrics/all` - 전체 메트릭

### WebSocket
- 연결: `ws://localhost:8080/ws-monitoring`
- 구독: `/topic/metrics`

## 프로젝트 구조

```
monitoring-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── ChartCard.tsx
│   │   ├── DetailLayout.tsx
│   │   └── MetricCard.tsx
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CPUDetailPage.tsx
│   │   ├── MemoryDetailPage.tsx
│   │   └── ThreadDetailPage.tsx
│   ├── services/           # API 및 WebSocket 서비스
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── styles/             # CSS 스타일
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   ├── Detail.css
│   │   └── Components.css
│   ├── types/              # TypeScript 타입 정의
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── README.md
```

## TypeScript 설정

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

## 트러블슈팅

### WebSocket 연결 실패
1. 백엔드 서버가 실행 중인지 확인
2. CORS 설정 확인
3. 방화벽 설정 확인

### 로그인 실패
1. 백엔드 데이터베이스 연결 확인
2. Redis 서버 실행 확인
3. 관리자 계정으로 등록했는지 확인

### 메트릭 표시 안됨
1. WebSocket 연결 상태 확인
2. 백엔드 Actuator 설정 확인
3. 브라우저 콘솔 로그 확인

### TypeScript 오류
1. `npm install`로 모든 의존성 설치 확인
2. `@types` 패키지가 모두 설치되었는지 확인
3. tsconfig.json 설정 확인

## 라이선스
MIT
