-- ============================================================
-- Delivery System Database Schema
-- Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SHOPS
-- ============================================================
CREATE TABLE shops (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    slug                TEXT UNIQUE NOT NULL,
    logo_url            TEXT,
    cover_url           TEXT,
    address             TEXT,
    phone               TEXT,
    opening_hours       JSONB DEFAULT '{}',
    delivery_zones      JSONB DEFAULT '[]',
    min_order_amount    DECIMAL(10,2) DEFAULT 0,
    is_open             BOOLEAN DEFAULT true,
    settings            JSONB DEFAULT '{}',
    scheduling_settings JSONB DEFAULT '{
        "enabled": false,
        "min_advance_minutes": 60,
        "max_advance_days": 3,
        "slot_interval_minutes": 30,
        "max_orders_per_slot": 10,
        "blocked_dates": [],
        "blocked_weekdays": [],
        "blocked_slots": []
    }',
    order_limits        JSONB DEFAULT '{
        "max_items_per_order": 20,
        "max_orders_per_day": 200
    }',
    promptpay_id        TEXT,
    line_liff_id        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    icon        TEXT,
    image_url   TEXT,
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_shop ON categories(shop_id);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    image_url       TEXT,
    sort_order      INTEGER DEFAULT 0,
    status          TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'hidden')),
    is_recommended  BOOLEAN DEFAULT false,
    daily_limit     INTEGER,          -- NULL = no limit
    max_per_order   INTEGER,          -- NULL = no limit
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_category ON products(category_id);

