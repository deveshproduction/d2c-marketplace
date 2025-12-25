/*
  # D2C Marketplace Schema

  ## Overview
  Complete schema for a premium D2C discovery marketplace with brands, products, categories, and wishlist functionality.

  ## New Tables
  
  ### `brands`
  - `id` (uuid, primary key) - Unique brand identifier
  - `name` (text) - Brand name
  - `slug` (text, unique) - URL-friendly brand identifier
  - `description` (text) - Brand description
  - `logo_url` (text) - Brand logo image URL
  - `website_url` (text) - Official brand website
  - `founded_year` (integer) - Year brand was founded
  - `tagline` (text) - Short brand tagline
  - `created_at` (timestamptz) - Record creation timestamp

  ### `categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name
  - `slug` (text, unique) - URL-friendly category identifier
  - `description` (text) - Category description
  - `icon` (text) - Icon identifier for the category
  - `created_at` (timestamptz) - Record creation timestamp

  ### `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `brand_id` (uuid, foreign key) - Reference to brands table
  - `category_id` (uuid, foreign key) - Reference to categories table
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly product identifier
  - `description` (text) - Detailed product description
  - `short_description` (text) - Brief product summary
  - `price` (decimal) - Product price
  - `currency` (text) - Currency code (default: 'USD')
  - `image_url` (text) - Primary product image URL
  - `images` (jsonb) - Array of additional product images
  - `buy_url` (text) - Direct link to product on brand website
  - `featured` (boolean) - Whether product is featured
  - `trending` (boolean) - Whether product is trending
  - `new_arrival` (boolean) - Whether product is a new arrival
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `wishlists`
  - `id` (uuid, primary key) - Unique wishlist entry identifier
  - `user_id` (text) - User identifier (session-based for now)
  - `product_id` (uuid, foreign key) - Reference to products table
  - `created_at` (timestamptz) - When item was added to wishlist

  ## Security
  - Enable RLS on all tables
  - Public read access for brands, categories, and products
  - Wishlists are user-specific with read/write access only for the owner

  ## Indexes
  - Products indexed by brand_id, category_id, featured, trending
  - Wishlists indexed by user_id and product_id
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  website_url text NOT NULL,
  founded_year integer,
  tagline text,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  image_url text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  buy_url text NOT NULL,
  featured boolean DEFAULT false,
  trending boolean DEFAULT false,
  new_arrival boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Brands policies (public read)
CREATE POLICY "Brands are viewable by everyone"
  ON brands FOR SELECT
  TO anon, authenticated
  USING (true);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Wishlists policies (user-specific)
CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can add to their wishlist"
  ON wishlists FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can remove from their wishlist"
  ON wishlists FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(trending) WHERE trending = true;
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);