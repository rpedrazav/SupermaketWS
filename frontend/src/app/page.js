import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Compara Precios de Supermercados en Temuco
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Encuentra las mejores ofertas y ahorra en tu compra semanal. 
          Comparamos precios de los principales supermercados de Temuco.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar productos... (ej: leche, pan, arroz)"
              className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button className="btn-primary px-8 text-lg">
              Buscar
            </button>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <Link href="/products" className="btn-primary">
            Ver Productos
          </Link>
          <Link href="/supermarkets" className="btn-secondary">
            Ver Supermercados
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="text-4xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold mb-2">9 Supermercados</h3>
          <p className="text-gray-600">
            Comparamos precios de las principales cadenas nacionales y regionales de Temuco
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold mb-2">Mejores Ofertas</h3>
          <p className="text-gray-600">
            Encuentra productos en oferta y ahorra hasta un 50% en tu compra
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Historial de Precios</h3>
          <p className="text-gray-600">
            Visualiza tendencias de precios y decide cuándo es el mejor momento para comprar
          </p>
        </div>
      </section>

      {/* Supermarkets */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Supermercados Incluidos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: 'Jumbo', chain: 'Cencosud' },
            { name: 'Santa Isabel', chain: 'Cencosud' },
            { name: 'Lider', chain: 'Walmart' },
            { name: 'Acuenta', chain: 'Walmart' },
            { name: 'Unimarc', chain: 'SMU' },
            { name: 'Mayorista 10', chain: 'SMU' },
            { name: 'Cugat', chain: 'Regional' },
            { name: 'El Trébol', chain: 'Regional' },
            { name: 'Eltit', chain: 'Regional' },
          ].map((supermarket) => (
            <div key={supermarket.name} className="card text-center">
              <div className="text-3xl mb-2">🏬</div>
              <h3 className="font-semibold text-gray-900">{supermarket.name}</h3>
              <p className="text-sm text-gray-500">{supermarket.chain}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card bg-primary-50 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¿Listo para ahorrar?
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Comienza a comparar precios ahora y encuentra las mejores ofertas
        </p>
        <Link href="/products" className="btn-primary inline-block">
          Explorar Productos
        </Link>
      </section>

      {/* Info */}
      <section className="mt-16 text-center text-gray-600">
        <p className="mb-2">
          <strong>Última actualización:</strong> Los precios se actualizan diariamente
        </p>
        <p className="text-sm">
          Los precios pueden variar según disponibilidad y ubicación. 
          Verifica precios finales en el sitio oficial de cada supermercado.
        </p>
      </section>
    </div>
  )
}
