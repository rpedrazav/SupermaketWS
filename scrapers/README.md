# Scrapers - SupermarketWS

Módulo de web scraping para extraer precios de productos de diferentes supermercados en Temuco.

## Características

- **Clean Architecture**: Clase base `BaseScraper` que define el contrato común
- **Playwright**: Browser automation para sitios dinámicos (JavaScript-heavy)
- **Manejo de ubicación**: Configuración automática de tienda/ubicación para Temuco
- **Rate limiting**: Delays aleatorios para evitar bloqueos
- **User-Agent rotation**: Simula diferentes navegadores
- **Retry logic**: Reintentos automáticos con exponential backoff
- **Error handling**: Manejo robusto de errores con logs detallados

## Instalación

```bash
npm install
```

## Instalación de Playwright browsers

```bash
npx playwright install chromium
```

## Configuración

Crear archivo `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/supermarketws
HEADLESS=true
SAVE_RESULTS=false
```

## Uso

### Ejecutar todos los scrapers
```bash
npm run scrape:all
```

### Ejecutar scraper específico

```bash
npm run scrape:jumbo        # Jumbo - Portal Temuco
npm run scrape:lider        # Lider
npm run scrape:santaisabel  # Santa Isabel
npm run scrape:acuenta      # Acuenta
npm run scrape:unimarc      # Unimarc
npm run scrape:mayorista10  # Mayorista 10
npm run scrape:cugat        # Supermercados Cugat
npm run scrape:trebol       # Supermercados El Trébol
npm run scrape:eltit        # Supermercados Eltit
```

## Estructura

```
scrapers/src/
├── base/
│   ├── BaseScraper.js      # Clase base para scrapers
│   └── utils.js            # Utilidades (normalize, extract price, etc.)
├── scrapers/
│   ├── jumbo.js            # Scraper de Jumbo
│   ├── lider.js            # Scraper de Lider
│   ├── santaisabel.js      # Scraper de Santa Isabel
│   └── ...                 # Otros scrapers
├── scheduler/              # Programación automática (cron jobs)
└── index.js                # Orquestador principal
```

## Implementar un Nuevo Scraper

### 1. Crear el archivo del scraper

```javascript
// src/scrapers/nuevo-super.js
import BaseScraper from '../base/BaseScraper.js';
import { extractPrice } from '../base/utils.js';

export class NuevoSuperScraper extends BaseScraper {
  constructor() {
    super({
      name: 'Nuevo Super',
      slug: 'nuevo-super',
      baseUrl: 'https://www.nuevosuper.cl',
      location: 'Temuco',
    });
  }

  async setLocation() {
    // Implementar configuración de ubicación
    await this.navigateTo(this.baseUrl);
    // ... lógica para seleccionar Temuco
  }

  async scrapeProducts() {
    // Implementar scraping de productos
    await this.navigateTo(`${this.baseUrl}/productos`);
    
    const productElements = await this.page.$$('.product-card');
    
    for (const element of productElements) {
      const product = await this.parseProduct(element);
      if (product) {
        this.products.push(product);
      }
    }
  }

  async parseProduct(element) {
    const name = await element.$eval('.product-name', el => el.textContent);
    const priceText = await element.$eval('.price', el => el.textContent);
    const normalPrice = extractPrice(priceText);
    
    return this.createProductObject({
      name,
      normalPrice,
      category: 'General',
    });
  }
}

export default NuevoSuperScraper;
```

### 2. Registrar en el orquestador

Agregar en `src/index.js`:

```javascript
import NuevoSuperScraper from './scrapers/nuevo-super.js';

// En el constructor de ScraperOrchestrator
this.scrapers = {
  // ... otros scrapers
  'nuevo-super': NuevoSuperScraper,
};
```

### 3. Agregar script en package.json

```json
{
  "scripts": {
    "scrape:nuevo-super": "node src/index.js --supermarket=nuevo-super"
  }
}
```

## Scrapers Implementados

### ✅ Jumbo (Portal Temuco)
- **URL**: https://www.jumbo.cl/
- **Configuración**: Portal Temuco via cookie/sesión
- **Categorías**: Lácteos, Bebidas, Despensa, Snacks, Carnes
- **Datos extraídos**: Nombre, Precio Normal, Precio Oferta, Imagen, URL

