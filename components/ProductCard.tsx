'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, TrendingUp, Zap, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onWishlistToggle: (productId: string) => void;
  isInWishlist: boolean;
}

export default function ProductCard({ product, onWishlistToggle, isInWishlist }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl smooth-transition border border-gray-100 card-hover-glow product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer-effect" />
          )}
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle(product.id);
            }}
            className={`absolute top-3 right-3 p-2.5 glass-effect rounded-full shadow-lg smooth-transition hover:scale-125 button-press z-10 ${
              isHovered || isInWishlist ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                isInWishlist ? 'fill-rose-500 text-rose-500 scale-110 animate-pulse-glow' : 'text-gray-700'
              }`}
            />
          </button>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg animate-fade-in animate-float">
                <Zap className="w-3 h-3" />
                Featured
              </div>
            )}
            {product.trending && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg animate-fade-in animation-delay-100">
                <TrendingUp className="w-3 h-3" />
                Trending
              </div>
            )}
            {product.new_arrival && (
              <div className="px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg animate-scale-in animation-delay-200">
                New
              </div>
            )}
          </div>

          <div className={`absolute bottom-3 left-3 right-3 transition-all duration-500 ease-out ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <a
              href={product.buy_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(product.buy_url, '_blank');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black/95 backdrop-blur-md text-white text-sm font-bold rounded-xl hover:bg-black smooth-transition shadow-2xl button-press hover:scale-105 group/button"
            >
              <ShoppingCart className="w-4 h-4 transition-transform group-hover/button:scale-110" />
              Quick Shop
            </a>
          </div>
        </div>
      </Link>

      <Link href={`/product/${product.slug}`} className="block">
        <div className="p-4 space-y-2">
          {product.brand && (
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider transition-colors group-hover:text-blue-700">
              {product.brand.name}
            </p>
          )}

          <h3 className="font-semibold text-base leading-snug line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-all duration-300 group-hover:translate-x-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 transition-all duration-300 ${
                    i < 4
                      ? 'fill-amber-400 text-amber-400 group-hover:scale-110'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                  style={{ transitionDelay: `${i * 30}ms` }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-semibold">(4.2)</span>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 mt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                ${product.price}
              </span>
              <span className="text-xs text-green-600 font-semibold">Free shipping</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
