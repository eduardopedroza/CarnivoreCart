-- INSERT INTO users (first_name, last_name, username, email, password, shipping_address)
-- VALUES ('Test', 'User', 'testuser', 'testuser@gmail.com', 'password', '1234 Test Lane'),
--        ('John', 'Doe', 'johndoe', 'johndoe@gmail.com', 'password', '4567 Elm Street'),
--        ('Jane', 'Smith', 'janesmith', 'janesmith@gmail.com', 'password', '7890 Oak Avenue');

INSERT INTO products (seller_id, name, description, price, meat_type, cut_type, weight, image_url)
VALUES (1, 'Ribeye', 'Premium beef ribeye', 15.99, 'beef', 'steak', 0.5, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
       (1, 'Chicken Wings', 'Tender chicken wings', 9.99, 'chicken', 'wings', 0.8, 'https://www.allrecipes.com/thmb/AtViolcfVtInHgq_mRtv4tPZASQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ALR-187822-baked-chicken-wings-4x3-5c7b4624c8554f3da5aabb7d3a91a209.jpg'),
       (1, 'Pork Ribs', 'Tender pork ribs', 12.99, 'pork', 'ribs', 1.2, 'https://media.istockphoto.com/id/508695276/photo/raw-ribs-with-a-rosemary-and-vegetables-on-crumpled-paper.jpg?s=612x612&w=0&k=20&c=b6Xvh1qTIUtG_j4pvWvsa-DqMm2JLpba194U-tmhFM0='),
       (1, 'Lamb Chops', 'Juicy lamb chops', 18.99, 'lamb', 'chops', 0.7, 'https://www.tastingtable.com/img/gallery/every-cut-of-lamb-ranked-worst-to-best/intro-1652107513.jpg'),
       (1, 'Ground Beef', 'Fresh ground beef', 7.99, 'beef', 'ground', 1.0, 'https://www.southernliving.com/thmb/vIe1diteC_Mq6wEfr1XJCVOmqJc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Ground_Beef_004-1-085c019aefff471d852d4b5ad7495374.jpg'),
       (1, 'Chicken Breast', 'Boneless chicken breast', 6.99, 'chicken', 'breast', 0.5, 'https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F19%2F2012%2F08%2F13%2FGettyImages-182184170.jpg&q=60'),
       (1, 'Beef Ribs', 'Tender beef ribs', 14.99, 'beef', 'ribs', 1.5, 'https://t3.ftcdn.net/jpg/04/30/94/36/360_F_430943600_oTTdITQzgDo6qNDvYygERJhuRYmY6eak.jpg'),
       (1, 'Pork Tenderloin', 'Tender pork tenderloin', 10.99, 'pork', 'tenderloin', 0.8, 'https://www.freshdirect.com/media/images/product/meat_2/prrst_tndr_j.jpg?lastModify=2019-09-03T16:53:38'),
       (1, 'Lamb Leg', 'Roast lamb leg', 22.99, 'lamb', 'leg', 2.0, 'https://st2.depositphotos.com/1821481/7750/i/950/depositphotos_77505698-stock-photo-raw-lamb-leg.jpg'),
       (1, 'Chicken Thighs', 'Boneless chicken thighs', 8.99, 'chicken', 'thighs', 0.6, 'https://media.istockphoto.com/id/1385038910/photo/chicken-thighs.jpg?s=612x612&w=0&k=20&c=lhkcPx4nrdUVeHDKZjYcMkKhbHjFjbRUCOANYPeXf7I='),
       (1, 'Beef Burger Patties', 'Homemade beef burger patties', 9.99, 'beef', 'burger patties', 0.4, 'https://s3.envato.com/files/248946677/38743_.jpg'),
       (1, 'Pork Sausages', 'Traditional pork sausages', 5.99, 'pork', 'sausages', 0.3, 'https://frankiesfreerangemeat.com/cdn/shop/products/IbericoSausage_1400x.jpg?v=1678303153');

INSERT INTO orders (user_id, product_id, quantity, order_date, status)
VALUES (1, 31, 2, '2024-03-18 09:00:00', 'shipped'),
       (2, 32, 1, '2024-03-18 10:00:00', 'pending'),
       (1, 34, 3, '2024-03-18 11:00:00', 'delivered');

INSERT INTO reviews (user_id, product_id, rating, comment, review_date)
VALUES (1, 31, 4, 'Great steak!', '2024-03-18 09:30:00'),
       (2, 32, 5, 'Amazing chicken wings!', '2024-03-18 10:30:00'),
       (1, 35, 3, 'Good ground beef.', '2024-03-18 11:30:00');

