import './globals.css'

export const metadata = {
  title: 'SupermarketWS - Comparador de Precios Temuco',
  description: 'Compara precios de supermercados en Temuco, Chile. Encuentra las mejores ofertas en Jumbo, Lider, Santa Isabel, Unimarc y más.',
  keywords: 'supermercados, precios, Temuco, ofertas, comparador, Chile',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-primary-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">SupermarketWS</h1>
                  <span className="text-sm opacity-90">Temuco</span>
                </div>
                <nav className="hidden md:flex space-x-6">
                  <a href="/" className="hover:text-primary-200 transition-colors">
                    Inicio
                  </a>
                  <a href="/products" className="hover:text-primary-200 transition-colors">
                    Productos
                  </a>
                  <a href="/supermarkets" className="hover:text-primary-200 transition-colors">
                    Supermercados
                  </a>
                  <a href="/offers" className="hover:text-primary-200 transition-colors">
                    Ofertas
                  </a>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="flex-grow bg-gray-50">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">SupermarketWS</h3>
                  <p className="text-gray-400 text-sm">
                    Comparador de precios de supermercados en Temuco, Chile.
                    Encuentra las mejores ofertas y ahorra en tu compra.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Supermercados</h3>
                  <ul className="text-gray-400 text-sm space-y-2">
                    <li>Jumbo - Portal Temuco</li>
                    <li>Lider</li>
                    <li>Santa Isabel</li>
                    <li>Unimarc</li>
                    <li>Y más...</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Legal</h3>
                  <ul className="text-gray-400 text-sm space-y-2">
                    <li>
                      <a href="#" className="hover:text-white transition-colors">
                        Términos de Uso
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-white transition-colors">
                        Política de Privacidad
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
                © {new Date().getFullYear()} SupermarketWS. Todos los derechos reservados.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
