# Frontend - SupermarketWS

Aplicación web frontend construida con Next.js 14 y App Router para la plataforma de comparación de precios.

## Tecnologías

- **Next.js 14**: Framework React con App Router
- **React 18**: Biblioteca de UI
- **Tailwind CSS**: Estilos utilitarios
- **Axios**: Cliente HTTP para API

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Producción

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

## Estructura

```
frontend/src/
├── app/                    # App Router de Next.js
│   ├── layout.js          # Layout principal
│   ├── page.js            # Página de inicio
│   ├── globals.css        # Estilos globales
│   ├── products/          # Páginas de productos
│   ├── supermarkets/      # Páginas de supermercados
│   └── offers/            # Páginas de ofertas
├── components/            # Componentes React reutilizables
│   ├── ProductCard.js     # Tarjeta de producto
│   ├── SupermarketCard.js # Tarjeta de supermercado
│   └── Loading.js         # Componente de carga
├── services/              # Servicios para consumir API
│   └── api.js             # Cliente API con axios
└── utils/                 # Utilidades
    └── helpers.js         # Funciones helper
```

## Componentes Principales

### ProductCard

Muestra información de un producto:
- Imagen
- Nombre y marca
- Precio normal y oferta
- Badge de descuento
- Supermercado

```jsx
<ProductCard 
  product={product}
  currentPrice={price}
  supermarket={supermarket}
/>
```

### SupermarketCard

Muestra información de un supermercado:
- Logo y nombre
- Ubicación
- Estadísticas (productos, ofertas)
- Estado activo/inactivo

```jsx
<SupermarketCard 
  supermarket={supermarket}
  stats={stats}
/>
```

## Servicios API

### Products

```javascript
import { productsAPI } from '@/services/api';

// Listar productos
const { data } = await productsAPI.getAll({ limit: 20 });

// Buscar productos
const { data } = await productsAPI.search('leche');

// Obtener producto
const { data } = await productsAPI.getById(productId);

// Historial de precios
const { data } = await productsAPI.getPriceHistory(productId);
```

### Supermarkets

```javascript
import { supermarketsAPI } from '@/services/api';

// Listar supermercados
const { data } = await supermarketsAPI.getAll();

// Por slug
const { data } = await supermarketsAPI.getBySlug('jumbo');

// Por cadena
const { data } = await supermarketsAPI.getByChain('Cencosud');
```

### Prices

```javascript
import { pricesAPI } from '@/services/api';

// Comparar precios
const { data } = await pricesAPI.compare(masterProductId);

// Ofertas
const { data } = await pricesAPI.getOffers({ limit: 20 });

// Historial
const { data } = await pricesAPI.getHistory(productId);
```

## Utilidades

### Formateo de Precios

```javascript
import { formatPrice } from '@/utils/helpers';

formatPrice(1990); // "$1.990"
```

### Cálculo de Descuentos

```javascript
import { calculateDiscountPercentage } from '@/utils/helpers';

calculateDiscountPercentage(1990, 1490); // 25
```

### Formateo de Fechas

```javascript
import { formatDate, formatRelativeTime } from '@/utils/helpers';

formatDate('2024-01-15'); // "15 de enero de 2024"
formatRelativeTime('2024-01-15'); // "Hace 2 días"
```

## Páginas

### Inicio (/)
- Hero con búsqueda
- Features principales
- Lista de supermercados
- Call to action

### Productos (/products)
- Grid de productos
- Filtros por categoría, supermercado
- Búsqueda
- Paginación

### Supermercados (/supermarkets)
- Lista de supermercados
- Estadísticas de cada uno
- Filtros por cadena

### Ofertas (/offers)
- Productos en oferta
- Ordenados por descuento
- Filtros por supermercado

### Detalle de Producto (/products/[id])
- Información completa
- Comparación de precios
- Gráfico de historial
- Link a producto original

## Estilos

Usamos Tailwind CSS con clases utilitarias personalizadas:

```css
/* Botones */
.btn-primary    /* Botón principal */
.btn-secondary  /* Botón secundario */

/* Tarjetas */
.card           /* Tarjeta básica */
.product-card   /* Tarjeta de producto */
```

## Colores del Tema

```javascript
primary: {
  50: '#f0fdf4',
  // ...
  600: '#16a34a',  // Color principal
  // ...
  900: '#14532d',
}
```

## Responsive Design

La aplicación es totalmente responsive:
- **Mobile**: 1 columna
- **Tablet**: 2 columnas
- **Desktop**: 3-4 columnas

## Performance

- Server-side rendering con Next.js
- Optimización de imágenes con `next/image`
- Code splitting automático
- Lazy loading de componentes

## SEO

Metadatos optimizados en cada página:

```javascript
export const metadata = {
  title: 'Título de la página',
  description: 'Descripción',
  keywords: 'palabras, clave',
};
```

## Testing

```bash
npm test
```

## Deployment

### Vercel (Recomendado)

1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Deploy automático

### Otro hosting

```bash
npm run build
npm start
```

## Próximas Funcionalidades

- [ ] Autenticación de usuarios
- [ ] Listas de compras
- [ ] Alertas de precio
- [ ] Comparación lado a lado
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push

## Contribuir

Ver [README.md](../README.md) principal del proyecto.