-- ============================================================
-- 4. PRODUCT OPTIONS
-- ============================================================
CREATE TABLE product_options (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    type        TEXT DEFAULT 'single_select' CHECK (type IN ('single_select', 'multi_select')),
    is_required BOOLEAN DEFAULT false,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_options_product ON product_options(product_id);

-- ============================================================
-- 5. PRODUCT OPTION CHOICES
-- ============================================================
CREATE TABLE product_option_choices (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_id        UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    sort_order       INTEGER DEFAULT 0,
    is_available     BOOLEAN DEFAULT true,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_choices_option ON product_option_choices(option_id);

-- ============================================================
-- 6. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_id      UUID REFERENCES shops(id) ON DELETE SET NULL,
    role         TEXT DEFAULT 'customer' CHECK (role IN ('owner', 'manager', 'staff', 'driver', 'customer')),
    full_name    TEXT,
    phone        TEXT,
    avatar_url   TEXT,
    line_user_id TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_shop ON profiles(shop_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================
-- 7. CUSTOMER ADDRESSES
-- ============================================================
CREATE TABLE customer_addresses (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label        TEXT DEFAULT 'บ้าน',
    address_text TEXT NOT NULL,
    latitude     DECIMAL(10,7),
    longitude    DECIMAL(10,7),
    note         TEXT,
    is_default   BOOLEAN DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON customer_addresses(customer_id);

-- ============================================================
-- 8. ORDERS
-- ============================================================
CREATE TABLE orders (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id            UUID NOT NULL REFERENCES shops(id),
    customer_id        UUID REFERENCES profiles(id),
    driver_id          UUID REFERENCES profiles(id),
    order_number       TEXT NOT NULL,
    status             TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')),
    subtotal           DECIMAL(10,2) DEFAULT 0,
    delivery_fee       DECIMAL(10,2) DEFAULT 0,
    discount           DECIMAL(10,2) DEFAULT 0,
    total              DECIMAL(10,2) DEFAULT 0,
    payment_method     TEXT CHECK (payment_method IN ('cash', 'transfer', 'promptpay')),
    payment_status     TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_slip_url   TEXT,
    delivery_address   JSONB,
    customer_phone     TEXT,
    customer_name      TEXT,
    order_type         TEXT DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup')),
    scheduled_date     DATE,
    scheduled_slot     TEXT,
    note               TEXT,
    cancel_reason      TEXT,
    delivered_photo_url TEXT,
    channel            TEXT DEFAULT 'web' CHECK (channel IN ('web', 'line')),
    promotion_id       UUID,
    promotion_code     TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_scheduled ON orders(scheduled_date, scheduled_slot);

-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    UUID REFERENCES products(id),
    product_name  TEXT NOT NULL,
    product_image TEXT,
    product_price DECIMAL(10,2) NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1,
    options       JSONB DEFAULT '[]',
    item_note     TEXT,
    total_price   DECIMAL(10,2) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- 10. ORDER STATUS LOGS
-- ============================================================
CREATE TABLE order_status_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status      TEXT NOT NULL,
    changed_by  UUID REFERENCES profiles(id),
    note        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_logs_order ON order_status_logs(order_id);

-- ============================================================
-- 11. BANNERS
-- ============================================================
CREATE TABLE banners (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    title       TEXT,
    subtitle    TEXT,
    link_url    TEXT,
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_banners_shop ON banners(shop_id);

-- ============================================================
-- 12. DAILY PRODUCT SALES (Quantity Tracking)
-- ============================================================
CREATE TABLE daily_product_sales (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id       UUID NOT NULL REFERENCES shops(id),
    product_id    UUID NOT NULL REFERENCES products(id),
    sale_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity_sold INTEGER DEFAULT 0,
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, product_id, sale_date)
);

CREATE INDEX idx_daily_sales_date ON daily_product_sales(sale_date);

-- ============================================================
-- 13. PROMOTIONS
-- ============================================================
CREATE TABLE promotions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    promotion_type  TEXT NOT NULL CHECK (promotion_type IN (
        'DELIVERY_DISCOUNT', 'ORDER_DISCOUNT', 'PRODUCT_DISCOUNT',
        'BUY_X_GET_Y', 'BUNDLE', 'LOYALTY_REWARD', 'NEW_CUSTOMER',
        'MIN_QUANTITY', 'FLASH_SALE', 'PAYMENT_METHOD', 'REFERRAL',
        'HAPPY_HOUR', 'RE_ORDER', 'WEATHER_BASED'
    )),
    image_url       TEXT,
    is_active       BOOLEAN DEFAULT true,
    priority        INTEGER DEFAULT 0,
    stackable       BOOLEAN DEFAULT false,
    auto_apply      BOOLEAN DEFAULT false,
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ,
    conditions      JSONB DEFAULT '{}',
    actions         JSONB DEFAULT '{}',
    limits          JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promotions_shop ON promotions(shop_id);
CREATE INDEX idx_promotions_type ON promotions(promotion_type);
CREATE INDEX idx_promotions_active ON promotions(is_active, starts_at, ends_at);

-- ============================================================
-- 14. PROMOTION CODES
-- ============================================================
CREATE TABLE promotion_codes (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id  UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    code          TEXT NOT NULL,
    is_active     BOOLEAN DEFAULT true,
    max_uses      INTEGER,
    used_count    INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(code)
);

CREATE INDEX idx_promo_codes_promotion ON promotion_codes(promotion_id);
CREATE INDEX idx_promo_codes_code ON promotion_codes(code);

-- ============================================================
-- 15. PROMOTION USAGES
-- ============================================================
CREATE TABLE promotion_usages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id    UUID NOT NULL REFERENCES promotions(id),
    code_id         UUID REFERENCES promotion_codes(id),
    customer_id     UUID REFERENCES profiles(id),
    order_id        UUID REFERENCES orders(id),
    discount_amount DECIMAL(10,2),
    used_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promo_usages_promotion ON promotion_usages(promotion_id);
CREATE INDEX idx_promo_usages_customer ON promotion_usages(customer_id);

-- ============================================================
-- 16. CUSTOMER WALLETS (Loyalty / Cashback)
-- ============================================================
CREATE TABLE customer_wallets (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    balance       DECIMAL(10,2) DEFAULT 0,
    points        INTEGER DEFAULT 0,
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- ============================================================
-- 17. REFERRAL CODES
-- ============================================================
CREATE TABLE referral_codes (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id   UUID NOT NULL REFERENCES profiles(id),
    code          TEXT NOT NULL UNIQUE,
    usage_count   INTEGER DEFAULT 0,
    max_uses      INTEGER,
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            t
        );
    END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Public read for shop data
CREATE POLICY "Public can read shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read products" ON products FOR SELECT USING (status != 'hidden');
CREATE POLICY "Public can read promotions" ON promotions FOR SELECT USING (is_active = true);

-- Admin can manage their shop
CREATE POLICY "Admin manages shop" ON shops FOR ALL USING (
    id IN (SELECT shop_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
);

CREATE POLICY "Admin manages categories" ON categories FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'staff'))
);

CREATE POLICY "Admin manages products" ON products FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'staff'))
);

-- Order access
CREATE POLICY "Customers see own orders" ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Drivers see assigned orders" ON orders FOR SELECT USING (driver_id = auth.uid());
CREATE POLICY "Admin sees shop orders" ON orders FOR ALL USING (
    shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'staff'))
);

-- Profile access
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
