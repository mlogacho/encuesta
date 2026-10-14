# REGISTRO DE INSTALACIÓN EN PRODUCCIÓN - ENCUESTA CAREER SERVICES

- **Fecha:** 2026-10-12
- **Dominio Público:** `https://encuesta.nexaflow-ia.com`
- **Servidor:** `34.122.229.177` (GCP)
- **Usuario SSH:** `mlogacho`
- **Ruta de la App:** `/home/mlogacho/encuesta`
- **Puerto Interno (PM2):** `3004`
- **Proceso PM2:** `encuesta`
- **Base de Datos:** SQLite local WAL (`/home/mlogacho/encuesta/encuesta.db`)
- **Nginx Config:** `/etc/nginx/sites-available/encuesta.nexaflow-ia.com`
- **SSL:** Certbot Let's Encrypt auto-renovable.

## Credenciales y Acceso Administrativo
- **Panel Admin:** Botón "Panel Admin" en la esquina superior derecha de la web o vía modal.
- **Clave Maestra:** `NexaCareer2026!`
- **Exportación:** Permite descargar todas las respuestas en formato Excel CSV compatible con UTF-8 BOM.

## Comandos de Mantenimiento
```bash
# Ver logs
pm2 logs encuesta

# Reiniciar servicio
pm2 restart encuesta
```
