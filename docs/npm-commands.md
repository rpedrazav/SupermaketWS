# Lista de Comandos NPM - SupermarketWS

Este archivo contiene todos los comandos `npm install` necesarios para instalar las dependencias del proyecto.

## Backend

```bash
cd backend
npm install express cors dotenv pg pg-pool uuid morgan helmet compression nodemon
```

### Dependencias del Backend

**Producción**:
- `express` (^4.18.2) - Framework web
- `cors` (^2.8.5) - Middleware CORS
- `dotenv` (^16.3.1) - Variables de entorno
- `pg` (^8.11.3) - PostgreSQL client
- `pg-pool` (^3.6.1) - Connection pooling
- `uuid` (^9.0.1) - Generador de UUIDs
- `morgan` (^1.10.0) - HTTP request logger
- `helmet` (^7.1.0) - Security headers
- `compression` (^1.7.4) - Response compression

**Desarrollo**:
- `nodemon` (^3.0.2) - Auto-restart en desarrollo

## Frontend

```bash
cd frontend
npm install next react react-dom axios autoprefixer postcss tailwindcss eslint eslint-config-next
```

### Dependencias del Frontend

**Producción**:
- `next` (^14.0.4) - Framework React
- `react` (^18.2.0) - Biblioteca UI
- `react-dom` (^18.2.0) - React DOM renderer
- `axios` (^1.6.2) - Cliente HTTP

**Desarrollo**:
- `autoprefixer` (^10.4.16) - PostCSS plugin
- `postcss` (^8.4.32) - CSS transformer
- `tailwindcss` (^3.4.0) - Framework CSS
- `eslint` (^8.56.0) - Linter JavaScript
- `eslint-config-next` (^14.0.4) - Configuración ESLint para Next.js

## Scrapers

```bash
cd scrapers
npm install playwright dotenv pg uuid cheerio axios
```

### Dependencias de los Scrapers

**Producción**:
- `playwright` (^1.40.1) - Browser automation
- `dotenv` (^16.3.1) - Variables de entorno
- `pg` (^8.11.3) - PostgreSQL client
- `uuid` (^9.0.1) - Generador de UUIDs
- `cheerio` (^1.0.0-rc.12) - HTML parser (opcional)
- `axios` (^1.6.2) - Cliente HTTP (opcional)

### Instalación de Browsers de Playwright

```bash
cd scrapers
npx playwright install chromium
```

## Instalación Completa (Todos los Módulos)

Para instalar todas las dependencias de una vez:

```bash
# Desde la raíz del proyecto

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# Scrapers
cd scrapers && npm install && npx playwright install chromium && cd ..

echo "✓ Todas las dependencias instaladas"
```

## Script de Instalación Automatizada

Puedes crear un script `install-all.sh`:

```bash
#!/bin/bash

echo "Installing SupermarketWS dependencies..."

# Backend
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Scrapers
echo "Installing scrapers dependencies..."
cd scrapers
npm install
npx playwright install chromium
cd ..

echo "✓ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure .env files in each module"
echo "2. Setup PostgreSQL database"
echo "3. Run: cd backend && npm run dev"
echo "4. Run: cd frontend && npm run dev"
```

Dar permisos de ejecución:

```bash
chmod +x install-all.sh
./install-all.sh
```

## Verificar Instalaciones

### Backend
```bash
cd backend
npm list --depth=0
```

### Frontend
```bash
cd frontend
npm list --depth=0
```

### Scrapers
```bash
cd scrapers
npm list --depth=0
npx playwright --version
```

## Actualizar Dependencias

Para actualizar a las últimas versiones compatibles:

```bash
# Backend
cd backend
npm update
npm outdated  # Ver paquetes desactualizados

# Frontend
cd frontend
npm update
npm outdated

# Scrapers
cd scrapers
npm update
npm outdated
```

## Limpiar y Reinstalar

Si hay problemas con las dependencias:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Scrapers
cd scrapers
rm -rf node_modules package-lock.json
npm install
```

## Tamaños Aproximados

- **Backend**: ~50 MB
- **Frontend**: ~350 MB (incluye Next.js y dependencias)
- **Scrapers**: ~250 MB (incluye Playwright y Chromium ~150MB)

**Total**: ~650 MB

## Notas Importantes

1. **Node.js Version**: Requiere Node.js 18 o superior
2. **npm Version**: Recomendado npm 9 o superior
3. **Playwright**: Descarga automáticamente Chromium (~150MB)
4. **PostgreSQL**: Debe estar instalado separadamente (no está en npm)

## Comandos de Desarrollo

Una vez instaladas las dependencias:

```bash
# Backend (puerto 3001)
cd backend
npm run dev

# Frontend (puerto 3000)
cd frontend
npm run dev

# Scrapers
cd scrapers
npm run scrape:jumbo
```

## Solución de Problemas

### Error: ENOENT package.json

Asegúrate de estar en el directorio correcto:
```bash
pwd  # Verificar directorio actual
cd backend  # o frontend, o scrapers
```

### Error: Permission denied

En Linux/Mac, puede necesitar permisos:
```bash
sudo npm install -g npm
```

### Error: node-gyp

Instalar build tools:
```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential

# Windows
npm install --global windows-build-tools
```

### Playwright Installation Failed

```bash
cd scrapers
npx playwright install chromium --force
```

## Dependencias Opcionales (Futuras)

Para agregar features adicionales:

```bash
# Backend
npm install bcrypt jsonwebtoken  # Autenticación
npm install redis  # Cache
npm install winston  # Logging avanzado
npm install joi  # Validación

# Frontend
npm install chart.js react-chartjs-2  # Gráficos
npm install swr  # Data fetching
npm install next-auth  # Autenticación
npm install framer-motion  # Animaciones

# Scrapers
npm install puppeteer-extra puppeteer-extra-plugin-stealth  # Anti-detección
npm install node-cron  # Scheduling
```

## Resumen de Librerías Clave

| Librería | Propósito | Módulo |
|----------|-----------|--------|
| Express | Framework web | Backend |
| Next.js | Framework React SSR | Frontend |
| Playwright | Browser automation | Scrapers |
| PostgreSQL (pg) | Database client | Backend, Scrapers |
| Tailwind CSS | Utility-first CSS | Frontend |
| Axios | HTTP client | Frontend, Scrapers |
| Helmet | Security headers | Backend |
| Morgan | HTTP logging | Backend |
| Cheerio | HTML parsing | Scrapers |

## Scripts NPM Disponibles

### Backend
- `npm start` - Producción
- `npm run dev` - Desarrollo con nodemon
- `npm test` - Tests (pendiente)

### Frontend
- `npm run dev` - Desarrollo
- `npm run build` - Build producción
- `npm start` - Servidor producción
- `npm run lint` - ESLint

### Scrapers
- `npm run scrape:all` - Todos los scrapers
- `npm run scrape:jumbo` - Solo Jumbo
- `npm run scrape:lider` - Solo Lider
- (y más...)
