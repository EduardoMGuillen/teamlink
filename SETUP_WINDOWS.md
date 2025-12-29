# Guía de Instalación para Windows

## Requisitos Previos

1. **Node.js** (v18 o superior recomendado)
   - Descarga desde: https://nodejs.org/
   - Instala la versión LTS

2. **Git** (opcional pero recomendado)
   - Descarga desde: https://git-scm.com/download/win

3. **Expo Go App** (para probar en tu teléfono)
   - iOS: App Store
   - Android: Google Play Store

## Instalación Paso a Paso

### 1. Abre PowerShell o Command Prompt

### 2. Navega a la carpeta del proyecto
```bash
cd C:\Users\Eduar\OneDrive\Documents\Cursor\TeamLink
```

### 3. Instala las dependencias
```bash
npm install
```

Esto puede tardar varios minutos la primera vez.

### 4. Inicia el servidor de desarrollo
```bash
npm start
```

Esto abrirá Expo DevTools en tu navegador.

## Probar la App

### Opción 1: En tu teléfono (Recomendado)

1. Instala **Expo Go** en tu iPhone o Android
2. Escanea el código QR que aparece en la terminal o navegador
3. La app se cargará en tu teléfono

### Opción 2: En el navegador (limitado)

```bash
npm run web
```

Nota: Algunas funcionalidades pueden no funcionar en web.

## Desarrollo en Windows

### ✅ Lo que PUEDES hacer en Windows:

- ✅ Desarrollar y probar la app usando Expo Go
- ✅ Ver cambios en tiempo real (hot reload)
- ✅ Depurar y hacer cambios en el código
- ✅ Compilar para Android
- ✅ Usar todas las funcionalidades de desarrollo

### ❌ Lo que NO puedes hacer directamente en Windows:

- ❌ Compilar para iOS (requiere macOS)
- ❌ Probar en simulador de iOS

## Soluciones para Compilar iOS desde Windows

### Opción 1: Expo Application Services (EAS) - RECOMENDADO

1. Instala EAS CLI:
```bash
npm install -g eas-cli
```

2. Inicia sesión:
```bash
eas login
```

3. Configura el proyecto:
```bash
eas build:configure
```

4. Compila para iOS en la nube:
```bash
eas build --platform ios
```

Esto compila tu app en los servidores de Expo, sin necesidad de Mac.

### Opción 2: Mac en la Nube

Servicios como:
- MacStadium
- MacinCloud
- AWS EC2 Mac instances

### Opción 3: Usar un Mac físico

Si tienes acceso a un Mac, puedes:
1. Clonar el repositorio
2. Ejecutar `npm install`
3. Ejecutar `npm run ios` o usar EAS Build

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm start

# Limpiar caché (si hay problemas)
npm start -- --clear

# Ver en Android (requiere Android Studio)
npm run android

# Ver en navegador
npm run web

# Compilar para producción (iOS - requiere EAS)
eas build --platform ios

# Compilar para producción (Android)
eas build --platform android
```

## Solución de Problemas

### Error: "expo: command not found"
```bash
npm install -g expo-cli
```

### Error al instalar dependencias
```bash
# Limpia el caché de npm
npm cache clean --force

# Elimina node_modules y reinstala
rm -rf node_modules
npm install
```

### La app no se carga en Expo Go
- Asegúrate de que tu teléfono y computadora estén en la misma red WiFi
- O usa el modo "Tunnel" en Expo DevTools

## Próximos Pasos

1. Personaliza los colores y estilos en los archivos de estilos
2. Conecta con tu backend API
3. Agrega autenticación real
4. Implementa persistencia de datos
5. Agrega notificaciones push

## Recursos

- Documentación de Expo: https://docs.expo.dev/
- Documentación de React Native: https://reactnative.dev/
- EAS Build: https://docs.expo.dev/build/introduction/

