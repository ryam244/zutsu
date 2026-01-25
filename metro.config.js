const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Firebase Web SDK 互換性設定
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// functions ディレクトリを除外（Cloud Functions用のコードをバンドルしない）
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /functions\/.*/,
  /.*\/functions\/.*/,
];

module.exports = config;
