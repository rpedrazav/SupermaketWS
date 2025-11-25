# SupermarketWS - Comparador de Precios de Supermercados en Temuco

Plataforma MVP para comparar precios de supermercados en Temuco, Chile, inspirada en SoloTodo.

## 🎯 Objetivo

Desarrollar una plataforma web que permita comparar precios de productos de diferentes supermercados en Temuco, Chile, mediante web scraping automatizado.

## 🏗️ Arquitectura

Este proyecto sigue los principios de **Clean Architecture** para mantener el código modular, escalable y fácil de mantener.

### Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Node.js con Express
- **Base de Datos**: PostgreSQL
- **Scraping**: Playwright (soporte para sitios dinámicos)
- **Lenguaje**: JavaScript (ES6+)

## 📁 Estructura del Proyecto

```
SupermarketWS/
├── backend/                    # Servidor Express
│   ├── src/
│   │   ├── api/               # Controladores y rutas
│   │   │   ├── routes/        # Definición de rutas
│   │   │   └── controllers/   # Controladores de API
│   │   ├── domain/            # Lógica de negocio
│   │   │   ├── entities/      # Entidades del dominio
│   │   │   ├── usecases/      # Casos de uso
│   │   │   └── repositories/  # Interfaces de repositorios
│   │   ├── infrastructure/    # Implementaciones externas
│   │   │   ├── database/      # Configuración de BD
│   │   │   └── repositories/  # Implementación de repositorios
│   │   ├── config/            # Configuración
│   │   └── server.js          # Punto de entrada
│   ├── package.json
│   └── README.md
│
├── frontend/                   # Aplicación Next.js
│   ├── src/
│   │   ├── app/               # App Router de Next.js
│   │   │   ├── page.js        # Página principal
│   │   │   └── layout.js      # Layout principal
│   │   ├── components/        # Componentes React
│   │   ├── services/          # Servicios para API
│   │   └── utils/             # Utilidades
│   ├── public/                # Archivos estáticos
│   ├── package.json
│   └── README.md
│
├── scrapers/                   # Scripts de web scraping
│   ├── src/
│   │   ├── base/              # Scraper base y utilidades
│   │   │   ├── BaseScraper.js # Clase base para scrapers
│   │   │   └── utils.js       # Utilidades comunes
│   │   ├── scrapers/          # Scrapers específicos
│   │   │   ├── jumbo.js       # Scraper de Jumbo
│   │   │   ├── lider.js       # Scraper de Lider
│   │   │   ├── santaisabel.js # Scraper de Santa Isabel
│   │   │   ├── acuenta.js     # Scraper de Acuenta
│   │   │   ├── unimarc.js     # Scraper de Unimarc
│   │   │   ├── mayorista10.js # Scraper de Mayorista 10
│   │   │   ├── cugat.js       # Scraper de Cugat
│   │   │   ├── trebol.js      # Scraper de El Trébol
│   │   │   └── eltit.js       # Scraper de Eltit
│   │   ├── scheduler/         # Programación de scrapers
│   │   └── index.js           # Orquestador
│   ├── package.json
│   └── README.md
│
├── database/                   # Scripts de base de datos
│   ├── migrations/            # Migraciones
│   ├── seeds/                 # Datos iniciales
│   └── schema.sql             # Esquema de BD
│
├── docs/                      # Documentación adicional
│   ├── architecture.md        # Diagrama de arquitectura
│   ├── database-design.md     # Diseño de base de datos
│   └── scraping-strategy.md   # Estrategia de scraping
│
└── README.md                  # Este archivo
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/rpedrazav/SupermaketWS.git
cd SupermaketWS
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

### 4. Instalar dependencias de los Scrapers

```bash
cd ../scrapers
npm install
```

### 5. Configurar la base de datos

```bash
# Crear base de datos PostgreSQL
createdb supermarketws

# Ejecutar migraciones
cd ../database
psql -d supermarketws -f schema.sql
```

### 6. Configurar variables de entorno

Crear archivo `.env` en cada módulo:

**backend/.env**
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/supermarketws
NODE_ENV=development
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**scrapers/.env**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/supermarketws
HEADLESS=true
```

## 🎮 Uso

### Ejecutar el Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Ejecutar el Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Ejecutar los Scrapers

```bash
cd scrapers
npm run scrape:all    # Ejecutar todos los scrapers
npm run scrape:jumbo  # Ejecutar solo Jumbo
npm run scrape:lider  # Ejecutar solo Lider
```

## 🎯 Supermercados Soportados

### Cadenas Nacionales
- ✅ Jumbo (Cencosud) - Portal Temuco
- ✅ Santa Isabel (Cencosud)
- ✅ Lider (Walmart Chile)
- ✅ Acuenta (Walmart Chile)
- ✅ Unimarc (SMU)
- ✅ Mayorista 10 (SMU)

### Supermercados Regionales (Temuco)
- ✅ Supermercados Cugat
- ✅ Supermercados El Trébol
- ✅ Supermercados Eltit

### Futuro
- ⏳ Uber Eats
- ⏳ Rappi

## 📊 Base de Datos

### Esquema Principal

- **supermarkets**: Información de los supermercados
- **products**: Catálogo de productos
- **prices**: Precios actuales
- **price_history**: Historial de precios
- **product_matches**: Relación entre productos similares de diferentes supermercados

Ver [docs/database-design.md](docs/database-design.md) para más detalles.

## 🔍 Product Matching

El sistema implementa un algoritmo de coincidencia de productos que:

1. Normaliza nombres de productos (remove stopwords, lowercase, etc.)
2. Calcula similitud usando algoritmo de Levenshtein
3. Agrupa productos similares de diferentes supermercados
4. Permite comparación de precios entre cadenas

## 📝 API Endpoints

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener producto específico
- `GET /api/products/search?q=leche` - Buscar productos

### Supermercados
- `GET /api/supermarkets` - Listar supermercados
- `GET /api/supermarkets/:id` - Obtener supermercado específico

### Precios
- `GET /api/prices/compare?productId=123` - Comparar precios
- `GET /api/prices/history/:productId` - Historial de precios

## 🛠️ Desarrollo

### Agregar un nuevo scraper

1. Crear archivo en `scrapers/src/scrapers/nuevo-supermercado.js`
2. Extender la clase `BaseScraper`
3. Implementar métodos requeridos
4. Agregar configuración al orquestador

Ver ejemplo en [scrapers/src/scrapers/jumbo.js](scrapers/src/scrapers/jumbo.js)

## 🔒 Consideraciones de Scraping

- Respetar `robots.txt` de cada sitio
- Implementar delays entre requests
- Usar user-agents realistas
- Rotar IPs si es necesario (proxy)
- Manejar CAPTCHAs apropiadamente

## 📄 Licencia

Ver [LICENSE](LICENSE)

## 👥 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abrir un issue en el repositorio.
