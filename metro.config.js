const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Firebase Web SDK 互換性設定
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// functions ディレクトリを完全に除外（Cloud Functions用のコードをバンドルしない）
const functionsPath = path.resolve(__dirname, 'functions');
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  new RegExp(`^${functionsPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/.*)?$`),
];

// watchFoldersからも除外
config.watchFolders = (config.watchFolders || []).filter(
  (folder) => !folder.includes('functions')
);

// resolverがfunctionsを見ないようにする
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
