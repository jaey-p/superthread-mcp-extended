# Bun 기반 이미지 사용
FROM oven/bun:1 as base
WORKDIR /app

# 의존성 설치를 위한 파일 복사
COPY package.json bun.lock* ./

# 의존성 설치
RUN bun install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 8787

# Standalone Node.js HTTP 서버 실행 (Docker 환경용)
# wrangler dev 대신 Node.js HTTP 서버로 실행하여 Docker 네트워크 호환성 확보
CMD ["bun", "run", "start:standalone"]