### ✅ Lider
- **URL**: https://www.lider.cl/supermercado
- **Configuración**: Tienda Temuco
- **Categorías**: Lácteos, Bebidas, Despensa, Snacks, Carnes
- **Datos extraídos**: Nombre, Precio Normal, Precio Oferta, Marca, Imagen, URL, Precio por Unidad

### 🚧 Próximamente
- Santa Isabel
- Acuenta
- Unimarc
- Mayorista 10
- Cugat
- El Trébol
- Eltit

## Datos Extraídos

Cada scraper extrae los siguientes datos:

```javascript
{
  externalId: 'ID-123',           // ID del producto en el sitio
  name: 'Leche Colun 1L',         // Nombre del producto
  normalizedName: 'leche colun 1l', // Nombre normalizado
  brand: 'Colun',                 // Marca
  category: 'Lácteos',            // Categoría
  imageUrl: 'https://...',        // URL de la imagen
  productUrl: 'https://...',      // URL del producto
  normalPrice: 1990,              // Precio normal
  offerPrice: 1490,               // Precio oferta (null si no hay)
  hasOffer: true,                 // Booleano
  pricePerUnit: 1490,             // Precio por kg/lt
}
```

## Buenas Prácticas

### Respetar robots.txt
Antes de scrapear, verificar `https://sitio.cl/robots.txt`

### Rate Limiting
- Usar delays aleatorios entre requests
- No hacer más de 1 request por segundo
- Implementar backoff exponencial en errores

### User Agents
- Rotar user agents para simular diferentes navegadores
- No usar el mismo UA para todos los requests

### Manejo de Errores
- Capturar y logear errores detalladamente
- Continuar con otros productos si uno falla
- Implementar reintentos con límite

### Ubicación
- Siempre configurar ubicación a Temuco
- Verificar que los precios sean locales
- Guardar cookie/sesión de ubicación

## Debugging

### Modo No-Headless
Para ver el navegador en acción:

```env
HEADLESS=false
```

### Screenshots
El BaseScraper incluye método `screenshot()`:

```javascript
await this.screenshot('debug-products-list');
```

### Logs
Los scrapers logean automáticamente:
- Navegación a URLs
- Productos encontrados
- Errores de parsing
- Duración total

## Mantenimiento

Los selectores CSS/XPath pueden cambiar cuando los sitios actualizan su frontend. Es necesario:

1. **Monitorear logs**: Detectar errores de parsing
2. **Actualizar selectores**: Ajustar en `parseProduct()`
3. **Testing regular**: Ejecutar scrapers periódicamente
4. **Fallbacks**: Implementar múltiples selectores por campo

## Scheduling (Futuro)

Programar ejecución automática con cron:

```bash
# Ejecutar todos los días a las 6 AM
0 6 * * * cd /path/to/scrapers && npm run scrape:all
```

O usar node-cron:

```javascript
import cron from 'node-cron';

// Ejecutar todos los días a las 6 AM
cron.schedule('0 6 * * *', async () => {
  const orchestrator = new ScraperOrchestrator();
  await orchestrator.runAll();
});
```

## Consideraciones Legales

- ✅ Uso personal y educativo
- ✅ Respetar robots.txt
- ✅ No sobrecargar servidores
- ✅ Atribuir fuente de datos
- ⚠️ Revisar términos de servicio de cada sitio
- ⚠️ No redistribuir datos masivamente sin permiso

## Performance

Tiempos estimados por scraper:
- Jumbo: ~2-3 minutos (100-150 productos)
- Lider: ~2-3 minutos (100-150 productos)
- Total (todos): ~20-30 minutos

## Troubleshooting

### Error: Browser not installed
```bash
npx playwright install chromium
```

### Error: Connection timeout
- Aumentar `timeout` en `page.goto()`
- Verificar conectividad a internet
- Verificar que el sitio esté disponible

### No se encuentran productos
- Verificar selectores CSS en el sitio
- Usar modo no-headless para debugging
- Tomar screenshot para inspeccionar

### Captcha o bloqueo
- Aumentar delays entre requests
- Rotar user agents
- Usar proxies (si es necesario)
