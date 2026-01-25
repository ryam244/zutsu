/**
 * アイコン生成スクリプト
 * SVGからPNGアイコンを生成する
 *
 * 使用方法: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// アイコン設定
const icons = [
  {
    input: 'icon.svg',
    outputs: [
      { name: 'icon.png', size: 1024 },
    ],
  },
  {
    input: 'splash-icon.svg',
    outputs: [
      { name: 'splash-icon.png', size: 200 },
    ],
  },
  {
    input: 'adaptive-icon.svg',
    outputs: [
      { name: 'adaptive-icon.png', size: 1024 },
    ],
  },
];

// 通知アイコン（白モノクロ）
const notificationIconSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(18, 18) scale(0.6)">
    <path
      d="M25 25 H75 L35 65 H75 M35 65 Q50 45 65 65 T95 65"
      fill="none"
      stroke="white"
      stroke-width="12"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>
`;

// ファビコン
const faviconSvg = `
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e0f7fa"/>
      <stop offset="100%" style="stop-color:#30abe8"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="8" fill="url(#bg-gradient)"/>
  <g transform="translate(6, 6) scale(0.36)">
    <path
      d="M25 25 H75 L35 65 H75 M35 65 Q50 45 65 65 T95 65"
      fill="none"
      stroke="white"
      stroke-width="14"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>
`;

async function generateIcons() {
  console.log('🎨 アイコン生成を開始します...\n');

  // SVGファイルからPNG生成
  for (const icon of icons) {
    const inputPath = path.join(ASSETS_DIR, icon.input);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${icon.input} が見つかりません。スキップします。`);
      continue;
    }

    for (const output of icon.outputs) {
      const outputPath = path.join(ASSETS_DIR, output.name);
      try {
        await sharp(inputPath)
          .resize(output.size, output.size)
          .png()
          .toFile(outputPath);
        console.log(`✅ ${output.name} (${output.size}x${output.size}) を生成しました`);
      } catch (error) {
        console.error(`❌ ${output.name} の生成に失敗: ${error.message}`);
      }
    }
  }

  // 通知アイコン（透過PNG）
  try {
    const notificationPath = path.join(ASSETS_DIR, 'notification-icon.png');
    await sharp(Buffer.from(notificationIconSvg))
      .resize(96, 96)
      .png()
      .toFile(notificationPath);
    console.log('✅ notification-icon.png (96x96) を生成しました');
  } catch (error) {
    console.error(`❌ notification-icon.png の生成に失敗: ${error.message}`);
  }

  // ファビコン
  try {
    const faviconPath = path.join(ASSETS_DIR, 'favicon.png');
    await sharp(Buffer.from(faviconSvg))
      .resize(48, 48)
      .png()
      .toFile(faviconPath);
    console.log('✅ favicon.png (48x48) を生成しました');
  } catch (error) {
    console.error(`❌ favicon.png の生成に失敗: ${error.message}`);
  }

  console.log('\n🎉 アイコン生成が完了しました！');
}

generateIcons().catch(console.error);
