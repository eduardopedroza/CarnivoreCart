CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  shipping_address TEXT
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  meat_type VARCHAR(50) NOT NULL,
  cut_type VARCHAR(50) NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  image_url TEXT
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id),
  quantity INTEGER NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL
);

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sellers (
  seller_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  company_name VARCHAR(100) NOT NULL,
  contact_info TEXT,
  rating DECIMAL(3, 2) CHECK (rating BETWEEN 0 AND 5),
  sales_count INTEGER DEFAULT 0
);
