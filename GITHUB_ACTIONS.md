# GitHub Actions 설정 가이드

## 📋 필요한 Secrets 설정

GitHub Repository → Settings → Secrets and variables → Actions

### Docker Hub 사용 시
1. **DOCKER_USERNAME**: Docker Hub 사용자명
2. **DOCKER_PASSWORD**: Docker Hub 비밀번호 (또는 Access Token)

## 🚀 동작 방식

### 트리거
- `main` 브랜치에 push할 때마다 자동 실행

### 실행 과정
1. ✅ 코드 체크아웃
2. ✅ Docker Buildx 설정
3. ✅ Docker Hub 로그인
4. ✅ Docker 이미지 빌드
5. ✅ Docker Hub에 푸시

### 생성되는 이미지 태그
- `your-username/monitoring-frontend:latest`
- `your-username/monitoring-frontend:abc123` (커밋 SHA)

## 🔧 이미지 이름 변경

`.github/workflows/docker-build.yml` 파일:

```yaml
env:
  DOCKER_IMAGE_NAME: monitoring-frontend  # 👈 여기를 원하는 이름으로 변경
```

## 📥 이미지 사용

빌드된 이미지 다운로드:
```bash
docker pull your-username/monitoring-frontend:latest
```

실행:
```bash
docker run -p 3000:80 your-username/monitoring-frontend:latest
```

## 🐛 트러블슈팅

### 1. Docker Hub 로그인 실패
- Secrets 설정 확인
- Docker Hub 비밀번호 대신 **Access Token** 사용 권장

### 2. 빌드 실패
- Actions 탭에서 로그 확인
- Dockerfile 문법 확인

### 3. 푸시 권한 없음
- Docker Hub에 레포지토리 생성 확인
- 레포지토리 이름이 `DOCKER_IMAGE_NAME`과 일치하는지 확인

## 💡 Docker Hub Access Token 생성

1. Docker Hub 로그인
2. Account Settings → Security
3. New Access Token
4. 생성된 토큰을 `DOCKER_PASSWORD`에 저장

## 📝 GitHub Container Registry 사용하려면?

Docker Hub 대신 GitHub에서 제공하는 레지스트리 사용:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

# ...

- name: Login to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

이 경우 Secrets 설정 불필요! (자동으로 `GITHUB_TOKEN` 사용)
