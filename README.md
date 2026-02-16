# System Monitoring Dashboard (Vite + TypeScript + React)

실시간 시스템 모니터링 대시보드 - Spring Boot 백엔드와 React 프론트엔드를 사용한 실시간 CPU, 메모리, 스레드 모니터링 시스템

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [환경 설정](#환경-설정)
- [API 엔드포인트](#api-엔드포인트)
- [사용 방법](#사용-방법)

## 🎯 주요 기능

### 백엔드 (Spring Boot)
- ✅ JWT 기반 인증/인가
- ✅ Redis를 사용한 세션 관리
- ✅ WebSocket (STOMP) 실시간 데이터 전송
- ✅ Micrometer를 통한 메트릭 수집
- ✅ 2초마다 자동 메트릭 브로드캐스트

### 프론트엔드 (React + TypeScript)
- ✅ 실시간 차트 (Chart.js)
- ✅ WebSocket 자동 재연결
- ✅ JWT 토큰 기반 인증
- ✅ 반응형 대시보드 디자인
- ✅ CPU, 메모리, 스레드 실시간 모니터링
- ✅ TypeScript로 타입 안정성 확보

## 🛠 기술 스택

### Frontend
- **Framework**: React 19.2 + TypeScript 5.9
- **Build Tool**: Vite 7.3
- **Charts**: Chart.js 4.4 + react-chartjs-2
- **WebSocket**: STOMP.js + SockJS
- **HTTP Client**: Axios
- **Styling**: Pure CSS

### Backend
- Spring Boot 3.x
- Spring Security + JWT
- Spring WebSocket (STOMP)
- Redis
- Micrometer
- JPA/Hibernate

## 📁 프로젝트 구조

```
monitoring-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── CpuChart.tsx           # CPU 차트 컴포넌트
│   │   ├── MemoryChart.tsx        # 메모리 차트 컴포넌트
│   │   ├── ThreadChart.tsx        # 스레드 차트 컴포넌트
│   │   ├── SystemInfo.tsx         # 시스템 정보 컴포넌트
│   │   ├── Dashboard.tsx          # 메인 대시보드
│   │   └── Login.tsx              # 로그인/회원가입
│   ├── services/
│   │   ├── WebSocketService.ts    # WebSocket 연결 관리
│   │   └── AuthService.ts         # 인증 관리 (JWT)
│   ├── types.ts                   # TypeScript 타입 정의
│   ├── App.tsx                    # 메인 앱 컴포넌트
│   ├── App.css                    # 앱 스타일
│   ├── main.tsx                   # 앱 엔트리 포인트
│   ├── index.css                  # 글로벌 스타일
│   └── vite-env.d.ts             # Vite 타입 정의
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 설치 및 실행

### 1. 로컬 개발 환경

#### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- 백엔드 서버 실행 중 (포트 8080)

#### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

애플리케이션이 다음 주소에서 실행됩니다:
- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:8080

### 2. Docker로 실행

```bash
# 이미지 빌드 및 컨테이너 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f frontend

# 중지
docker-compose down
```

Docker 실행 시 포트:
- 프론트엔드: http://localhost:3000

## ⚙️ 환경 설정

### 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

### .env 파일 내용

```env
# Backend API URL
VITE_API_URL=http://localhost:8080

# WebSocket URL
VITE_WS_URL=http://localhost:8080/ws-monitoring
```

**참고**: Vite에서는 환경 변수 앞에 `VITE_` 접두사가 필요합니다.

## 📡 API 엔드포인트

### 인증 API
```
POST /api/auth/register    # 회원가입
POST /api/auth/login       # 로그인
POST /api/auth/logout      # 로그아웃
POST /api/auth/refresh     # 토큰 갱신
```

### 모니터링 API (ADMIN만 접근 가능)
```
GET /api/monitoring/meterics/cpu      # CPU 메트릭
GET /api/monitoring/metrics/memory    # 메모리 메트릭
GET /api/monitoring/metrics/threads   # 스레드 메트릭
GET /api/monitoring/metrics/all       # 모든 메트릭
```

### WebSocket
```
연결: ws://localhost:8080/ws-monitoring
구독: /topic/metrics
주기: 2초마다 자동 전송
```

## 💡 사용 방법

### 1. 회원가입 및 로그인

1. 애플리케이션 접속
2. "Register" 버튼 클릭
3. Username, Email, Password 입력
4. 회원가입 완료 후 로그인

### 2. 대시보드 사용

로그인 후 자동으로 다음 기능이 활성화됩니다:

- **WebSocket 자동 연결**: 백엔드와 실시간 연결
- **2초마다 메트릭 업데이트**: 자동으로 최신 데이터 수신
- **4개의 차트**:
  - CPU 사용량 (시스템/프로세스)
  - 메모리 사용량 (MB/퍼센트)
  - JVM 스레드 통계
  - 시스템 정보

### 3. 주요 지표 설명

- **CPU**: 
  - System CPU: 전체 시스템 CPU 사용률
  - Process CPU: 현재 프로세스 CPU 사용률
  
- **Memory**: 
  - Used: 현재 사용 중인 메모리 (MB)
  - Max: 최대 사용 가능 메모리 (MB)
  - Percentage: 메모리 사용률 (%)

- **Threads**: 
  - Live: 활성 스레드 수
  - Daemon: 데몬 스레드 수
  - Peak: 최대 스레드 수

- **System**: 
  - OS 정보, 프로세서 수, JVM 메모리 상태

## 🔧 TypeScript 설정

프로젝트는 엄격한 TypeScript 설정을 사용합니다:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

## 📦 주요 의존성

### Production Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@stomp/stompjs": "^7.0.0",
  "sockjs-client": "^1.6.1",
  "axios": "^1.6.0",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0"
}
```

### Development Dependencies
```json
{
  "typescript": "~5.9.3",
  "vite": "^7.3.1",
  "@vitejs/plugin-react": "^5.1.1",
  "@types/react": "^19.2.7",
  "@types/sockjs-client": "^1.5.4"
}
```

## 🐛 트러블슈팅

### WebSocket 연결 실패
1. 백엔드 서버가 실행 중인지 확인
2. 백엔드의 CORS 설정 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. WebSocket URL이 올바른지 확인 (.env 파일)

### 인증 문제
1. JWT 토큰 만료 확인 (localStorage)
2. Authorization 헤더 형식 확인 ("Bearer {token}")
3. 브라우저 개발자 도구 Network 탭 확인

### 차트가 표시되지 않음
1. WebSocket 연결 상태 확인 (대시보드 상단)
2. 백엔드에서 메트릭이 전송되는지 로그 확인
3. 브라우저 콘솔에서 에러 확인

### 빌드 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 캐시 삭제
rm -rf node_modules/.tmp
npm run build
```

## 🔒 보안 고려사항

- JWT Secret은 환경 변수로 관리
- HTTPS 사용 권장 (프로덕션)
- CORS 정책 적절히 설정
- XSS 방지를 위한 입력 검증
- Rate Limiting 적용 고려

## 📈 성능 최적화

1. **차트 데이터 제한**: 최근 30개 포인트만 유지
2. **메모이제이션**: useCallback으로 불필요한 리렌더링 방지
3. **Vite 빌드**: 빠른 개발 서버와 최적화된 프로덕션 빌드
4. **코드 스플리팅**: Vite의 자동 코드 스플리팅
5. **타입 체크**: TypeScript로 런타임 에러 최소화

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 PR은 언제든 환영합니다!
