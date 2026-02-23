-- ============================================================
-- Seed Data for ชาชัก BKK - Thai Drink House
-- Run this AFTER schema.sql has been applied
-- ============================================================

BEGIN;

-- ============================================================
-- Helper Function: increment_daily_sales
-- Used by API routes to atomically update daily sales counts
-- ============================================================
CREATE OR REPLACE FUNCTION increment_daily_sales(
  p_shop_id UUID,
  p_product_id UUID,
  p_sale_date DATE,
  p_quantity INTEGER
) RETURNS void AS $$
BEGIN
  INSERT INTO daily_product_sales (shop_id, product_id, sale_date, quantity_sold)
  VALUES (p_shop_id, p_product_id, p_sale_date, p_quantity)
  ON CONFLICT (shop_id, product_id, sale_date)
  DO UPDATE SET quantity_sold = daily_product_sales.quantity_sold + p_quantity;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Fixed UUIDs for easy reference
-- ============================================================
-- Shop:       00000000-0000-0000-0000-000000000001
-- Categories: cat-00000000-0000-0000-0000-000000000001 through 006
-- Products:   prod-0000-0000-0000-0000-000000000001 through 012
-- Promotions: promo-000-0000-0000-0000-000000000001 through 003

-- ============================================================
-- 1. SHOP
-- ============================================================
INSERT INTO shops (
  id, name, slug, logo_url, cover_url, address, phone,
  opening_hours, delivery_zones, min_order_amount, is_open,
  settings, scheduling_settings, order_limits, promptpay_id
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ชาชัก BKK - Thai Drink House',
  'cha-chak-bkk',
  '/images/logo.png',
  '/images/cover.jpg',
  '123/4 ซ.สุขุมวิท 55 (ทองหล่อ) แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
  '02-123-4567',
  '{
    "mon": { "open": "08:00", "close": "20:00", "is_open": true },
    "tue": { "open": "08:00", "close": "20:00", "is_open": true },
    "wed": { "open": "08:00", "close": "20:00", "is_open": true },
    "thu": { "open": "08:00", "close": "20:00", "is_open": true },
    "fri": { "open": "08:00", "close": "21:00", "is_open": true },
    "sat": { "open": "09:00", "close": "21:00", "is_open": true },
    "sun": { "open": "09:00", "close": "18:00", "is_open": true }
  }',
  '[
    { "id": "zone-1", "name": "ทองหล่อ-เอกมัย", "max_distance_km": 3, "fee": 20 },
    { "id": "zone-2", "name": "สุขุมวิท", "max_distance_km": 5, "fee": 35, "extra_per_km": 5 },
    { "id": "zone-3", "name": "กรุงเทพชั้นใน", "max_distance_km": 10, "fee": 50, "extra_per_km": 8 }
  ]',
  50,
  true,
  '{
    "currency": "THB",
    "tax_rate": 0,
    "accept_cash": true,
    "accept_transfer": true,
    "accept_promptpay": true
  }',
  '{
    "enabled": true,
    "min_advance_minutes": 60,
    "max_advance_days": 3,
    "slot_interval_minutes": 30,
    "max_orders_per_slot": 10,
    "blocked_dates": [],
    "blocked_weekdays": [],
    "blocked_slots": []
  }',
  '{
    "max_items_per_order": 20,
    "max_orders_per_day": 200
  }',
  '0812345678'
);

