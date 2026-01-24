# Cómo Deshabilitar la Confirmación de Email en Supabase

## Problema: "Email rate limit exceeded"

Si estás recibiendo este error, significa que Supabase está limitando el envío de emails de confirmación.

## Solución Rápida (RECOMENDADA para desarrollo):

### Pasos:

1. **Ve a tu Supabase Dashboard**
   - Abre https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Navega a Authentication Settings**
   - En el menú lateral, ve a **Authentication**
   - Luego haz clic en **Settings** (o **Configuración**)
   - Busca la sección **Email Auth**

3. **Deshabilita la Confirmación de Email**
   - Encuentra la opción **"Enable email confirmations"** o **"Habilitar confirmación de email"**
   - **Desactívala** (toggle OFF)
   - Haz clic en **Save** o **Guardar**

4. **¡Listo!**
   - Ahora los usuarios se registrarán sin necesidad de confirmar su email
   - El registro funcionará instantáneamente
   - No habrá más errores de rate limit

## Ubicación Exacta en el Dashboard:

```
Supabase Dashboard
  └── Tu Proyecto
      └── Authentication (menú lateral)
          └── Settings / Configuración
              └── Email Auth
                  └── [ ] Enable email confirmations  ← DESACTIVAR ESTO
```

## Para Producción:

Cuando estés listo para producción:
1. Vuelve a habilitar la confirmación de email
2. Configura un SMTP personalizado si esperas muchos registros
3. Considera usar un servicio de email dedicado (SendGrid, Mailgun, etc.)

## Alternativas:

- **Esperar 1 hora**: El límite se resetea automáticamente
- **Usar emails diferentes**: Prueba con diferentes direcciones para cada test
- **Configurar SMTP personalizado**: Te dará límites más altos
