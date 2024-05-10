CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  shipping_address TEXT,
  is_seller BOOLEAN NOT NULL DEFAULT FALSE,
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  price_in_cents INTEGER NOT NULL,
  meat_type VARCHAR NOT NULL,
  cut_type VARCHAR NOT NULL,
  weight_in_grams INTEGER NOT NULL,
  image_url TEXT,
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  price_paid_in_cents INTEGER NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  rating DECIMAL(3,1) NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
  comment TEXT,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE sellers (
  seller_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  company_name VARCHAR(100) NOT NULL,
  contact_info TEXT,
  rating DECIMAL(3, 2) CHECK (rating BETWEEN 0 AND 5),
  sales_count INTEGER DEFAULT 0,
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE order_products (
  order_product_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id),
  quantity INTEGER NOT NULL,
  price_in_cents INTEGER NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);
