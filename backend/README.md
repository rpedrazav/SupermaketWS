# Backend - SupermarketWS API

API REST para la plataforma de comparación de precios de supermercados.

## Arquitectura

Este backend sigue los principios de **Clean Architecture**, separando claramente las responsabilidades:

```
backend/src/
├── api/                  # Capa de presentación (Controllers & Routes)
├── domain/               # Capa de dominio (Entities & Use Cases)
├── infrastructure/       # Capa de infraestructura (DB, Repositories)
└── config/               # Configuración
```

### Capas

1. **API Layer** (`api/`): Maneja HTTP requests/responses
2. **Domain Layer** (`domain/`): Lógica de negocio pura
3. **Infrastructure Layer** (`infrastructure/`): Implementaciones concretas (DB, external services)

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env`:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/supermarketws
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Verificar estado del servidor

### Productos
- `GET /api/products` - Listar productos
  - Query params: `limit`, `offset`, `supermarketId`, `category`, `isAvailable`
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products/search?q=leche` - Buscar productos
- `GET /api/products/:id/history` - Historial de precios

### Supermercados
- `GET /api/supermarkets` - Listar supermercados
  - Query params: `isActive`
- `GET /api/supermarkets/:id` - Obtener supermercado por ID
- `GET /api/supermarkets/slug/:slug` - Obtener por slug
- `GET /api/supermarkets/chain/:chainGroup` - Filtrar por cadena

### Precios
- `GET /api/prices/compare?masterProductId=xxx` - Comparar precios
- `GET /api/prices/offers` - Productos en oferta
  - Query params: `limit`, `offset`, `supermarketId`
- `GET /api/prices/history/:productId` - Historial de precios

## Ejemplo de Uso

```javascript
// Buscar productos
fetch('http://localhost:3001/api/products/search?q=leche')
  .then(res => res.json())
  .then(data => console.log(data));

// Comparar precios
fetch('http://localhost:3001/api/prices/compare?masterProductId=xxx')
  .then(res => res.json())
  .then(data => console.log(data.data.bestDeal));

// Obtener ofertas
fetch('http://localhost:3001/api/prices/offers?limit=10')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Estructura de Respuesta

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }  // Si aplica
}
```

En caso de error:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Testing

```bash
npm test
```

## Notas de Desarrollo

- Se usa ES6 modules (`import`/`export`)
- PostgreSQL con pool de conexiones
- Validación en entidades del dominio
- Separación clara de responsabilidades (Clean Architecture)
