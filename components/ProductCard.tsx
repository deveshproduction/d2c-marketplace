'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart, ExternalLink } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onWishlistToggle: (productId: string) => void;
  isInWishlist: boolean;
}

export default function ProductCard({ product, onWishlistToggle, isInWishlist }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'INR': '₹',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$'
    };
    return symbols[currency] || currency;
  };

  // Fallback image
  const imageSrc = imageError || !product.image_url
    ? 'https://placehold.co/800x800/f5f5f5/999999?text=Product'
    : product.image_url;

  return (
    <div
      className="product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block relative">
        {/* Image Container - FIXED: No cropping */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-contain p-4 transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            quality={90}
            onError={() => setImageError(true)}
            unoptimized={imageSrc.includes('placehold')}
          />

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 \${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle(product.id);
            }}
            className={`absolute top-3 right-3 p-2 bg-white border border-border transition-all duration-300 z-10 rounded-sm \${
              isHovered || isInWishlist ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-300 \${
                isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-foreground/60'
              }`}
            />
          </button>

          {/* Badges */}
          {(product.new_arrival || product.trending) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.new_arrival && (
                <span className="px-2 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-wider">
                  New
                </span>
              )}
              {product.trending && (
                <span className="px-2 py-1 bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider">
                  Hot
                </span>
              )}
            </div>
          )}

          {/* Quick Actions - Mobile always visible, Desktop on hover */}
          <div className={`absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-white/95 backdrop-blur-sm border-t border-border transition-all duration-300 md:translate-y-full md:group-hover:translate-y-0 translate-y-0 opacity-100 md:opacity-0 md:group-hover:opacity-100`}>
            <div className="flex gap-1.5 md:gap-2">
              <a
                href={product.buy_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 md:py-2 bg-primary text-white text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm"
              >
                <ShoppingCart className="w-3 h-3" />
                Buy Now
              </a>
              <Link
                href={`/product/\${product.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="px-2 md:px-3 flex items-center justify-center bg-white border border-border text-foreground hover:bg-secondary transition-colors rounded-sm"
              >
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-2.5 md:p-4 space-y-1.5 md:space-y-2 border-t border-border bg-white">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/\${product.slug}`} className="block flex-1 group/title">
            <h3 className="product-title font-display text-[12px] md:text-[15px] font-semibold leading-tight line-clamp-2 text-foreground group-hover/title:text-primary transition-colors min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
          <span className="font-display font-bold text-foreground shrink-0 text-[13px] md:text-[16px] whitespace-nowrap">
            {getCurrencySymbol(product.currency)}{Math.round(product.price).toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {/* Brand and Category */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.brand && (
              <span className="text-[9px] md:text-[11px] font-bold text-foreground/40 uppercase tracking-widest line-clamp-1">
                {product.brand.name}
              </span>
            )}
            {product.category && product.brand && (
              <span className="text-[9px] text-foreground/20">•</span>
            )}
            {product.category && (
              <Link 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // You can add category filter logic here
                }}
                className="text-[9px] md:text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors"
              >
                {product.category.name}
              </Link>
            )}
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 \${
                  i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-foreground/10 text-foreground/10'
                }`}
              />
            ))}
            <span className="text-[9px] text-foreground/40 ml-1">(4.0)</span>
          </div>

          {/* Tags */}
          {(product.featured || product.trending || product.new_arrival) && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.featured && (
                <span className="text-[8px] md:text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 font-bold uppercase tracking-tighter rounded-sm border border-amber-200">
                  Featured
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}