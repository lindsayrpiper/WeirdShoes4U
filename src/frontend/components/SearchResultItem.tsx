import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

interface SearchResultItemProps {
  product: Product;
  onSelect: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  product,
  onSelect,
}) => {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover rounded"
          sizes="48px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {product.name}
        </h4>
        <p className="text-xs text-gray-500 truncate">{product.category}</p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-sm font-semibold text-gray-900">
          ${product.price.toFixed(2)}
        </span>
      </div>
    </Link>
  );
};
