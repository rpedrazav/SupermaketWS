# Quick Start Guide - SupermarketWS

## Inicio Rápido en 5 Pasos

### 1. Clonar e Instalar Dependencias

```bash
# Clonar repositorio
git clone https://github.com/rpedrazav/SupermaketWS.git
cd SupermaketWS

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

# Instalar dependencias de scrapers
cd ../scrapers
npm install
npx playwright install chromium
```

### 2. Configurar PostgreSQL

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE supermarketws;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
\q

# Aplicar esquema
psql -U postgres -d supermarketws -f database/schema.sql
psql -U postgres -d supermarketws -f database/seeds/01_supermarkets.sql
```

### 3. Configurar Variables de Entorno

**Backend** (`backend/.env`):
```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/supermarketws
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Scrapers** (`scrapers/.env`):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/supermarketws
HEADLESS=true
```

### 4. Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Probar la Aplicación

- Abre [http://localhost:3000](http://localhost:3000) en tu navegador
- Verifica el backend en [http://localhost:3001/api/health](http://localhost:3001/api/health)
- Ejecuta un scraper: `cd scrapers && npm run scrape:jumbo`

## Verificación

### Backend funcionando ✓
```bash
curl http://localhost:3001/api/health
# Respuesta: {"success":true,"message":"API is running","timestamp":"..."}
```

### Frontend funcionando ✓
- Navega a http://localhost:3000
- Deberías ver la página de inicio de SupermarketWS

### Base de datos funcionando ✓
```bash
psql -U postgres -d supermarketws -c "SELECT COUNT(*) FROM supermarkets;"
# Respuesta: count | 9
```

### Scrapers funcionando ✓
```bash
cd scrapers
npm run scrape:jumbo
# Deberías ver el proceso de scraping ejecutándose
```

## Estructura del Proyecto

```
SupermarketWS/
├── backend/           # API REST (Express)
├── frontend/          # UI (Next.js)
├── scrapers/          # Web scrapers (Playwright)
├── database/          # Esquema SQL y seeds
└── docs/              # Documentación
```

## Comandos Útiles

```bash
# Backend
cd backend
npm run dev          # Desarrollo
npm start            # Producción

# Frontend
cd frontend
npm run dev          # Desarrollo
npm run build        # Build
npm start            # Producción

# Scrapers
cd scrapers
npm run scrape:all   # Todos los scrapers
npm run scrape:jumbo # Solo Jumbo
npm run scrape:lider # Solo Lider
```

## Endpoints Principales

- `GET /api/health` - Estado del servidor
- `GET /api/products` - Listar productos
- `GET /api/products/search?q=leche` - Buscar productos
- `GET /api/supermarkets` - Listar supermercados
- `GET /api/prices/compare?masterProductId=xxx` - Comparar precios
- `GET /api/prices/offers` - Productos en oferta

## Próximos Pasos

1. **Personalizar scrapers** según la estructura actual de los sitios web
2. **Ajustar selectores CSS** en `scrapers/src/scrapers/*.js`
3. **Programar scrapers** con cron para ejecución automática
4. **Implementar features adicionales** (autenticación, listas, alertas)

## Documentación Completa

Para información detallada, consulta:

- [README.md](../README.md) - Información general
- [INSTALLATION.md](INSTALLATION.md) - Instalación paso a paso
- [architecture.md](architecture.md) - Arquitectura del sistema
- [database-design.md](database-design.md) - Diseño de base de datos
- [npm-commands.md](npm-commands.md) - Comandos npm detallados

## Solución Rápida de Problemas

**Error: Cannot connect to database**
→ Verifica que PostgreSQL esté corriendo: `sudo systemctl status postgresql`

**Error: Port already in use**
→ Cambia el puerto en `.env` o mata el proceso: `lsof -ti:3001 | xargs kill -9`

**Error: Module not found**
→ Reinstala dependencias: `rm -rf node_modules && npm install`

**Frontend no se conecta al backend**
→ Verifica CORS_ORIGIN en backend y NEXT_PUBLIC_API_URL en frontend

## Stack Tecnológico

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js 18+, Express 4
- **Database**: PostgreSQL 14+
- **Scrapers**: Playwright (Chromium)
- **Lenguaje**: JavaScript (ES6+)

## Supermercados Soportados

✅ Jumbo (Portal Temuco)
✅ Lider
✅ Santa Isabel
✅ Acuenta
✅ Unimarc
✅ Mayorista 10
✅ Cugat
✅ El Trébol
✅ Eltit

## Licencia

Ver [LICENSE](../LICENSE)

## Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -am 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crea un Pull Request

---

**¿Necesitas ayuda?** Abre un issue en GitHub con detalles del problema.
