# Arquitectura del Sistema - SupermarketWS

## Visión General

SupermarketWS es una plataforma de comparación de precios que sigue los principios de **Clean Architecture** para mantener el código modular, testeable y escalable.

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIOS                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Páginas    │  │  Componentes │  │   Servicios  │      │
│  │   (Routes)   │  │   (React)    │  │    (API)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            API Layer (Controllers/Routes)            │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │         Domain Layer (Entities/Use Cases)            │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │     Infrastructure Layer (DB/Repositories)           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  BASE DE DATOS (PostgreSQL)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Products  │  │  Prices  │  │Price     │  │Super-    │   │
│  │          │  │          │  │History   │  │markets   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                       ▲
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   SCRAPERS (Playwright)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Jumbo   │  │  Lider   │  │  Santa   │  │  Otros   │   │
│  │ Scraper  │  │ Scraper  │  │  Isabel  │  │ Scrapers │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               SITIOS WEB DE SUPERMERCADOS                    │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Frontend (Next.js 14)

**Responsabilidad**: Interfaz de usuario y experiencia del cliente

**Tecnologías**:
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Axios

**Estructura**:
```
frontend/src/
├── app/              # Rutas y páginas (App Router)
├── components/       # Componentes React reutilizables
├── services/         # Cliente API
└── utils/            # Funciones helper
```

**Características**:
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Optimización automática de imágenes
- Code splitting
- SEO optimizado

### 2. Backend (Node.js/Express)

**Responsabilidad**: Lógica de negocio y API REST

**Tecnologías**:
- Node.js 18+
- Express 4
- PostgreSQL (pg driver)
- ES6 Modules

**Arquitectura (Clean Architecture)**:

```
backend/src/
├── api/                    # Capa de Presentación
│   ├── routes/            # Definición de rutas HTTP
│   └── controllers/       # Manejadores de requests
│
├── domain/                 # Capa de Dominio
│   ├── entities/          # Entidades de negocio
│   ├── usecases/          # Casos de uso (lógica)
│   └── repositories/      # Interfaces de repositorios
│
└── infrastructure/         # Capa de Infraestructura
    ├── database/          # Configuración de BD
    └── repositories/      # Implementación de repositorios
```

**Principios**:
- Separación de responsabilidades
- Inversión de dependencias
- Inyección de dependencias
- Single Responsibility Principle

### 3. Base de Datos (PostgreSQL)

**Responsabilidad**: Almacenamiento persistente de datos

**Esquema Principal**:

```
supermarkets (9 registros)
    ├── products (N registros)
    │   ├── prices (1 current por producto)
    │   └── price_history (N históricos)
    └── product_matches (M:N relaciones)
```

**Características**:
- UUID como identificadores
- Extensiones: `uuid-ossp`, `pg_trgm`
- Índices optimizados para búsqueda
- Triggers para automación
- Vistas materializadas para queries complejos

### 4. Scrapers (Playwright)

**Responsabilidad**: Extracción de datos de sitios web

**Tecnologías**:
- Playwright (Chromium)
- Node.js
- ES6 Modules

**Arquitectura**:

```
scrapers/src/
├── base/
│   ├── BaseScraper.js     # Clase base abstracta
│   └── utils.js           # Utilidades comunes
│
├── scrapers/
│   ├── jumbo.js           # Implementación específica
│   └── lider.js           # ...
│
└── index.js               # Orquestador
```

**Características**:
- Clase base con template method pattern
- User-agent rotation
- Rate limiting
- Retry logic
- Error handling robusto

## Flujo de Datos

### 1. Scraping → Base de Datos

```
1. Scraper se ejecuta (manual o programado)
2. Navega al sitio web del supermercado
3. Extrae datos de productos (nombre, precio, imagen, etc.)
4. Normaliza datos
5. Inserta/actualiza en PostgreSQL
6. Registra log de ejecución
```

### 2. Usuario → Frontend → Backend → Base de Datos

```
1. Usuario busca "leche" en frontend
2. Frontend hace request a /api/products/search?q=leche
3. Backend recibe request en ProductController
4. Controller invoca ProductRepository.search()
5. Repository ejecuta query SQL con pg_trgm
6. Resultados retornan al frontend
7. Frontend renderiza ProductCard para cada resultado
```

### 3. Comparación de Precios

```
1. Usuario ve producto en frontend
2. Frontend request a /api/prices/compare?masterProductId=xxx
3. Backend busca en product_matches
4. Obtiene todos los productos relacionados
5. Consulta precios actuales de cada uno
6. Ordena por precio (ASC)
7. Retorna comparación con mejor oferta destacada
```

## Patrones de Diseño

### Backend

1. **Repository Pattern**: Abstrae acceso a datos
2. **Entity Pattern**: Modela objetos de dominio
3. **Dependency Injection**: Inyecta dependencias en constructores
4. **Factory Pattern**: Crea instancias de entidades