-- ============================================================
-- 2. CATEGORIES (6 categories)
-- ============================================================
INSERT INTO categories (id, shop_id, name, icon, sort_order, is_active) VALUES
  ('cat00000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'เครื่องดื่มเย็น', '🧊', 1, true),
  ('cat00000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'เครื่องดื่มร้อน', '☕', 2, true),
  ('cat00000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ชานม', '🧋', 3, true),
  ('cat00000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'กาแฟ', '🫘', 4, true),
  ('cat00000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'ของหวาน', '🍰', 5, true),
  ('cat00000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'เบเกอรี่', '🥐', 6, true);

-- ============================================================
-- 3. PRODUCTS (12+ products across categories)
-- ============================================================

-- เครื่องดื่มเย็น (Iced Drinks)
INSERT INTO products (id, shop_id, category_id, name, description, price, sort_order, status, is_recommended, daily_limit) VALUES
  ('prod0000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000003',
   'ชานมไข่มุก', 'ชานมสูตรพิเศษของร้าน เสิร์ฟพร้อมไข่มุกนุ่มหนึบ', 55, 1, 'available', true, 100),

  ('prod0000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000001',
   'มัทฉะลาเต้เย็น', 'มัทฉะเกรดพรีเมียมจากเกียวโต ผสมนมสดเข้มข้น', 65, 2, 'available', true, 80),

  ('prod0000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000004',
   'กาแฟลาเต้เย็น', 'กาแฟอาราบิก้าคั่วกลาง เบลนด์เฉพาะของร้าน ลาเต้สไตล์ไทย', 60, 3, 'available', true, NULL),

  ('prod0000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000001',
   'ชาเขียวมะลิเย็น', 'ชาเขียวหอมมะลิสดชื่น เสิร์ฟเย็นพร้อมน้ำผึ้ง', 45, 4, 'available', false, NULL),

  ('prod0000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000001',
   'น้ำมะม่วงปั่น', 'มะม่วงน้ำดอกไม้สดปั่นละเอียด หวานธรรมชาติ', 75, 5, 'available', true, 50),

-- เครื่องดื่มร้อน (Hot Drinks)
  ('prod0000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000002',
   'โกโก้ร้อน', 'โกโก้เข้มข้นจากช็อกโกแลตแท้ เสิร์ฟร้อนหอมกรุ่น', 55, 6, 'available', false, NULL),

  ('prod0000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000004',
   'อเมริกาโน่ร้อน', 'เอสเพรสโซช็อตคู่ เข้มลึก หอมกลิ่นถั่วคั่ว', 50, 7, 'available', false, NULL),

-- ชานม (Milk Tea)
  ('prod0000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000003',
   'ชาไทยนมสด', 'ชาไทยต้นตำรับ เสิร์ฟกับนมสดเข้มข้น สีส้มสวย', 50, 8, 'available', true, 120),

  ('prod0000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000003',
   'ชาชัก สเปเชียล', 'ชาชักสไตล์มาเลเซีย ฟองนุ่ม หวานมัน สูตรพิเศษร้านเรา', 65, 9, 'available', true, 60),

-- ของหวาน (Desserts)
  ('prod0000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000005',
   'เค้กส้ม', 'เค้กเนื้อนุ่มรสส้มสดใส ท็อปด้วยครีมส้มหอม', 85, 10, 'available', false, 30),

  ('prod0000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000005',
   'บัวลอยมะพร้าวอ่อน', 'บัวลอยนุ่มๆ ในน้ำกะทิหอมมะพร้าวอ่อน เสิร์ฟเย็น', 55, 11, 'sold_out', false, 40),

-- เบเกอรี่ (Bakery)
  ('prod0000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000006',
   'ครัวซองต์เนยสด', 'ครัวซองต์อบใหม่ทุกวัน เนื้อกรอบนอกนุ่มใน เนยหอมฟุ้ง', 65, 12, 'available', true, 40),

  ('prod0000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000006',
   'สโคนลาเวนเดอร์', 'สโคนเนื้อร่วนหอมลาเวนเดอร์ เสิร์ฟพร้อมแยมสตรอว์เบอร์รี', 55, 13, 'available', false, 25),

  ('prod0000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'cat00000-0000-0000-0000-000000000001',
   'สมูทตี้เบอร์รี่', 'สตรอว์เบอร์รี่ บลูเบอร์รี่ ราสเบอร์รี่ ปั่นรวมกับโยเกิร์ต', 80, 14, 'sold_out', false, 30);

-- ============================================================
-- 3b. PRODUCT OPTIONS (ขนาด, ความหวาน, ท็อปปิ้ง for drink products)
-- ============================================================

-- We create options for the drink products (products 1-9)
-- Option: ขนาด (Size) - single_select, required
DO $$
DECLARE
  p_id UUID;
  opt_id UUID;
  product_ids UUID[] := ARRAY[
    'prod0000-0000-0000-0000-000000000001',
    'prod0000-0000-0000-0000-000000000002',
    'prod0000-0000-0000-0000-000000000003',
    'prod0000-0000-0000-0000-000000000004',
    'prod0000-0000-0000-0000-000000000005',
    'prod0000-0000-0000-0000-000000000006',
    'prod0000-0000-0000-0000-000000000007',
    'prod0000-0000-0000-0000-000000000008',
    'prod0000-0000-0000-0000-000000000009'
  ];
BEGIN
  FOREACH p_id IN ARRAY product_ids
  LOOP
    -- ขนาด (Size)
    opt_id := uuid_generate_v4();
    INSERT INTO product_options (id, product_id, name, type, is_required, sort_order)
    VALUES (opt_id, p_id, 'ขนาด', 'single_select', true, 1);

    INSERT INTO product_option_choices (option_id, name, price_adjustment, sort_order, is_available) VALUES
      (opt_id, 'S (12 oz)', -10, 1, true),
      (opt_id, 'M (16 oz)', 0, 2, true),
      (opt_id, 'L (22 oz)', 10, 3, true);

    -- ระดับความหวาน (Sweetness Level)
    opt_id := uuid_generate_v4();
    INSERT INTO product_options (id, product_id, name, type, is_required, sort_order)
    VALUES (opt_id, p_id, 'ระดับความหวาน', 'single_select', true, 2);

    INSERT INTO product_option_choices (option_id, name, price_adjustment, sort_order, is_available) VALUES
      (opt_id, 'หวาน 0%', 0, 1, true),
      (opt_id, 'หวาน 25%', 0, 2, true),
      (opt_id, 'หวาน 50%', 0, 3, true),
      (opt_id, 'หวาน 75%', 0, 4, true),
      (opt_id, 'หวาน 100%', 0, 5, true);

    -- ท็อปปิ้ง (Toppings) - multi_select, optional
    opt_id := uuid_generate_v4();
    INSERT INTO product_options (id, product_id, name, type, is_required, sort_order)
    VALUES (opt_id, p_id, 'ท็อปปิ้ง', 'multi_select', false, 3);

    INSERT INTO product_option_choices (option_id, name, price_adjustment, sort_order, is_available) VALUES
      (opt_id, 'ไข่มุก', 10, 1, true),
      (opt_id, 'วุ้นมะพร้าว', 10, 2, true),
      (opt_id, 'เจลลี่ลิ้นจี่', 10, 3, true),
      (opt_id, 'วิปครีม', 15, 4, true),
      (opt_id, 'ช็อตเอสเพรสโซ', 20, 5, true);
  END LOOP;
END;
$$;

-- ============================================================
-- 4. BANNERS (3 promotional banners)
-- ============================================================
INSERT INTO banners (shop_id, image_url, title, subtitle, link_url, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001',
   '/images/banners/banner1.jpg',
   'เปิดร้านใหม่! ชาชัก BKK',
   'ลด 20% ทุกเมนู วันนี้ - สิ้นเดือนนี้',
   NULL,
   1, true),
  ('00000000-0000-0000-0000-000000000001',
   '/images/banners/banner2.jpg',
   'ชาชัก สเปเชียล เมนูใหม่!',
   'ชาชักสไตล์มาเลเซีย ฟองนุ่ม หวานมัน ลองเลย!',
   NULL,
   2, true),
  ('00000000-0000-0000-0000-000000000001',
   '/images/banners/banner3.jpg',
   'สั่งครบ 200 บาท ส่งฟรี!',
   'จัดส่งฟรีทั่วเขตทองหล่อ-เอกมัย',
   NULL,
   3, true);

-- ============================================================
-- 5. SAMPLE ORDERS (5 orders with different statuses)
-- We use uuid_generate_v4() for customer/driver IDs as placeholders
-- In production these would be real auth.users IDs
-- ============================================================

-- Generate placeholder customer IDs
DO $$
DECLARE
  customer1_id UUID := uuid_generate_v4();
  customer2_id UUID := uuid_generate_v4();
  customer3_id UUID := uuid_generate_v4();
  customer4_id UUID := uuid_generate_v4();
  customer5_id UUID := uuid_generate_v4();
  driver1_id UUID := uuid_generate_v4();
  order1_id UUID := uuid_generate_v4();
  order2_id UUID := uuid_generate_v4();
  order3_id UUID := uuid_generate_v4();
  order4_id UUID := uuid_generate_v4();
  order5_id UUID := uuid_generate_v4();
BEGIN

  -- ── Order 1: PENDING ──
  INSERT INTO orders (
    id, shop_id, order_number, status,
    subtotal, delivery_fee, discount, total,
    payment_method, payment_status,
    delivery_address, customer_phone, customer_name,
    order_type, note
  ) VALUES (
    order1_id,
    '00000000-0000-0000-0000-000000000001',
    'ORD-20260223-001',
    'pending',
    130, 20, 0, 150,
    'promptpay', 'paid',
    '{"label": "บ้าน", "address_text": "123/45 หมู่บ้านสวนสวย ซ.ลาดพร้าว 71 กรุงเทพฯ 10310", "latitude": 13.8012, "longitude": 100.5891, "note": "บ้านหลังมุม ประตูสีฟ้า"}',
    '089-111-2222',
    'คุณสมศรี',
    'delivery',
    'ฝากวางหน้าประตูได้ค่ะ'
  );

  INSERT INTO order_items (order_id, product_id, product_name, product_image, product_price, quantity, options, item_note, total_price) VALUES
    (order1_id, 'prod0000-0000-0000-0000-000000000001', 'ชานมไข่มุก', NULL, 55, 2,
     '[{"option_name": "ขนาด", "choice_name": "M (16 oz)", "price_adjustment": 0}, {"option_name": "ระดับความหวาน", "choice_name": "หวาน 50%", "price_adjustment": 0}]',
     '', 110),
    (order1_id, 'prod0000-0000-0000-0000-000000000004', 'ชาเขียวมะลิเย็น', NULL, 45, 1,
     '[{"option_name": "ขนาด", "choice_name": "S (12 oz)", "price_adjustment": -10}, {"option_name": "ระดับความหวาน", "choice_name": "หวาน 25%", "price_adjustment": 0}]',
     'ไม่ใส่น้ำแข็ง', 35);

  INSERT INTO order_status_logs (order_id, status, note) VALUES
    (order1_id, 'pending', 'ออเดอร์ใหม่จากลูกค้า');

  -- ── Order 2: PREPARING ──
  INSERT INTO orders (
    id, shop_id, order_number, status,
    subtotal, delivery_fee, discount, total,
    payment_method, payment_status,
    delivery_address, customer_phone, customer_name,
    order_type, note
  ) VALUES (
    order2_id,
    '00000000-0000-0000-0000-000000000001',
    'ORD-20260223-002',
    'preparing',
    200, 35, 0, 235,
    'promptpay', 'paid',
    '{"label": "ออฟฟิศ", "address_text": "อาคาร ABC ชั้น 15 ถ.สาทร กรุงเทพฯ 10120", "latitude": 13.7215, "longitude": 100.5281, "note": "ลิฟต์ฝั่งซ้าย ขึ้นชั้น 15"}',
    '091-222-3333',
    'คุณวิชัย',
    'delivery',
    'ฝากไว้ที่เคาน์เตอร์ ชั้น 15'
  );

  INSERT INTO order_items (order_id, product_id, product_name, product_image, product_price, quantity, options, item_note, total_price) VALUES
    (order2_id, 'prod0000-0000-0000-0000-000000000003', 'กาแฟลาเต้เย็น', NULL, 60, 3,
     '[{"option_name": "ขนาด", "choice_name": "L (22 oz)", "price_adjustment": 10}, {"option_name": "ระดับความหวาน", "choice_name": "หวาน 50%", "price_adjustment": 0}]',
     '', 210);

  INSERT INTO order_status_logs (order_id, status, note) VALUES
    (order2_id, 'pending', 'ออเดอร์ใหม่'),
    (order2_id, 'preparing', 'ร้านเริ่มเตรียมออเดอร์');

  -- ── Order 3: READY (waiting for driver) ──
  INSERT INTO orders (
    id, shop_id, order_number, status,
    subtotal, delivery_fee, discount, total,
    payment_method, payment_status,
    delivery_address, customer_phone, customer_name,
    order_type, note
  ) VALUES (
    order3_id,
    '00000000-0000-0000-0000-000000000001',
    'ORD-20260223-003',
    'ready',
    140, 20, 0, 160,
    'cash', 'pending',
    '{"label": "บ้าน", "address_text": "55 ซ.สุขุมวิท 55 คลองตัน วัฒนา กรุงเทพฯ 10110", "latitude": 13.7310, "longitude": 100.5745, "note": ""}',
    '082-333-4444',
    'คุณนภา',
    'delivery',
    ''
  );

  INSERT INTO order_items (order_id, product_id, product_name, product_image, product_price, quantity, options, item_note, total_price) VALUES
    (order3_id, 'prod0000-0000-0000-0000-000000000002', 'มัทฉะลาเต้เย็น', NULL, 65, 1,
     '[{"option_name": "ขนาด", "choice_name": "M (16 oz)", "price_adjustment": 0}, {"option_name": "ระดับความหวาน", "choice_name": "หวาน 75%", "price_adjustment": 0}]',
     '', 65),
    (order3_id, 'prod0000-0000-0000-0000-000000000010', 'เค้กส้ม', NULL, 85, 1,
     '[]',
     '', 85);

  INSERT INTO order_status_logs (order_id, status, note) VALUES
    (order3_id, 'pending', 'ออเดอร์ใหม่'),
    (order3_id, 'preparing', 'ร้านเริ่มเตรียม'),
    (order3_id, 'ready', 'เตรียมเสร็จ รอไรเดอร์');

  -- ── Order 4: DELIVERING ──
  INSERT INTO orders (
    id, shop_id, order_number, status,
    subtotal, delivery_fee, discount, total,
    payment_method, payment_status,
    delivery_address, customer_phone, customer_name,
    order_type, note
  ) VALUES (
    order4_id,
    '00000000-0000-0000-0000-000000000001',
    'ORD-20260223-004',
    'delivering',
    175, 35, 0, 210,
    'promptpay', 'paid',
    '{"label": "คอนโด", "address_text": "คอนโด The Line สุขุมวิท 101 ห้อง 2305 กรุงเทพฯ 10260", "latitude": 13.6806, "longitude": 100.6012, "note": "จอดรถหน้าล็อบบี้ โทรแจ้งด้วยค่ะ"}',
    '095-444-5555',
    'คุณมานี',
    'delivery',
    'รบกวนโทรก่อนถึง 5 นาทีค่ะ'
  );

  INSERT INTO order_items (order_id, product_id, product_name, product_image, product_price, quantity, options, item_note, total_price) VALUES
    (order4_id, 'prod0000-0000-0000-0000-000000000009', 'ชาชัก สเปเชียล', NULL, 65, 1,
     '[{"option_name": "ขนาด", "choice_name": "L (22 oz)", "price_adjustment": 10}, {"option_name": "ระดับความหวาน", "choice_name": "หวาน 100%", "price_adjustment": 0}]',
     '', 75),
    (order4_id, 'prod0000-0000-0000-0000-000000000008', 'ชาไทยนมสด', NULL, 50, 1,
     '[{"option_name": "ขนาด", "choice_name": "M (16 oz)", "price_adjustment": 0}, {"option_name": "ระดับความหวาน", "choice_name": "หวาน 75%", "price_adjustment": 0}]',
     '', 50),
    (order4_id, 'prod0000-0000-0000-0000-000000000012', 'ครัวซองต์เนยสด', NULL, 65, 1,
     '[]',
     'อุ่นให้ด้วยนะคะ', 65);

  INSERT INTO order_status_logs (order_id, status, note) VALUES
    (order4_id, 'pending', 'ออเดอร์ใหม่'),
    (order4_id, 'preparing', 'เริ่มเตรียม'),
    (order4_id, 'ready', 'เตรียมเสร็จ'),
    (order4_id, 'delivering', 'ไรเดอร์รับของแล้ว กำลังจัดส่ง');

  -- ── Order 5: DELIVERED (completed) ──
  INSERT INTO orders (
    id, shop_id, order_number, status,
    subtotal, delivery_fee, discount, total,
    payment_method, payment_status,
    delivery_address, customer_phone, customer_name,
    order_type, note,
    created_at
  ) VALUES (
    order5_id,
    '00000000-0000-0000-0000-000000000001',
    'ORD-20260223-005',
    'delivered',
    310, 20, 50, 280,
    'promptpay', 'paid',
    '{"label": "ออฟฟิศ", "address_text": "อาคาร สิลม คอมเพล็กซ์ ชั้น 8 ถ.สีลม กรุงเทพฯ 10500", "latitude": 13.7263, "longitude": 100.5347, "note": "แจ้ง รปภ. ว่ามาส่งของ"}',
    '086-555-6666',
    'คุณพิชัย',
    'delivery',
    '',
    NOW() - INTERVAL '2 hours'
  );

  INSERT INTO order_items (order_id, product_id, product_name, product_image, product_price, quantity, options, item_note, total_price) VALUES
    (order5_id, 'prod0000-0000-0000-0000-000000000001', 'ชานมไข่มุก', NULL, 55, 2,
     '[{"option_name": "ขนาด", "choice_name": "L (22 oz)", "price_adjustment": 10}, {"option_name": "ระดับความหวาน", "choice_name": "หวาน 50%", "price_adjustment": 0}, {"option_name": "ท็อปปิ้ง", "choice_name": "ไข่มุก", "price_adjustment": 10}]',
     '', 150),
    (order5_id, 'prod0000-0000-0000-0000-000000000005', 'น้ำมะม่วงปั่น', NULL, 75, 1,
     '[{"option_name": "ขนาด", "choice_name": "L (22 oz)", "price_adjustment": 10}]',
     '', 85),
    (order5_id, 'prod0000-0000-0000-0000-000000000012', 'ครัวซองต์เนยสด', NULL, 65, 1,
     '[]',
     '', 65);

  INSERT INTO order_status_logs (order_id, status, note) VALUES
    (order5_id, 'pending', 'ออเดอร์ใหม่'),
    (order5_id, 'preparing', 'เริ่มเตรียม'),
    (order5_id, 'ready', 'เตรียมเสร็จ'),
    (order5_id, 'delivering', 'กำลังจัดส่ง'),
    (order5_id, 'delivered', 'ส่งสำเร็จแล้ว');

END;
$$;

-- ============================================================
-- 6. DAILY PRODUCT SALES (entries for today)
-- ============================================================
INSERT INTO daily_product_sales (shop_id, product_id, sale_date, quantity_sold) VALUES
  ('00000000-0000-0000-0000-000000000001', 'prod0000-0000-0000-0000-000000000001', CURRENT_DATE, 18),
  ('00000000-0000-0000-0000-000000000001', 'prod0000-0000-0000-0000-000000000002', CURRENT_DATE, 12),
  ('00000000-0000-0000-0000-000000000001', 'prod0000-0000-0000-0000-000000000003', CURRENT_DATE, 25),
  ('00000000-0000-0000-0000-000000000001', 'prod0000-0000-0000-0000-000000000005', CURRENT_DATE, 8),
  ('00000000-0000-0000-0000-000000000001', 'prod0000-0000-0000-0000-000000000008', CURRENT_DATE, 15),
  ('00000000-0000-0000-0000-000000000001', 'prod0000-0000-0000-0000-000000000009', CURRENT_DATE, 10),
  ('00000000-0000-0000-0000-000000000001', 'prod0000-0000-0000-0000-000000000012', CURRENT_DATE, 7);

-- ============================================================
-- 7. PROMOTIONS (3 promotions)
-- ============================================================

-- Promotion 1: DELIVERY_DISCOUNT - free delivery over 200 THB
INSERT INTO promotions (
  id, shop_id, name, description, promotion_type,
  is_active, priority, stackable, auto_apply,
  starts_at, ends_at,
  conditions, actions, limits
) VALUES (
  'promo000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'ส่งฟรี! สั่งครบ 200 บาท',
  'สั่งเครื่องดื่มครบ 200 บาทขึ้นไป ส่งฟรีทุกโซน!',
  'DELIVERY_DISCOUNT',
  true, 10, false, true,
  '2026-01-01 00:00:00+07',
  '2026-12-31 23:59:59+07',
  '{"min_order_amount": 200}',
  '{"discount_type": "fixed", "discount_value": 50, "max_discount": 50, "applies_to": "delivery_fee"}',
  '{"max_total_uses": null, "max_uses_per_customer": null, "max_uses_per_customer_per_day": 3, "max_total_budget": null, "current_spent": 0, "max_total_quantity": null}'
);

-- Promotion 2: NEW_CUSTOMER - 50 THB off first order
INSERT INTO promotions (
  id, shop_id, name, description, promotion_type,
  is_active, priority, stackable, auto_apply,
  starts_at, ends_at,
  conditions, actions, limits
) VALUES (
  'promo000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'ลูกค้าใหม่ลด 50 บาท!',
  'สมัครสมาชิกใหม่ ใช้โค้ด NEWBIE50 ลดทันที 50 บาท สำหรับออเดอร์แรก',
  'NEW_CUSTOMER',
  true, 20, false, false,
  '2026-01-01 00:00:00+07',
  '2026-06-30 23:59:59+07',
  '{"min_order_amount": 100, "new_customer_only": true}',
  '{"discount_type": "fixed", "discount_value": 50, "max_discount": 50, "applies_to": "order_total"}',
  '{"max_total_uses": 1000, "max_uses_per_customer": 1, "max_uses_per_customer_per_day": 1, "max_total_budget": 50000, "current_spent": 0, "max_total_quantity": null}'
);

-- Promotion 3: ORDER_DISCOUNT - 15% off orders over 300 THB
INSERT INTO promotions (
  id, shop_id, name, description, promotion_type,
  is_active, priority, stackable, auto_apply,
  starts_at, ends_at,
  conditions, actions, limits
) VALUES (
  'promo000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'ลด 15% เมื่อสั่งครบ 300 บาท',
  'สั่งครบ 300 บาท ใช้โค้ด SAVE15 ลดทันที 15% สูงสุด 100 บาท',
  'ORDER_DISCOUNT',
  true, 15, false, false,
  '2026-02-01 00:00:00+07',
  '2026-03-31 23:59:59+07',
  '{"min_order_amount": 300}',
  '{"discount_type": "percentage", "discount_value": 15, "max_discount": 100, "applies_to": "order_total"}',
  '{"max_total_uses": 500, "max_uses_per_customer": 5, "max_uses_per_customer_per_day": 1, "max_total_budget": 30000, "current_spent": 0, "max_total_quantity": null}'
);

-- ============================================================
-- 8. PROMOTION CODES
-- ============================================================

-- Code for NEW_CUSTOMER promotion
INSERT INTO promotion_codes (promotion_id, code, is_active, max_uses, used_count) VALUES
  ('promo000-0000-0000-0000-000000000002', 'NEWBIE50', true, 1000, 0);

-- Code for ORDER_DISCOUNT promotion
INSERT INTO promotion_codes (promotion_id, code, is_active, max_uses, used_count) VALUES
  ('promo000-0000-0000-0000-000000000003', 'SAVE15', true, 500, 0);

-- DELIVERY_DISCOUNT is auto_apply = true, no code needed, but add one anyway for flexibility
INSERT INTO promotion_codes (promotion_id, code, is_active, max_uses, used_count) VALUES
  ('promo000-0000-0000-0000-000000000001', 'FREESHIP', true, NULL, 0);

COMMIT;
