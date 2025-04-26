#!/usr/bin/env node
// cli.js
import { analyzeUserRequest } from './index.js';
import fs from 'node:fs';

// 把整段 stdin 读完（Claude 会一次性传入 JSON）
let input = '';
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', async () => {
  try {
    const args = JSON.parse(input);
    const result = await analyzeUserRequest(args);   // 调用你已实现的函数
    process.stdout.write(JSON.stringify(result));    // 输出给 Claude
  } catch (err) {
    const errorMsg = { error: err.message || String(err) };
    process.stdout.write(JSON.stringify(errorMsg));
    process.exit(1);
  }
});