### Scrapers

1. **Template Method**: BaseScraper define flujo, subclases implementan detalles
2. **Strategy Pattern**: Diferentes estrategias de scraping por sitio
3. **Singleton**: Una instancia de browser por scraper

### Frontend

1. **Component Pattern**: Componentes React reutilizables
2. **Container/Presenter**: Separación de lógica y presentación
3. **Service Layer**: Servicios para comunicación con API

## Escalabilidad

### Horizontal Scaling

**Backend**:
- Stateless: puede escalar horizontalmente
- Load balancer (Nginx, AWS ALB)
- Multiple instances detrás del LB

**Base de Datos**:
- Replicación master-slave
- Read replicas para queries pesadas
- Connection pooling

**Scrapers**:
- Ejecutar en workers separados
- Queue system (Redis, RabbitMQ)
- Distribución por supermercado

### Vertical Scaling

- Aumentar recursos de servidor (CPU, RAM)
- Optimizar queries SQL
- Implementar caching (Redis)

## Caching Strategy

### Frontend

- Next.js cache automático
- Browser cache para assets estáticos
- SWR para datos en tiempo real

### Backend

```
Cliente → CDN → Load Balancer → [Cache Layer] → Backend → Database
                                      ↓
                                    Redis
```

**Cacheable**:
- Lista de supermercados (24h)
- Categorías de productos (24h)
- Productos individuales (1h)
- Precios actuales (15min)

### Database

- Query result cache
- Materialized views para agregaciones

## Seguridad

### Backend

- Helmet.js para headers de seguridad
- CORS configurado
- Rate limiting (opcional)
- Input validation
- SQL injection prevention (parameterized queries)

### Database

- Usuario con permisos limitados
- Conexiones SSL/TLS
- Backups regulares
- Encrypted at rest

### Scrapers

- Respeta robots.txt
- User-agent realista
- Rate limiting
- No expone credenciales

## Monitoreo y Logging

### Backend

```javascript
// Morgan para HTTP logging
app.use(morgan('combined'));

// Custom logging
logger.info('Product created', { productId });
logger.error('Database error', { error });
```

### Scrapers

```javascript
// Logging de ejecución
console.log('✓ Scraping completed');
console.log('  Products: 150');
console.log('  Duration: 45s');

// Logs en base de datos
INSERT INTO scraping_logs ...
```

### Database

- Query logs para debugging
- Slow query log
- Connection pool metrics

## CI/CD Pipeline (Futuro)

```
Git Push → GitHub Actions → Run Tests → Build → Deploy
                               ↓
                          Notify Slack
```

**Stages**:
1. Lint code
2. Run unit tests
3. Run integration tests
4. Build Docker images
5. Deploy to staging
6. Run E2E tests
7. Deploy to production

## Infraestructura (Ejemplo)

### Development

- Local: Laptop/Desktop
- Database: PostgreSQL local
- Frontend: localhost:3000
- Backend: localhost:3001

### Production

```
                    ┌──────────────┐
                    │   Vercel     │ (Frontend)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
Internet ──────────►│  Cloudflare  │ (CDN)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   AWS ALB    │ (Load Balancer)
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼───────┐         ┌──────▼───────┐
       │  EC2 Backend │         │  EC2 Backend │
       │  Instance 1  │         │  Instance 2  │
       └──────┬───────┘         └──────┬───────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼───────┐
                    │  RDS Postgres │
                    │   (Primary)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  RDS Postgres │
                    │  (Read Replica)│
                    └───────────────┘
```

## Performance Metrics

### Objetivos

- **Frontend**: 
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3s
  - Lighthouse Score > 90

- **Backend**:
  - Response time < 200ms (p95)
  - Throughput > 1000 req/s
  - Error rate < 0.1%

- **Database**:
  - Query time < 50ms (p95)
  - Connection pool utilization < 80%

- **Scrapers**:
  - Success rate > 95%
  - Products/minute > 50

## Costos Estimados (Producción)

**AWS**:
- EC2 (t3.medium x2): $60/mes
- RDS (db.t3.small): $30/mes
- ALB: $20/mes
- S3 + CloudFront: $10/mes

**Vercel** (Frontend):
- Hobby: Gratis
- Pro: $20/mes

**Total**: ~$140/mes para producción inicial

## Próximas Mejoras

1. **Arquitectura**:
   - Microservicios para scrapers
   - Event-driven architecture (Kafka)
   - GraphQL API

2. **Features**:
   - Autenticación (JWT)
   - Listas de compras
   - Alertas de precio
   - Recomendaciones ML

3. **Infrastructure**:
   - Containerización (Docker)
   - Orchestration (Kubernetes)
   - Serverless functions

4. **Observability**:
   - APM (New Relic, DataDog)
   - Error tracking (Sentry)
   - Analytics (Google Analytics)
