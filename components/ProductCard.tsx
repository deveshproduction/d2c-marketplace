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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Hover Overlay - Premium Feel */}
          <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle(product.id);
            }}
            className={`absolute top-3 right-3 p-2 bg-white border border-border transition-all duration-300 z-10 ${isHovered || isInWishlist ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-300 ${isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-foreground/60'
                }`}
            />
          </button>

          {/* Quick Actions at Bottom - Visible on mobile/touch */}
          {/* Quick Actions at Bottom - Visible on mobile/touch, Hover on Desktop */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm border-t border-border transition-all duration-300 md:translate-y-full md:group-hover:translate-y-0 translate-y-0 opacity-100 md:opacity-0 md:group-hover:opacity-100`}>
            <div className="flex gap-2">
              <a
                href={product.buy_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart className="w-3 h-3" />
                Buy Now
              </a>
              <div className="px-3 flex items-center justify-center bg-white border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer">
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 space-y-2 border-t border-border">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.slug}`} className="block flex-1 group/title">
            <h3 className="product-title font-display text-[15px] font-semibold leading-tight line-clamp-2 text-foreground transition-colors">
              {product.name}
            </h3>
          </Link>
          <span className="font-display font-semibold text-foreground shrink-0 text-[15px]">
            ₹{product.price}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.brand && (
              <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest border-r border-border pr-2">
                {product.brand.name}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-foreground/10 text-foreground/10'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {product.new_arrival && (
              <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold uppercase tracking-tighter rounded-sm">
                New
              </span>
            )}
            {product.trending && (
              <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 font-bold uppercase tracking-tighter rounded-sm">
                Hot
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

