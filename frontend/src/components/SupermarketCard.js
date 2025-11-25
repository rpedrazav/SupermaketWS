import { getSupermarketLogo, getChainColor } from '@/utils/helpers';

export default function SupermarketCard({ supermarket, stats }) {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getSupermarketLogo(supermarket.slug)}</span>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {supermarket.name}
            </h3>
            <p className="text-sm text-gray-500">{supermarket.location}</p>
          </div>
        </div>
        
        {/* Chain Badge */}
        {supermarket.chainGroup && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getChainColor(supermarket.chainGroup)}`}>
            {supermarket.chainGroup}
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_products || 0}
            </p>
            <p className="text-xs text-gray-500">Productos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {stats.products_with_offers || 0}
            </p>
            <p className="text-xs text-gray-500">En Oferta</p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {stats && stats.avg_discount && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Descuento promedio: <span className="font-semibold text-red-600">
              {Math.round(stats.avg_discount)}%
            </span>
          </p>
        </div>
      )}

      {/* Status */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${supermarket.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-600">
            {supermarket.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        {supermarket.websiteUrl && (
          <a 
            href={supermarket.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            Ver sitio →
          </a>
        )}
      </div>
    </div>
  );
}
