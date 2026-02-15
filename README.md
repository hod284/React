# 모니터링 대시보드 프론트엔드

Spring Boot 백엔드와 연동되는 실시간 서버 모니터링 React 대시보드입니다.

## 🚀 기술 스택

- **React 18** with TypeScript
- **React Router v6** - 라우팅
- **Axios** - HTTP 클라이언트
- **Recharts** - 실시간 차트
- **STOMP.js + SockJS** - WebSocket 통신
- **Docker** - 컨테이너화

## 📋 주요 기능

### 🔐 인증
- JWT 기반 로그인/회원가입
- 자동 토큰 갱신
- 관리자 권한 관리

### 📊 실시간 모니터링
- **CPU 모니터링**: 시스템/프로세스 CPU 사용률
- **메모리 모니터링**: Heap/Non-Heap 메모리 사용량
- **쓰레드 모니터링**: 활성/데몬/Peak 쓰레드 수
- **실시간 차트**: 60개 데이터 포인트 히스토리

### 🎨 UI/UX
- 다크 테마
- 그라디언트 효과
- 애니메이션
- 반응형 디자인

## 🛠️ 로컬 개발

### 1. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 내용:
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=http://localhost:8080
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm start
```

브라우저에서 http://localhost:3000 접속

**중요**: 백엔드 서버가 http://localhost:8080 에서 실행 중이어야 합니다!

## 🐳 Docker로 실행

### 이미지 빌드
```bash
docker build -t monitoring-frontend .
```

### 컨테이너 실행
```bash
docker run -p 3000:80 monitoring-frontend
```

### Docker Compose 사용
```bash
docker-compose up -d
```

## 📦 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build/` 폴더에 생성됩니다.

## 🔗 백엔드 연동

### API 엔드포인트
프론트엔드는 다음 백엔드 API를 호출합니다:

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/monitoring/meterics/cpu` - CPU 메트릭
- `GET /api/monitoring/metrics/memory` - 메모리 메트릭
- `GET /api/monitoring/metrics/threads` - 쓰레드 메트릭

### WebSocket
- 연결: `ws://localhost:8080/ws-monitoring`
- 구독: `/topic/metrics`

### 백엔드 요구사항

백엔드 서버는 다음을 제공해야 합니다:
1. Spring Boot REST API (포트 8080)
2. WebSocket STOMP 엔드포인트
3. JWT 인증
4. CORS 설정 (http://localhost:3000 허용)

## 📁 프로젝트 구조

```
monitoring-frontend/
├── public/              # 정적 파일
│   └── index.html
├── src/
│   ├── components/      # 재사용 컴포넌트
│   │   ├── ChartCard.tsx
│   │   ├── DetailLayout.tsx
│   │   └── MetricCard.tsx
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CPUDetailPage.tsx
│   │   ├── MemoryDetailPage.tsx
│   │   └── ThreadDetailPage.tsx
│   ├── services/       # API & WebSocket
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── styles/         # CSS
│   ├── types/          # TypeScript 타입
│   ├── App.tsx
│   └── index.tsx
├── Dockerfile          # Docker 이미지 정의
├── docker-compose.yml  # Docker Compose 설정
├── nginx.conf          # Nginx 설정
├── package.json
├── tsconfig.json
└── README.md
```

## 🌐 GitHub Actions

`.github/workflows/docker-build.yml` 파일을 통해 자동 빌드됩니다:

### 트리거
- `main` 브랜치에 push
- `develop` 브랜치에 push
- Pull Request 생성

### 동작
1. TypeScript 타입 체크
2. 빌드 테스트
3. Docker 이미지 빌드
4. GitHub Container Registry에 푸시

### 생성되는 이미지
- `ghcr.io/your-username/your-repo:latest` (main 브랜치)
- `ghcr.io/your-username/your-repo:main-<sha>` (커밋별)

## 🔧 환경 설정

### 로컬 개발 환경
`.env` 파일:
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=http://localhost:8080
```

### 프로덕션 환경
`.env.production` 파일:
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=https://api.yourdomain.com
```

### 스테이징 환경
`.env.staging` 파일:
```env
REACT_APP_API_URL=https://staging-api.yourdomain.com
REACT_APP_WS_URL=https://staging-api.yourdomain.com
```

### Docker 환경
Docker 빌드 시 환경 변수 전달:
```bash
docker build \
  --build-arg REACT_APP_API_URL=https://api.yourdomain.com \
  --build-arg REACT_APP_WS_URL=https://api.yourdomain.com \
  -t monitoring-frontend .
```

또는 docker-compose.yml에서:
```yaml
services:
  frontend:
    build:
      context: .
      args:
        REACT_APP_API_URL: https://api.yourdomain.com
        REACT_APP_WS_URL: https://api.yourdomain.com
```

### 환경 변수 우선순위
1. `.env.local` (git에 커밋하지 않음, 로컬 오버라이드)
2. `.env.production`, `.env.staging` (환경별)
3. `.env` (기본값)
4. 코드의 fallback 값

### Nginx 프록시

`nginx.conf`에서 백엔드 프록시 설정:
```nginx
location /api {
    proxy_pass http://your-backend-host:8080;
}
```

## 🐛 트러블슈팅

### WebSocket 연결 실패
- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인
- 방화벽 포트 8080 개방 확인

### API 호출 실패
- 백엔드 서버 상태 확인: `curl http://localhost:8080/actuator/health`
- 네트워크 탭에서 요청/응답 확인
- CORS 에러 확인

### Docker 빌드 실패
```bash
# 캐시 없이 재빌드
docker build --no-cache -t monitoring-frontend .

# 로그 확인
docker logs <container-id>
```

## 📝 라이선스

MIT

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
