#!/usr/bin/env node
// server.js — FastMCP 기반 MCP 서버

import dotenv from 'dotenv';
import { FastMCP } from 'fastmcp';                // FastMCP 클래스 가져오기
import { z } from 'zod';                          // 파라미터 스키마 정의용
import analyze from './index.js';                // index.js의 analyze 함수 불러오기

dotenv.config();

// FastMCP 인스턴스 초기화
const server = new FastMCP({
  name: 'riot_server',      // 서버 이름
  version: '1.0.0'          // 버전
});

// analyze 도구 등록
server.addTool({
  name: 'analyze',
  description: 'LoL 전적 분석 또는 챔피언 추천',
  parameters: z.object({
    riotId:      z.string().describe('예: Hideonbush#KR1'),
    requestType: z.enum(['전적분석', '챔피언추천']).describe('요청 타입')
  }),
  execute: analyze         // analyze 함수 실행
});

// stdio를 통한 통신 시작
server.start({ transportType: 'stdio' });

console.error('✅ riot_server MCP 서버 시작 — 요청 대기 중…');