#!/usr/bin/env node

/**
 * HTTPS開発環境セットアップスクリプト
 * Meta Quest 3s などのVRデバイステスト用
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🔐 HTTPS開発環境のセットアップを開始します...\n');

// 証明書ディレクトリのパス
const certDir = path.join(process.cwd(), '.cert');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// IPアドレスを取得
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = ['localhost', '127.0.0.1', '::1'];

  Object.values(interfaces).forEach(iface => {
    iface.forEach(details => {
      if (details.family === 'IPv4' && !details.internal) {
        ips.push(details.address);
      }
    });
  });

  return ips;
}

// mkcertがインストールされているか確認
function checkMkcert() {
  try {
    execSync('mkcert --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// mkcertのインストール
function installMkcert() {
  console.log('📦 mkcertをインストールしています...');

  const platform = os.platform();

  try {
    if (platform === 'darwin') {
      // macOS
      console.log('  → Homebrewでインストール中...');
      execSync('brew install mkcert', { stdio: 'inherit' });
      execSync('brew install nss', { stdio: 'inherit' }); // Firefox対応
    } else if (platform === 'win32') {
      // Windows
      console.log('  → Chocolateyでインストール中...');
      execSync('choco install mkcert', { stdio: 'inherit' });
    } else {
      // Linux
      console.log('  → apt-getでインストール中...');
      execSync('sudo apt install libnss3-tools', { stdio: 'inherit' });
      execSync('brew install mkcert', { stdio: 'inherit' });
    }

    // mkcertを初期化
    console.log('  → mkcertを初期化中...');
    execSync('mkcert -install', { stdio: 'inherit' });

    console.log('✅ mkcertのインストールが完了しました\n');
    return true;
  } catch (error) {
    console.error('❌ mkcertの自動インストールに失敗しました');
    console.log('\n手動でインストールしてください:');
    console.log('  macOS: brew install mkcert');
    console.log('  Windows: choco install mkcert');
    console.log('  Linux: https://github.com/FiloSottile/mkcert#installation\n');
    return false;
  }
}

// 証明書の生成
function generateCertificates() {
  const ips = getLocalIPs();

  console.log('🔑 以下のアドレスに対して証明書を生成します:');
  ips.forEach(ip => console.log(`  • ${ip}`));
  console.log();

  // 証明書ディレクトリを作成
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  // mkcertで証明書を生成
  const ipString = ips.join(' ');
  const command = `mkcert -key-file ${keyPath} -cert-file ${certPath} ${ipString}`;

  try {
    console.log('⚙️  証明書を生成中...');
    execSync(command, { stdio: 'inherit' });
    console.log('✅ 証明書の生成が完了しました\n');
    return true;
  } catch (error) {
    console.error('❌ 証明書の生成に失敗しました:', error.message);
    return false;
  }
}

// vite.config.jsを更新
function updateViteConfig() {
  console.log('📝 vite.config.jsを更新中...');

  const configPath = path.join(process.cwd(), 'vite.config.js');

  if (!fs.existsSync(configPath)) {
    console.error('❌ vite.config.jsが見つかりません');
    return false;
  }

  let config = fs.readFileSync(configPath, 'utf-8');

  // すでにHTTPS設定がある場合はスキップ
  if (config.includes('https: {')) {
    console.log('ℹ️  HTTPS設定は既に存在します');
    return true;
  }

  // fs importを追加
  if (!config.includes("import fs from 'fs'")) {
    config = `import fs from 'fs'\n${config}`;
  }

  // server設定を更新
  const serverRegex = /server:\s*{([^}]*)}/;
  const serverMatch = config.match(serverRegex);

  if (serverMatch) {
    const serverContent = serverMatch[1];
    const httpsConfig = `
    https: {
      key: fs.readFileSync('.cert/key.pem'),
      cert: fs.readFileSync('.cert/cert.pem')
    },`;

    const newServerContent = serverContent + httpsConfig;
    config = config.replace(serverRegex, `server: {${newServerContent}}`);

    fs.writeFileSync(configPath, config);
    console.log('✅ vite.config.jsの更新が完了しました\n');
    return true;
  } else {
    console.error('❌ server設定が見つかりません');
    return false;
  }
}

// .gitignoreに証明書ディレクトリを追加
function updateGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    let gitignore = fs.readFileSync(gitignorePath, 'utf-8');

    if (!gitignore.includes('.cert')) {
      gitignore += '\n# SSL certificates\n.cert/\n';
      fs.writeFileSync(gitignorePath, gitignore);
      console.log('✅ .gitignoreに.certディレクトリを追加しました');
    }
  }
}

// メイン処理
async function main() {
  // mkcertの確認とインストール
  if (!checkMkcert()) {
    console.log('⚠️  mkcertがインストールされていません\n');
    const installed = installMkcert();
    if (!installed) {
      process.exit(1);
    }
  }

  // 証明書の生成
  if (!generateCertificates()) {
    process.exit(1);
  }

  // vite.config.jsの更新
  updateViteConfig();

  // .gitignoreの更新
  updateGitignore();

  // 完了メッセージ
  console.log('🎉 セットアップが完了しました！\n');
  console.log('以下のコマンドでHTTPS開発サーバーを起動できます:');
  console.log('  npm run dev\n');

  const ips = getLocalIPs();
  console.log('Quest 3s からは以下のURLでアクセスできます:');
  ips.forEach(ip => {
    if (!ip.includes('::1') && !ip.includes('127.0.0.1')) {
      console.log(`  https://${ip}:3002/vr-academy`);
    }
  });

  console.log('\n⚠️  初回アクセス時は証明書の警告が表示される場合があります。');
  console.log('  「詳細設定」→「安全でないサイトに進む」を選択してください。');
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('\n❌ エラーが発生しました:', error.message);
  process.exit(1);
});

// 実行
main();