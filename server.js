#!/usr/bin/env node
// server.js — FastMCP 기반 MCP 서버

import dotenv from 'dotenv';
import { FastMCP } from 'fastmcp';                // 从 fastmcp 导入 FastMCP 类
import { z } from 'zod';                            // 用于定义参数 schema
import analyze from './index.js';                  // 确保 index.js export default analyze

dotenv.config();

// 启动 FastMCP 实例
const server = new FastMCP({
  name: 'riot_server',      // 工具服务器名称
  version: '1.0.0'
});

// 注册 analyze 工具，直接调用你的分析逻辑
server.addTool({
  name: 'analyze',
  description: 'LoL 전적분석 또는 챔피언추천',
  parameters: z.object({
    riotId:      z.string().describe('예: Hideonbush#KR1'),
    requestType: z.enum(['전적분석', '챔피언추천']).describe('요청 타입')
  }),
  execute: analyze   // 当收到请求时，FastMCP 会调用 index.js 导出的 analyze(params)
});

// 使用 stdio 作为 transport，与 Claude Desktop 通信
server.start({ transportType: 'stdio' });

console.error('✅ riot_server MCP started via FastMCP — waiting for requests…');
