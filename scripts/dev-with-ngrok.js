#!/usr/bin/env node

const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🚀 자동 개발 환경 시작 중...\n');

// ngrok 시작
console.log('1️⃣  ngrok 시작 중...');
const ngrok = spawn('ngrok', ['http', '3000'], {
  stdio: 'pipe',
  shell: true,
});

let ngrokStarted = false;

ngrok.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('started tunnel') || output.includes('Forwarding')) {
    ngrokStarted = true;
    console.log('✅ ngrok 시작됨\n');
    detectNgrokUrl();
  }
});

ngrok.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('ERR_NGROK')) {
    console.error('❌ ngrok 오류:', output);
  }
});

ngrok.on('error', (error) => {
  console.error('❌ ngrok 실행 실패:', error.message);
  console.log('💡 ngrok이 설치되어 있는지 확인하세요: brew install ngrok');
  console.log('💡 또는 수동으로 ngrok을 실행한 후 npm run dev를 실행하세요.\n');
  // ngrok 없이도 개발 서버는 시작
  startDevServer();
});

// ngrok URL 감지 및 .env.local 업데이트
async function detectNgrokUrl() {
  const maxRetries = 10;
  const retryDelay = 2000;
  
  console.log('2️⃣  ngrok URL 자동 감지 중...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get('http://127.0.0.1:4040/api/tunnels', {
        timeout: 1000,
      });
      
      if (response.data?.tunnels?.length > 0) {
        const httpsTunnel = response.data.tunnels.find(t => t.proto === 'https');
        const tunnel = httpsTunnel || response.data.tunnels[0];
        const ngrokUrl = tunnel.public_url;
        
        console.log(`✅ ngrok URL 감지됨: ${ngrokUrl}`);
        console.log('💡 웹훅 URL이 자동으로 이 ngrok URL을 사용합니다.\n');
        
        startDevServer();
        return;
      }
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.log('⚠️  ngrok URL을 자동으로 감지할 수 없습니다.');
  console.log('💡 수동으로 ngrok을 실행한 후 다시 시도하세요.\n');
  startDevServer();
}

// .env.local 파일은 수정하지 않음 - 런타임에서 자동 감지

// 개발 서버 시작
function startDevServer() {
  console.log('3️⃣  Next.js 개발 서버 시작 중...\n');
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });
  
  devServer.on('error', (error) => {
    console.error('❌ 개발 서버 시작 실패:', error);
  });
  
  // 프로세스 종료 시 정리
  process.on('SIGINT', () => {
    console.log('\n🛑 종료 중...');
    ngrok.kill();
    devServer.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    ngrok.kill();
    devServer.kill();
    process.exit(0);
  });
}

// 3초 후에도 ngrok이 시작되지 않으면 개발 서버만 시작
setTimeout(() => {
  if (!ngrokStarted) {
    console.log('⏳ ngrok 시작 대기 시간 초과. 개발 서버만 시작합니다.\n');
    startDevServer();
  }
}, 3000);

