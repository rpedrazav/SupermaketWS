# Guía de Instalación - SupermarketWS

Esta guía detalla todos los pasos necesarios para instalar y configurar el proyecto SupermarketWS en tu entorno local.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18+ y npm ([Descargar](https://nodejs.org/))
- **PostgreSQL** 14+ ([Descargar](https://www.postgresql.org/download/))
- **Git** ([Descargar](https://git-scm.com/downloads))

Verifica las instalaciones:

```bash
node --version   # Debe ser v18 o superior
npm --version
psql --version   # Debe ser 14 o superior
git --version
```

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/rpedrazav/SupermaketWS.git
cd SupermaketWS
```

## Paso 2: Configurar la Base de Datos

### 2.1 Crear la Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE supermarketws;

# Crear usuario (opcional)
CREATE USER supermarketws_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE supermarketws TO supermarketws_user;

# Salir de psql
\q
```

### 2.2 Instalar Extensiones

```bash
psql -U postgres -d supermarketws

# Instalar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

\q
```

### 2.3 Ejecutar el Esquema

```bash
# Aplicar el esquema de base de datos
psql -U postgres -d supermarketws -f database/schema.sql

# Insertar datos iniciales (supermercados)
psql -U postgres -d supermarketws -f database/seeds/01_supermarkets.sql
```

Verifica que las tablas se crearon correctamente:

```bash
psql -U postgres -d supermarketws -c "\dt"
```

Deberías ver las tablas: `supermarkets`, `products`, `prices`, `price_history`, `product_matches`, `scraping_logs`

## Paso 3: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 3.1 Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tu editor favorito
nano .env  # o vim, code, etc.
```

Actualiza los valores en `.env`:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/supermarketws
CORS_ORIGIN=http://localhost:3000
```

### 3.2 Probar el Backend

```bash
npm run dev
```

Deberías ver:

```
✓ Database connected successfully
✓ Database time: 2024-...

╔═══════════════════════════════════════════════════╗
║        SupermarketWS API Server Started           ║
║  Environment: development                          ║
║  Port:        3001                                 ║
╚═══════════════════════════════════════════════════╝

📍 Server: http://localhost:3001
📍 API: http://localhost:3001/api
📍 Health: http://localhost:3001/api/health
```

Prueba el endpoint de salud:

```bash
curl http://localhost:3001/api/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-..."
}
```

Mantén el servidor corriendo y abre una nueva terminal para continuar.

## Paso 4: Instalar Dependencias del Frontend

```bash
# En una nueva terminal, desde la raíz del proyecto
cd frontend
npm install
```

### 4.1 Configurar Variables de Entorno

```bash
cp .env.example .env.local
nano .env.local
```

Contenido de `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4.2 Probar el Frontend

```bash
npm run dev
```

Deberías ver:

```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in 2.5s
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## Paso 5: Instalar Dependencias de los Scrapers

```bash
# En una nueva terminal, desde la raíz del proyecto
cd scrapers
npm install
```

### 5.1 Instalar Browsers de Playwright

```bash
npx playwright install chromium
```

Este comando descarga el navegador Chromium necesario para los scrapers (~150MB).

### 5.2 Configurar Variables de Entorno

```bash
cp .env.example .env
nano .env
```

Contenido de `.env`:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/supermarketws
HEADLESS=true
SAVE_RESULTS=false
```

### 5.3 Probar un Scraper

```bash
# Probar con Jumbo (modo visible para debugging)
HEADLESS=false npm run scrape:jumbo
```

Deberías ver el navegador abrirse y ejecutar el scraping.

Para producción, usa modo headless:

```bash
npm run scrape:jumbo
```

## Paso 6: Verificar la Instalación

### 6.1 Backend

```bash
# En terminal del backend
curl http://localhost:3001/api/supermarkets
```

Deberías ver la lista de supermercados.

### 6.2 Frontend

1. Abre [http://localhost:3000](http://localhost:3000)
2. Verifica que la página de inicio se carga correctamente
3. Prueba el menú de navegación

### 6.3 Base de Datos

```bash
# Verificar que hay datos
psql -U postgres -d supermarketws -c "SELECT COUNT(*) FROM supermarkets;"
```

Debería mostrar: `count | 9`

## Comandos Útiles

### Backend

```bash
cd backend

# Desarrollo con hot-reload
npm run dev

# Producción
npm start

# Ver logs
tail -f logs/app.log  # Si configuras logging
```

### Frontend

```bash
cd frontend

# Desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar build
npm start

# Linting
npm run lint
```

### Scrapers

```bash
cd scrapers

# Ejecutar todos los scrapers
npm run scrape:all

# Scrapers individuales
npm run scrape:jumbo
npm run scrape:lider
npm run scrape:santaisabel
npm run scrape:acuenta
npm run scrape:unimarc
npm run scrape:mayorista10
npm run scrape:cugat
npm run scrape:trebol
npm run scrape:eltit
```

## Solución de Problemas

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   sudo systemctl status postgresql  # Linux
   brew services list  # macOS
   ```

2. Verifica la cadena de conexión en `.env`

3. Verifica permisos del usuario:
   ```bash
   psql -U postgres -c "\du"
   ```

### Error: "Port 3000/3001 already in use"

Cambia el puerto en las variables de entorno o detén el proceso que usa el puerto:

```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "Playwright browser not found"

```bash
cd scrapers
npx playwright install chromium
```

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Base de datos: "Extension does not exist"

Asegúrate de instalar las extensiones como superusuario:

```bash
psql -U postgres -d supermarketws
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Frontend: Error de CORS

Verifica que `CORS_ORIGIN` en el backend `.env` coincida con la URL del frontend.

## Configuración de Producción

### Backend

1. Cambiar `NODE_ENV=production` en `.env`
2. Usar PM2 o similar para mantener el proceso:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name supermarketws-api
   ```

### Frontend

1. Build de producción:
   ```bash
   npm run build
   npm start
   ```
2. O usar Vercel para deploy automático

### Base de Datos

1. Configurar backups automáticos
2. Configurar replicación (opcional)
3. Ajustar parámetros de performance en `postgresql.conf`

### Scrapers

Programar con cron:

```bash
crontab -e

# Ejecutar todos los días a las 6 AM
0 6 * * * cd /path/to/SupermaketWS/scrapers && npm run scrape:all >> /var/log/scrapers.log 2>&1
```

## Próximos Pasos

1. Lee la documentación completa en [README.md](../README.md)
2. Revisa el diseño de base de datos en [docs/database-design.md](../docs/database-design.md)
3. Explora la API en [backend/README.md](../backend/README.md)
4. Personaliza los scrapers según los sitios actuales

## Soporte

Si encuentras problemas:

1. Revisa los logs de cada componente
2. Verifica la conexión a la base de datos
3. Asegúrate de que todos los puertos estén disponibles
4. Abre un issue en GitHub con detalles del error

¡Listo! Tu entorno de desarrollo está configurado. 🎉
