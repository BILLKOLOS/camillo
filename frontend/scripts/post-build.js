const fs = require('fs');
const path = require('path');

console.log('🔧 Running post-build script...');

const buildDir = path.join(__dirname, '../build');
const publicDir = path.join(__dirname, '../public');

// Files to copy from public to build
const filesToCopy = [
  '_redirects',
  '_headers',
  'static.json'
];

// Copy routing configuration files
filesToCopy.forEach(file => {
  const sourcePath = path.join(publicDir, file);
  const destPath = path.join(buildDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied ${file} to build directory`);
  } else {
    console.log(`⚠️  ${file} not found in public directory`);
  }
});

// Create a simple index.html fallback for all routes
const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Camillo Investments</title>
    <script>
        // Redirect to the main app
        window.location.href = '/';
    </script>
</head>
<body>
    <p>Redirecting to Camillo Investments...</p>
</body>
</html>`;

// Create fallback files for common routes
const routes = ['/admin', '/dashboard', '/investments', '/auth/login', '/auth/register'];
routes.forEach(route => {
  const routeDir = path.join(buildDir, route.substring(1)); // Remove leading slash
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, 'index.html'), fallbackHtml);
  console.log(`✅ Created fallback for ${route}`);
});

console.log('✅ Post-build script completed!'); 