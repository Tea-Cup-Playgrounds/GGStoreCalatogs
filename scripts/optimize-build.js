#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build optimization...\n');

// Step 1: Clean previous build
console.log('1. Cleaning previous build...');
try {
  execSync('npm run clean', { stdio: 'inherit' });
  console.log('✅ Clean completed\n');
} catch (error) {
  console.error('❌ Clean failed:', error.message);
  process.exit(1);
}

// Step 2: Run production build
console.log('2. Running production build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Analyze bundle sizes
console.log('3. Analyzing bundle sizes...');
const distPath = path.join(__dirname, '..', 'dist');
const files = fs.readdirSync(distPath);

const jsFiles = files.filter(file => file.endsWith('.js') && !file.endsWith('.map'));
const cssFiles = files.filter(file => file.endsWith('.css'));
const gzFiles = files.filter(file => file.endsWith('.gz'));

console.log('\n📊 Bundle Analysis:');
console.log('==================');

let totalJSSize = 0;
let totalCSSSize = 0;
let totalGZSize = 0;

jsFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  totalJSSize += stats.size;
  console.log(`📄 ${file}: ${sizeKB} KB`);
});

cssFiles.forEach(file => {
  const filePath = path.join(distPath, 'styles', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalCSSSize += stats.size;
    console.log(`🎨 ${file}: ${sizeKB} KB`);
  }
});

gzFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  totalGZSize += stats.size;
});

console.log('\n📈 Summary:');
console.log('===========');
console.log(`Total JS: ${(totalJSSize / 1024).toFixed(2)} KB`);
console.log(`Total CSS: ${(totalCSSSize / 1024).toFixed(2)} KB`);
console.log(`Total Compressed: ${(totalGZSize / 1024).toFixed(2)} KB`);
console.log(`Compression Ratio: ${((1 - totalGZSize / (totalJSSize + totalCSSSize)) * 100).toFixed(1)}%`);

// Step 4: Check for optimization opportunities
console.log('\n🔍 Optimization Recommendations:');
console.log('=================================');

const largeFiles = jsFiles.filter(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  return stats.size > 100 * 1024; // Files larger than 100KB
});

if (largeFiles.length > 0) {
  console.log('⚠️  Large files detected (>100KB):');
  largeFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   - ${file}: ${sizeKB} KB`);
  });
  console.log('   Consider code splitting or lazy loading for these files.');
} else {
  console.log('✅ All files are optimally sized (<100KB)');
}

// Check if service worker exists
const swPath = path.join(distPath, 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service worker found - caching enabled');
} else {
  console.log('⚠️  Service worker not found - consider adding for better caching');
}

// Check compression
if (gzFiles.length > 0) {
  console.log(`✅ Gzip compression enabled (${gzFiles.length} compressed files)`);
} else {
  console.log('⚠️  No compressed files found - ensure compression is working');
}

console.log('\n🎉 Build optimization completed!');
console.log('\n📝 Next steps:');
console.log('- Test the build locally: npm run serve');
console.log('- Deploy the dist/ folder to your hosting provider');
console.log('- Monitor performance with browser dev tools');
console.log('- Consider setting up a CDN for static assets');