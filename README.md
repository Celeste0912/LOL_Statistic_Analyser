# League of Legends MCP 분석 도구

이 프로젝트는 리그 오브 레전드 사용자의 전적을 분석하고 챔피언을 추천하는 MCP(Model Context Protocol) 도구입니다. Claude와 같은 AI 모델이 Riot Games API와 상호작용할 수 있게 해줍니다.

## 주요 기능

- 소환사 전적 분석: KDA, 승률, 주 챔피언 등의 통계 제공
- 챔피언 추천: 사용자의 게임 스타일과 숙련도에 맞는 챔피언 추천
- Claude Desktop 통합: AI가 직접 전적 분석 및 추천을 수행

## 설치 방법

### 요구 사항

- Node.js v16 이상
- Riot Games API 키 ([개발자 포털](https://developer.riotgames.com/)에서 획득)

### 설치

1. 저장소 클론
```bash
git clone https://github.com/Celeste0912/LOL_Statistic_Analyser
cd lol-mcp
```

2. 의존성 설치
```bash
npm install
```

3. `.env` 파일 생성 및 API 키 설정
```
RIOT_API_KEY=RGAPI-your-api-key-here
PORT=8080
```

## 사용 방법

### 서버 실행

```bash
npm start
```

서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 명령행에서 테스트

```bash
# 전적 분석
node index.js "Hideonbush#KR1" "전적분석"

# 챔피언 추천
node index.js "Hideonbush#KR1" "챔피언추천"
```

### Claude Desktop 설정

1. Claude Desktop 앱에서 설정 메뉴로 이동
2. MCP 섹션에서 다음 설정을 추가:

```json
{
  "schema_version": 1,
  "mcpServers": {
    "riot_server": {
      "command": "node",
      "args": ["C:\\Users\\YourUsername\\path\\to\\lol mcp\\server.js"],
      "env": {
        "RIOT_API_KEY": "RGAPI-your-api-key-here"
      }
    }
  }
}
```

3. 설정을 저장하고 Claude에게 "소환사 [Riot ID]의 전적을 분석해줘"와 같은 요청을 하세요.

## 프로젝트 구조

- `index.js`: Riot API 관련 핵심 함수 및 분석 로직
- `cli.js`: 명령행 인터페이스
- `server.js`: MCP 서버 구현
- `package.json`: 프로젝트 의존성 및 스크립트

## API 레퍼런스

이 프로젝트는 다음 Riot Games API 엔드포인트를 활용합니다:

- 계정 정보 조회: `/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}`
- 소환사 정보: `/lol/summoner/v4/summoners/by-puuid/{puuid}`
- 매치 기록: `/lol/match/v5/matches/by-puuid/{puuid}/ids`
- 매치 상세 정보: `/lol/match/v5/matches/{matchId}`
- 챔피언 숙련도: `/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}`

## 라이선스

ISC

## 기여 방법

1. 이 저장소를 포크합니다
2. 새 기능 브랜치를 만듭니다 (`git checkout -b feature/amazing-feature`)
3. 변경 사항을 커밋합니다 (`git commit -m '새로운 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 주의 사항

- Riot Games API는 요청 제한이 있습니다. 과도한 사용은 API 차단을 초래할 수 있습니다.
- API 키는 개인 정보이므로 공유하지 마세요.
- 이 프로젝트는 Riot Games와 공식적으로 연결되어 있지 않습니다.