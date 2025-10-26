-- Seed data for POS system

-- Insert sample products
INSERT INTO products (name, price, category, stock, image_url) VALUES
('Kopi Americano', 15000, 'Minuman', 100, '/placeholder.svg?height=200&width=200'),
('Kopi Latte', 18000, 'Minuman', 100, '/placeholder.svg?height=200&width=200'),
('Cappuccino', 17000, 'Minuman', 100, '/placeholder.svg?height=200&width=200'),
('Teh Tarik', 12000, 'Minuman', 100, '/placeholder.svg?height=200&width=200'),
('Jus Jeruk', 14000, 'Minuman', 100, '/placeholder.svg?height=200&width=200'),

('Nasi Goreng', 25000, 'Makanan', 50, '/placeholder.svg?height=200&width=200'),
('Mie Ayam', 20000, 'Makanan', 50, '/placeholder.svg?height=200&width=200'),
('Gado-gado', 18000, 'Makanan', 50, '/placeholder.svg?height=200&width=200'),
('Sate Ayam', 22000, 'Makanan', 50, '/placeholder.svg?height=200&width=200'),
('Bakso', 16000, 'Makanan', 50, '/placeholder.svg?height=200&width=200'),

('Keripik Singkong', 8000, 'Snack', 200, '/placeholder.svg?height=200&width=200'),
('Kacang Goreng', 6000, 'Snack', 200, '/placeholder.svg?height=200&width=200'),
('Pisang Goreng', 10000, 'Snack', 100, '/placeholder.svg?height=200&width=200'),
('Tahu Isi', 7000, 'Snack', 150, '/placeholder.svg?height=200&width=200'),
('Cireng', 5000, 'Snack', 150, '/placeholder.svg?height=200&width=200');

-- Insert sample transactions for testing
INSERT INTO transactions (total_amount, payment_method, cashier_name, receipt_number, transaction_date) VALUES
(33000, 'cash', 'Siti', 'TXN-001', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(45000, 'cashless', 'Budi', 'TXN-002', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(28000, 'cash', 'Siti', 'TXN-003', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Insert transaction items
INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, total_price) VALUES
(1, 1, 'Kopi Americano', 1, 15000, 15000),
(1, 6, 'Nasi Goreng', 1, 25000, 25000),
(2, 2, 'Kopi Latte', 2, 18000, 36000),
(2, 11, 'Keripik Singkong', 1, 8000, 8000),
(3, 4, 'Teh Tarik', 1, 12000, 12000),
(3, 7, 'Mie Ayam', 1, 20000, 20000);
