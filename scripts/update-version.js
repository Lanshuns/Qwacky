import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

let updatesMade = false;

function updateManifestVersion(manifestPath, manifestName) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.version !== version) {
    manifest.version = version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Updated ${manifestName} manifest to version ${version}`);
    updatesMade = true;
  }
}

updateManifestVersion(path.join(__dirname, '..', 'manifest.chrome.json'), 'Chrome');
updateManifestVersion(path.join(__dirname, '..', 'manifest.firefox.json'), 'Firefox');

if (updatesMade) {
  console.log('Version updates complete! 🚀');
} else {
  console.log(`No version changes needed. Current version: ${version}`);
}
