import Link from 'next/link';
import { formatPrice, calculateDiscountPercentage, getSupermarketLogo } from '@/utils/helpers';

export default function ProductCard({ product, currentPrice, supermarket }) {
  const hasOffer = currentPrice?.hasOffer || false;
  const effectivePrice = currentPrice?.offerPrice || currentPrice?.normalPrice;
  const discountPercentage = currentPrice?.discountPercentage || 0;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="product-card cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative bg-gray-100 h-48 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain p-4"
            />
          ) : (
            <div className="text-6xl">📦</div>
          )}
          
          {/* Discount Badge */}
          {hasOffer && discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Supermarket */}
          {supermarket && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getSupermarketLogo(supermarket.slug)}</span>
              <span className="text-sm text-gray-600">{supermarket.name}</span>
            </div>
          )}

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          )}

          {/* Name */}
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 flex-grow">
            {product.name}
          </h3>

          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mb-2">
              {product.category}
            </p>
          )}

          {/* Price */}
          <div className="mt-auto">
            {hasOffer && currentPrice?.normalPrice ? (
              <div>
                <p className="text-sm text-gray-500 line-through">
                  {formatPrice(currentPrice.normalPrice)}
                </p>
                <p className="text-xl font-bold text-red-600">
                  {formatPrice(currentPrice.offerPrice)}
                </p>
              </div>
            ) : (
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(effectivePrice)}
              </p>
            )}
          </div>

          {/* Offer Description */}
          {hasOffer && currentPrice?.offerDescription && (
            <p className="text-xs text-red-600 mt-1">
              {currentPrice.offerDescription}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
