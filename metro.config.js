// metro.config.js
// Extends default Expo Metro config to support:
//   .glb / .gltf — 3D model assets (served as binary)
//   .bin         — glTF binary buffers
//   three/examples/jsm — ES Module transfroms

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ── Asset Extensions: add GLB/GLTF so Metro bundles them ────────────────────
config.resolver.assetExts = [
  ...config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  'glb',
  'gltf',
  'bin',
  'hdr',
];

// ── ES Module Transforms for three.js JSM files ──────────────────────────────
// three/examples/jsm uses ES modules which Metro needs to transpile
const originalTransformIgnorePatterns = config.transformer?.transformIgnorePatterns ?? [
  'node_modules/(?!(expo|expo-.*|@expo|react-native|@react-native|react-native-.*)/)',
];

config.transformer = {
  ...config.transformer,
  transformIgnorePatterns: [
    // Allow Metro to transform three/examples/jsm (ES modules)
    'node_modules/(?!(expo|expo-.*|@expo|expo-three|react-native|@react-native|react-native-.*|three/examples/jsm)/)',
  ],
};

module.exports = config;
