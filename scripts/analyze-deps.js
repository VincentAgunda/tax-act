#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

// Get all dependencies
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

console.log('📦 Dependency Analysis Report\n');
console.log('=====================================\n');

// Heavy dependencies to review
const heavyDeps = [
  '@mui/material',
  '@mui/icons-material', 
  'framer-motion',
  'firebase',
  'react-pdf',
  'pdfjs-dist',
  'quill',
  'react-quill-new'
];

console.log('🚀 Heavy Dependencies (consider lazy loading):');
heavyDeps.forEach(dep => {
  if (allDeps[dep]) {
    console.log(`  - ${dep}: ${allDeps[dep]}`);
  }
});

// Potential alternatives or optimizations
console.log('\n💡 Optimization Suggestions:');
console.log('  - @mui/material: Consider using tree shaking or individual imports');
console.log('  - framer-motion: Use lazy loading for animations');
console.log('  - react-pdf: Load only when needed (PDF viewer)');
console.log('  - Firebase: Use modular imports to reduce bundle size');
console.log('  - Multiple Quill packages: Consolidate to one implementation');

// Scan for actual usage (basic check)
console.log('\n🔍 Usage Analysis:');
const srcDir = path.join(__dirname, '..', 'src');

function scanForImports(dir, deps) {
  const results = {};
  
  function scanFile(filePath) {
    if (!fs.statSync(filePath).isFile() || !filePath.match(/\.(js|jsx|ts|tsx)$/)) {
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    deps.forEach(dep => {
      if (content.includes(`from '${dep}'`) || content.includes(`from "${dep}"`)) {
        if (!results[dep]) results[dep] = [];
        results[dep].push(filePath);
      }
    });
  }
  
  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath);
      } else {
        scanFile(fullPath);
      }
    });
  }
  
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
  
  return results;
}

const usage = scanForImports(srcDir, Object.keys(allDeps));

// Find potentially unused dependencies
const unused = Object.keys(allDeps).filter(dep => !usage[dep]);
if (unused.length > 0) {
  console.log('\n⚠️  Potentially Unused Dependencies:');
  unused.forEach(dep => {
    console.log(`  - ${dep}`);
  });
  console.log('\n  Note: This is a basic analysis. Some deps might be used indirectly.');
}

// Show most used dependencies
const mostUsed = Object.entries(usage)
  .sort(([,a], [,b]) => b.length - a.length)
  .slice(0, 5);

if (mostUsed.length > 0) {
  console.log('\n📊 Most Used Dependencies:');
  mostUsed.forEach(([dep, files]) => {
    console.log(`  - ${dep}: used in ${files.length} files`);
  });
}

// Bundle size recommendations
console.log('\n🎯 Bundle Size Optimization Tips:');
console.log('  1. Use dynamic imports for heavy components');
console.log('  2. Enable tree shaking in your bundler');
console.log('  3. Consider using lighter alternatives for UI libraries');
console.log('  4. Use code splitting for different routes');
console.log('  5. Optimize images and assets');

console.log('\n📈 To analyze bundle size:');
console.log('  npm run analyze');

console.log('\n✅ Analysis complete!');