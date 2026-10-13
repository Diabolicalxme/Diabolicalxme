import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputModelsDir = path.resolve(__dirname, '../public/models');
const outputModelsDir = path.resolve(__dirname, '../public/models-optimized');

if (!fs.existsSync(inputModelsDir)) {
  console.error(`❌ Input models directory not found at: ${inputModelsDir}`);
  process.exit(1);
}

if (!fs.existsSync(outputModelsDir)) {
  fs.mkdirSync(outputModelsDir, { recursive: true });
}

const files = fs.readdirSync(inputModelsDir).filter(f => f.endsWith('.glb'));

if (files.length === 0) {
  console.log(`ℹ️ No .glb models found in ${inputModelsDir} yet.`);
  process.exit(0);
}

console.log(`🚀 Found ${files.length} model(s) in public/models.`);
console.log(`Optimizing into public/models-optimized/ (preserving originals in public/models/)...\n`);

files.forEach(file => {
  const inputPath = path.join(inputModelsDir, file);
  const outputPath = path.join(outputModelsDir, file);
  const originalSize = (fs.statSync(inputPath).size / (1024 * 1024)).toFixed(2);

  console.log(`📦 Processing ${file} (Original: ${originalSize} MB)...`);

  try {
    execSync(`npx -y @gltf-transform/cli optimize "${inputPath}" "${outputPath}" --texture-compress webp --compress draco`, {
      stdio: 'inherit'
    });

    if (fs.existsSync(outputPath)) {
      const optimizedSize = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
      const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
      console.log(`✅ ${file}: ${originalSize} MB ➔ ${optimizedSize} MB (${savings}% reduction in models-optimized/)\n`);
    }
  } catch (err) {
    console.warn(`⚠️ Optimization failed for ${file}: ${err.message}`);
  }
});

console.log('🎉 Optimization run completed! Optimized models are in client/public/models-optimized/');
