#!/usr/bin/env node
// index.js — Riot API 전적 분석 및 챔피언 추천 (Node.js v22 호환)

// 환경 변수 로드
import dotenv from 'dotenv';
dotenv.config();

// Riot API 키 검증
const apiKey = process.env.RIOT_API_KEY;
if (!apiKey || !apiKey.startsWith('RGAPI-')) {
  throw new Error('.env 파일에 RIOT_API_KEY가 없거나 유효하지 않습니다.');
}

// 지역 설정
const REGION = 'kr';
const CONTINENT = 'asia';

// node-fetch 동적 import (ESM 환경에서 CommonJS 호환)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Riot API GET 요청 함수
 * - 429 응답 시 지수 백오프 + 최대 3회 재시도
 */
async function riotGet(url, retry = 0) {
  try {
    const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } });
    if (res.status === 429 && retry < 3) {
      const wait = parseInt(res.headers.get('retry-after') || '1', 10) + 1;
      await new Promise(r => setTimeout(r, wait * 1000));
      return riotGet(url, retry + 1);
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${res.statusText} → ${text}`);
    }
    return res.json();
  } catch (err) {
    if (retry < 3) {
      await new Promise(r => setTimeout(r, 1000 * (retry + 1)));
      return riotGet(url, retry + 1);
    }
    throw err;
  }
}

// Riot API 헬퍼 함수들
export async function getPuuidByRiotId(gameName, tagLine) {
  return riotGet(
    `https://${CONTINENT}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
}
export async function getSummonerByPuuid(puuid) {
  return riotGet(
    `https://${REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
  );
}
export async function getMatchHistory(puuid, count = 20) {
  return riotGet(
    `https://${CONTINENT}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${Math.min(100, Math.max(1, count))}`
  );
}
export async function getChampionMastery(puuid) {
  return riotGet(
    `https://${REGION}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`
  );
}

/**
 * 전적 분석 및 챔피언 추천 메인 함수
 * @param {{ riotId: string, requestType: '전적분석' | '챔피언추천' }} input
 * @returns {Promise<string>} 분석 결과 문자열
 */
export default async function analyzeUserRequest(input) {
  const { riotId, requestType } = input;
  const [gameName, tagLine] = riotId.split('#');

  try {
    // 소환사 PUUID 및 정보 조회
    const account = await getPuuidByRiotId(gameName, tagLine);
    const summoner = await getSummonerByPuuid(account.puuid);

    // 1) 전적 분석 로직
    if (requestType === '전적분석') {
      const matchIds = await getMatchHistory(account.puuid, 10);
      console.log(`조회된 경기 수: ${matchIds.length}`);

      const matchSummaries = await Promise.all(
        matchIds.map(id =>
          riotGet(`https://${CONTINENT}.api.riotgames.com/lol/match/v5/matches/${id}`)
        )
      );

      // 통계 집계
      const champCount = {};
      let wins = 0, kills = 0, deaths = 0, assists = 0;
      for (const match of matchSummaries) {
        const player = match.info.participants.find(p => p.puuid === account.puuid);
        if (player) {
          champCount[player.championName] = (champCount[player.championName] || 0) + 1;
          if (player.win) wins++;
          kills += player.kills;
          deaths += player.deaths;
          assists += player.assists;
        }
      }

      // 결과 계산
      const sortedChamps = Object.entries(champCount).sort((a, b) => b[1] - a[1]);
      const kda = deaths === 0 ? 'Perfect' : ((kills + assists) / deaths).toFixed(2);
      const winRate = ((wins / matchSummaries.length) * 100).toFixed(1);

      // 최종 보고 메시지 생성
      return `소환사 ${summoner.name} 전적 분석:\n` +
             `- 최근 ${matchSummaries.length}게임 승률: ${winRate}%\n` +
             `- K/D/A: ${kills}/${deaths}/${assists} (평균 KDA: ${kda})\n` +
             `- 주 챔피언: ${sortedChamps.slice(0,3).map(([c,n]) => `${c}(${n}판)`).join(', ')}\n` +
             `- 플레이 스타일: ${deaths/matchSummaries.length < 3 ? '안정적' : '공격적'}\n` +
             `- 소환사 레벨: ${summoner.summonerLevel}`;
    }

    // 2) 챔피언 추천 로직
    if (requestType === '챔피언추천') {
      const mastery = await getChampionMastery(account.puuid);
      const top3 = mastery.slice(0,3);
      let rec = `소환사 ${summoner.name}님께 추천 챔피언:\n`;
      top3.forEach(champ => {
        rec += `- ${champ.championName} (숙련도 ${champ.championPoints})\n`;
      });
      rec += `\n추천 아이템:\n` +
             `- 핵심: 신화급 아이템 우선\n` +
             `- 시야 확보: 제어 와드 사용\n` +
             `- 상황별 방어/공격 아이템 선택`;
      return rec;
    }

    // 지원하지 않는 요청 처리
    return '지원하지 않는 요청 유형입니다. 전적분석 또는 챔피언추천만 지원합니다.';
  } catch (err) {
    return `❌ 오류 발생: ${err.message}`;
  }
}