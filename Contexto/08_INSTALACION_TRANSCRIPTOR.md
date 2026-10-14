# REGISTRO DE INSTALACIÓN EN PRODUCCIÓN - TRANSCRIPTOR (2026-09-29)

> ⚠️ **¡ATENCIÓN A CUALQUIER AGENTE, SISTEMA O DESARROLLADOR!**
> **NO SOBRESCRIBIR, NO MODIFICAR NI ELIMINAR ESTA APLICACIÓN SIN AUTORIZACIÓN.**
> Este servidor (IP: `34.122.229.177`) es un entorno consolidado y compartido con el ERP Hidroluz en producción.

---

## 1. Datos de la Aplicación y Acceso

- **Aplicación:** Transcriptor de Audio y Video (Flask + faster-whisper, CPU)
- **Dominio Público:** `https://transcriptor.nexaflow-ia.com`
- **Acceso:** Basic Auth de Nginx, usuario `marco` (la contraseña NO se guarda en este documento)
- **IP del Servidor:** `34.122.229.177`
- **Usuario SSH:** `mlogacho`
- **Llave de Autorización Local:** `~/.ssh/hidroluz_agent`
- **Ruta de la App en Servidor:** `/home/mlogacho/transcriptor`
- **Código fuente local:** `/Users/marcologacho/Documents/Transcriptor/app` (repo git → `github.com/mlogacho/transcriptor`, público; `Contexto/` NO se versiona)
- **Puerto Interno (PM2):** `3003` (escucha solo en `127.0.0.1`)

---

## 2. Mapa de Aplicaciones del Servidor

| Aplicación | Puerto Local | Base de Datos | Proceso PM2 |
| :--- | :--- | :--- | :--- |
| Hidroluz ERP | 3000 | `hidroluz_db` | `hidroluz-erp` |
| Gestión Carrera | 3001 | `gestioncarrera_db` | `gestioncarrera` |
| Aceleración App | 3002 | `aceleracion_db` | `aceleracion-app` |
| **Transcriptor** | **3003** | *(no usa BD; `jobs.json` en disco)* | **`transcriptor`** |
| NexaBot API | 3005 | — | `nexabot-api` |

**Bajo ninguna circunstancia debes:** reiniciar todo PM2 (usa `pm2 restart transcriptor`), usar otro puerto ocupado, ni tocar los bloques de Nginx de otras apps.

---

## 3. Protección de Recursos (servidor de 2 vCPU / 3.8 GB RAM)

Whisper es intensivo en CPU/RAM. Para no afectar al ERP se configuró:
- **Modelos permitidos:** `tiny`, `base`, `small` (default `small`). `medium`/`large` deshabilitados.
- **1 transcripción a la vez** (las demás quedan en cola) y **1 hilo de CPU** por transcripción.
- **PM2 `max_memory_restart: 2G`**.
- **Swap de 2 GB** creado en `/swapfile` (persistente en `/etc/fstab`, `vm.swappiness=10` en `/etc/sysctl.d/99-swappiness.conf`). Afecta a todo el servidor.
- **Limpieza automática:** el archivo subido se borra al terminar; transcripciones y registros de más de **7 días** se eliminan.
- Límite de subida: **2 GB** por archivo.

Todo es configurable vía variables `TRANSCRIPTOR_*` en `ecosystem.config.js`.

## 4. Paquetes de Sistema Instalados (apt)
`ffmpeg`, `apache2-utils` (htpasswd), `python3-venv`.

Modelos Whisper precargados en `~/.cache/huggingface` (~680 MB). venv en `~/transcriptor/venv` (~460 MB).

**Dependencia crítica:** `av<17` fijado en `requirements.txt` — con `av>=17` faster-whisper falla con `open() got an unexpected keyword argument 'metadata_errors'`.

---

## 5. Despliegue y Mantenimiento

Desde la Mac:
```bash
cd ~/Documents/Transcriptor/app
rsync -az -e "ssh -i ~/.ssh/hidroluz_agent" transcribir_web.py requirements.txt ecosystem.config.js mlogacho@34.122.229.177:~/transcriptor/
ssh -i ~/.ssh/hidroluz_agent mlogacho@34.122.229.177 'cd ~/transcriptor && venv/bin/pip install -q -r requirements.txt && pm2 restart transcriptor'
```
Si cambias `ecosystem.config.js`: `pm2 delete transcriptor && pm2 start ecosystem.config.js && pm2 save` (solo esta app).

Logs: `pm2 logs transcriptor`

## 6. Proxy Inverso y SSL (Nginx + Certbot)
- **Archivo Nginx:** `/etc/nginx/sites-available/transcriptor` (enlazado en `sites-enabled`)
- **Usuarios Basic Auth:** `/etc/nginx/.htpasswd-transcriptor`
  - Agregar/cambiar usuario: `sudo htpasswd -B /etc/nginx/.htpasswd-transcriptor <usuario>`
- **SSL:** Certbot Let's Encrypt, auto-renovable (HTTP redirige a HTTPS).
- `proxy_buffering off` y timeouts de 3600 s (progreso en vivo por SSE y archivos largos).

## 7. Cambios de Seguridad al Código Original
El `transcribir_web.py` original (carpeta Kali) permitía transcribir **cualquier ruta del servidor** (pestaña "Ruta Local") y guardaba subidas con el nombre enviado por el cliente (path traversal). Ambos fueron eliminados en esta versión.
