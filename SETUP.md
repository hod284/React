# 🚨 처음 프로젝트 설정 시 필수 단계

## 1. package-lock.json 생성

```bash
# 로컬에서 한 번 실행
npm install
```

이 명령어를 실행하면 `package-lock.json` 파일이 생성됩니다.

## 2. Git에 커밋

```bash
git add package-lock.json
git commit -m "Add package-lock.json"
git push origin main
```

## 왜 필요한가?

- `npm ci`는 `package-lock.json`을 기반으로 정확히 같은 버전 설치
- Docker 빌드 시 재현 가능한 빌드 보장
- 의존성 버전 충돌 방지

## 참고

만약 `package-lock.json`이 없으면:
- Dockerfile이 `npm install` 사용 (자동 생성)
- 하지만 빌드마다 다른 버전이 설치될 수 있음
