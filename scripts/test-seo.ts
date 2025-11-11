#!/usr/bin/env ts-node
/**
 * SEO Testing Script
 * Tests SEO meta tags and image accessibility after deployment
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist', 'index.html');

interface SEOCheck {
  name: string;
  selector: string;
  required: boolean;
  found: boolean;
  value?: string;
}

/**
 * Check if meta tags exist in HTML
 */
function checkMetaTags(html: string): SEOCheck[] {
  const checks: SEOCheck[] = [
    // Standard meta tags
    { name: 'Title', selector: '<title>', required: true, found: false },
    { name: 'Meta Description', selector: 'name="description"', required: true, found: false },
    { name: 'Meta Keywords', selector: 'name="keywords"', required: false, found: false },
    { name: 'Canonical URL', selector: 'rel="canonical"', required: true, found: false },
    
    // Open Graph tags
    { name: 'OG Type', selector: 'property="og:type"', required: true, found: false },
    { name: 'OG Title', selector: 'property="og:title"', required: true, found: false },
    { name: 'OG Description', selector: 'property="og:description"', required: true, found: false },
    { name: 'OG Image', selector: 'property="og:image"', required: true, found: false },
    { name: 'OG URL', selector: 'property="og:url"', required: true, found: false },
    
    // Twitter Card tags
    { name: 'Twitter Card', selector: 'name="twitter:card"', required: true, found: false },
    { name: 'Twitter Title', selector: 'name="twitter:title"', required: true, found: false },
    { name: 'Twitter Description', selector: 'name="twitter:description"', required: true, found: false },
    { name: 'Twitter Image', selector: 'name="twitter:image"', required: true, found: false },
  ];

  // Perform checks
  checks.forEach(check => {
    if (html.includes(check.selector)) {
      check.found = true;
      
      // Try to extract value
      if (check.selector.includes('title')) {
        const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (match) check.value = match[1].trim();
      } else if (check.selector.includes('name="description"')) {
        const match = html.match(/name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (match) check.value = match[1].trim();
      } else if (check.selector.includes('og:image') || check.selector.includes('twitter:image')) {
        const match = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || 
                     html.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
        if (match) check.value = match[1].trim();
      }
    }
  });

  return checks;
}

/**
 * Validate image URL format
 */
function validateImageUrl(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: false, error: 'URL is empty' };
  }
  
  // Check if it's an absolute URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { valid: false, error: 'Image URL must be absolute (start with http:// or https://)' };
  }
  
  // Check if domain is correct
  if (!url.includes('clncambodia.com')) {
    return { valid: false, error: 'Image URL should be hosted on clncambodia.com domain' };
  }
  
  return { valid: true };
}

/**
 * Main test function
 */
function testSEO() {
  console.log('🔍 SEO Testing Script\n');
  console.log('='.repeat(60));
  
  // Check if dist/index.html exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ ERROR: dist/index.html not found!');
    console.log('   Please run "npm run build" first.');
    process.exit(1);
  }
  
  console.log('📄 Reading built HTML file...');
  const html = fs.readFileSync(distPath, 'utf-8');
  console.log('✓ File read successfully\n');
  
  // Check meta tags
  console.log('📋 Checking Meta Tags:');
  console.log('-'.repeat(60));
  const checks = checkMetaTags(html);
  
  let allPassed = true;
  let requiredPassed = true;
  
  checks.forEach(check => {
    const status = check.found ? '✓' : '✗';
    const required = check.required ? '[REQUIRED]' : '[OPTIONAL]';
    const color = check.found ? '\x1b[32m' : (check.required ? '\x1b[31m' : '\x1b[33m');
    const reset = '\x1b[0m';
    
    console.log(`${color}${status}${reset} ${check.name.padEnd(25)} ${required}`);
    
    if (check.value) {
      const valuePreview = check.value.length > 50 
        ? check.value.substring(0, 50) + '...' 
        : check.value;
      console.log(`   → ${valuePreview}`);
      
      // Validate image URLs
      if (check.name.includes('Image')) {
        const validation = validateImageUrl(check.value);
        if (!validation.valid) {
          console.log(`   ⚠️  WARNING: ${validation.error}`);
          allPassed = false;
        }
      }
    }
    
    if (!check.found && check.required) {
      requiredPassed = false;
      allPassed = false;
    }
    if (!check.found) {
      allPassed = false;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  
  // Summary
  if (requiredPassed) {
    console.log('✅ All REQUIRED meta tags are present!');
  } else {
    console.log('❌ Some REQUIRED meta tags are missing!');
  }
  
  // Additional checks
  console.log('\n📸 Image URL Validation:');
  console.log('-'.repeat(60));
  
  const imageChecks = checks.filter(c => c.name.includes('Image') && c.value);
  if (imageChecks.length > 0) {
    imageChecks.forEach(check => {
      const validation = validateImageUrl(check.value!);
      if (validation.valid) {
        console.log(`✓ ${check.name}: Valid absolute URL`);
        console.log(`  ${check.value}`);
      } else {
        console.log(`✗ ${check.name}: ${validation.error}`);
        console.log(`  ${check.value}`);
      }
    });
  } else {
    console.log('⚠️  No image URLs found in meta tags');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations for Deployment Testing:');
  console.log('-'.repeat(60));
  console.log('1. Deploy to server and test with these tools:');
  console.log('   • Facebook Sharing Debugger:');
  console.log('     https://developers.facebook.com/tools/debug/');
  console.log('   • Twitter Card Validator:');
  console.log('     https://cards-dev.twitter.com/validator');
  console.log('   • LinkedIn Post Inspector:');
  console.log('     https://www.linkedin.com/post-inspector/');
  console.log('   • Open Graph Debugger:');
  console.log('     https://www.opengraph.xyz/');
  console.log('');
  console.log('2. View page source on deployed site and verify:');
  console.log('   • Meta tags are present in <head>');
  console.log('   • Image URLs are absolute (https://clncambodia.com/...)');
  console.log('   • Image is accessible (no 404 errors)');
  console.log('');
  console.log('3. Test image accessibility:');
  console.log('   • Visit: https://clncambodia.com/assets/image/logo.png');
  console.log('   • Should load without errors');
  console.log('');
  console.log('4. Check browser console for any errors');
  console.log('');
  
  // Exit code
  process.exit(requiredPassed ? 0 : 1);
}

// Run tests
testSEO();

