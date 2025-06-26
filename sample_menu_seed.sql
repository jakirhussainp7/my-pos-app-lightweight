-- Sample Menu Categories
INSERT INTO menu_categories (name, description) VALUES
('Biryani', 'Delicious biryani varieties'),
('Main Course', 'Hearty main dishes'),
('Desserts', 'Sweet treats to finish your meal');

-- Sample Menu Groups
INSERT INTO menu_groups (name, description) VALUES
('Veg', 'Vegetarian dishes'),
('Non-Veg', 'Non-vegetarian dishes');

-- Sample Menu Items
INSERT INTO menu_items (name, price, category_id, group_id, description, active) VALUES
('Veg Biryani', 180.00, (SELECT id FROM menu_categories WHERE name = 'Biryani'), (SELECT id FROM menu_groups WHERE name = 'Veg'), 'Aromatic rice with vegetables', true),
('Chicken Biryani', 220.00, (SELECT id FROM menu_categories WHERE name = 'Biryani'), (SELECT id FROM menu_groups WHERE name = 'Non-Veg'), 'Classic chicken biryani', true),
('Paneer Butter Masala', 160.00, (SELECT id FROM menu_categories WHERE name = 'Main Course'), (SELECT id FROM menu_groups WHERE name = 'Veg'), 'Paneer in creamy tomato gravy', true),
('Chicken Curry', 200.00, (SELECT id FROM menu_categories WHERE name = 'Main Course'), (SELECT id FROM menu_groups WHERE name = 'Non-Veg'), 'Spicy chicken curry', true),
('Gulab Jamun', 80.00, (SELECT id FROM menu_categories WHERE name = 'Desserts'), NULL, 'Sweet milk dumplings', true),
('Ice Cream', 60.00, (SELECT id FROM menu_categories WHERE name = 'Desserts'), NULL, 'Assorted flavors', true);
