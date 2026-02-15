# Docker 빌드 에러 트러블슈팅

## 🚨 "npm install" 실패 시

### 원인
1. **의존성 충돌** - peer dependency 문제
2. **Node.js 버전** - 호환되지 않는 버전
3. **메모리 부족** - GitHub Actions runner 메모리 제한
4. **네트워크 문제** - npm registry 연결 실패

### 해결 방법

#### 방법 1: 간단한 Dockerfile 사용 (권장) ✅

```bash
# Dockerfile 대신 Dockerfile.simple 사용
docker build -f Dockerfile.simple -t monitoring-frontend .
```

GitHub Actions에서:
```yaml
# .github/workflows/docker-build.yml 수정
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile.simple  # 👈 이 줄 추가
    push: true
```

#### 방법 2: 로컬에서 먼저 테스트

```bash
# 1. 로컬에서 Docker 빌드 테스트
docker build -t monitoring-frontend .

# 2. 에러 로그 자세히 보기
docker build --no-cache --progress=plain -t monitoring-frontend .

# 3. 특정 단계까지만 빌드
docker build --target builder -t monitoring-frontend-builder .
```

#### 방법 3: package.json 의존성 정리

일부 패키지가 충돌할 수 있으니 최소화:

```bash
# 로컬에서
npm install --legacy-peer-deps
npm audit fix --force
```

#### 방법 4: Node.js 버전 변경

Dockerfile에서:
```dockerfile
# Node 18 대신 16 사용
FROM node:16-alpine AS builder
```

또는:
```dockerfile
# Node 20 사용
FROM node:20-alpine AS builder
```

## 🔍 자세한 에러 로그 확인

### GitHub Actions에서:
1. Actions 탭 → 실패한 workflow 클릭
2. "Build and push Docker image" 단계 확장
3. 전체 로그 다운로드

### 로컬에서:
```bash
# verbose 모드
docker build --progress=plain --no-cache -t monitoring-frontend . 2>&1 | tee build.log
```

## 🎯 가장 확실한 방법

### 사전 빌드된 파일 사용

1. **로컬에서 빌드**
```bash
npm install
npm run build
```

2. **빌드된 파일만 Docker에 복사**

Dockerfile.prebuild:
```dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. **빌드 & 푸시**
```bash
docker build -f Dockerfile.prebuild -t monitoring-frontend .
docker push your-username/monitoring-frontend:latest
```

## 📝 체크리스트

빌드 전 확인사항:
- [ ] Node.js 버전 호환 확인 (16, 18, 20)
- [ ] package.json에 모든 의존성 있는지 확인
- [ ] 로컬에서 `npm install` 성공하는지 확인
- [ ] 로컬에서 `npm run build` 성공하는지 확인
- [ ] Docker Hub 로그인 상태 확인
- [ ] Secrets 설정 확인

## 🆘 여전히 실패한다면?

다음 정보를 확인해주세요:
1. GitHub Actions 에러 로그 전체
2. 로컬 빌드 결과 (`npm install` 성공 여부)
3. Node.js 버전 (`node -v`)
4. npm 버전 (`npm -v`)
