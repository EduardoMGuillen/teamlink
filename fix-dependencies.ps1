# Script to fix all dependencies for Expo SDK 54
Write-Host "Fixing dependencies for Expo SDK 54..." -ForegroundColor Cyan

# Remove old dependencies
Write-Host "`nCleaning old dependencies..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Install base dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

# Use expo install to ensure compatibility
Write-Host "`nInstalling Expo-compatible versions..." -ForegroundColor Yellow
npx expo install react-native-safe-area-context
npx expo install react-native-screens
npx expo install react-native-gesture-handler
npx expo install @react-native-async-storage/async-storage

Write-Host "`n✓ Dependencies fixed! You can now run: npm run build:dev:ios" -ForegroundColor Green

