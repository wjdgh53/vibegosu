#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * ngrok URL 자동 감지 및 .env.local 업데이트
 */
async function detectAndUpdateNgrok() {
  const maxRetries = 30; // 최대 30초 대기
  const retryDelay = 1000; // 1초마다 재시도
  
  console.log('🔍 ngrok URL 자동 감지 중...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get('http://127.0.0.1:4040/api/tunnels', {
        timeout: 1000,
      });
      
      if (response.data && response.data.tunnels && response.data.tunnels.length > 0) {
        // https 터널 찾기
        const httpsTunnel = response.data.tunnels.find(
          (tunnel) => tunnel.proto === 'https'
        );
        
        if (httpsTunnel) {
          const ngrokUrl = httpsTunnel.public_url;
          console.log(`✅ ngrok URL 감지됨: ${ngrokUrl}`);
          
          // .env.local 파일 업데이트
          updateEnvFile(ngrokUrl);
          return ngrokUrl;
        }
      }
    } catch (error) {
      // ngrok이 아직 시작되지 않았거나 접근 불가
      if (i < maxRetries - 1) {
        process.stdout.write(`\r⏳ ngrok 대기 중... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.log('\n⚠️  ngrok을 감지할 수 없습니다. 수동으로 실행해주세요: ngrok http 3000');
  return null;
}

function updateEnvFile(ngrokUrl) {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  // 기존 .env.local 파일 읽기
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // NEXT_PUBLIC_BASE_URL 업데이트 또는 추가
  if (envContent.includes('NEXT_PUBLIC_BASE_URL=')) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_BASE_URL=.*/g,
      `NEXT_PUBLIC_BASE_URL=${ngrokUrl}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_BASE_URL=${ngrokUrl}\n`;
  }
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`📝 .env.local 파일 업데이트 완료`);
}

// 실행
detectAndUpdateNgrok().catch(console.error);

