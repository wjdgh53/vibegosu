#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ngrok 시작 중...');

// ngrok 실행
const ngrok = spawn('ngrok', ['http', '3000'], {
  stdio: 'inherit',
  shell: true,
});

ngrok.on('error', (error) => {
  console.error('❌ ngrok 실행 실패:', error.message);
  console.log('💡 ngrok이 설치되어 있는지 확인하세요: brew install ngrok');
  process.exit(1);
});

ngrok.on('exit', (code) => {
  console.log(`\n👋 ngrok 종료됨 (코드: ${code})`);
  process.exit(code);
});

// 프로세스 종료 시 ngrok도 함께 종료
process.on('SIGINT', () => {
  console.log('\n🛑 ngrok 종료 중...');
  ngrok.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  ngrok.kill();
  process.exit(0);
});

