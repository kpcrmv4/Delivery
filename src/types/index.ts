// ============ Shop ============
export interface Shop {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  cover_url: string;
  address: string;
  phone: string;
  opening_hours: OpeningHours;
  delivery_zones: DeliveryZone[];
  min_order_amount: number;
  is_open: boolean;
  settings: ShopSettings;
  scheduling_settings: SchedulingSettings;
  order_limits: OrderLimits;
  promptpay_id: string;
}

export interface OpeningHours {
  [key: string]: { open: string; close: string; is_open: boolean };
}

export interface DeliveryZone {
  id: string;
  name: string;
  max_distance_km: number;
  fee: number;
  extra_per_km?: number;
}

export interface ShopSettings {
  currency: string;
  tax_rate: number;
  accept_cash: boolean;
  accept_transfer: boolean;
  accept_promptpay: boolean;
}

// ============ Scheduling ============
export interface SchedulingSettings {
  enabled: boolean;
  min_advance_minutes: number;
  max_advance_days: number;
  slot_interval_minutes: number;
  max_orders_per_slot: number;
  blocked_dates: string[];
  blocked_weekdays: number[];
  blocked_slots: { date: string; slots: string[] }[];
}

export interface OrderLimits {
  max_items_per_order: number;
  max_orders_per_day: number;
}

// ============ Category ============
export interface Category {
  id: string;
  shop_id: string;
  name: string;
  icon: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

// ============ Product ============
export interface Product {
  id: string;
  shop_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sort_order: number;
  status: "available" | "sold_out" | "hidden";
  is_recommended: boolean;
  is_favorite?: boolean;
  daily_limit: number | null;
  daily_sold: number;
  max_per_order: number | null;
  options: ProductOption[];
}

export interface ProductOption {
  id: string;
  name: string;
  type: "single_select" | "multi_select";
  is_required: boolean;
  sort_order: number;
  choices: ProductOptionChoice[];
}

export interface ProductOptionChoice {
  id: string;
  name: string;
  price_adjustment: number;
  is_available: boolean;
}

// ============ Cart ============
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selected_options: SelectedOption[];
  note: string;
  item_price: number;
  total_price: number;
}

export interface SelectedOption {
  option_id: string;
  option_name: string;
  choice_id: string;
  choice_name: string;
  price_adjustment: number;
}

// ============ Order ============
export interface Order {
  id: string;
  shop_id: string;
  customer_id: string;
  driver_id: string | null;
  order_number: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: "cash" | "transfer" | "promptpay";
  payment_status: "pending" | "paid" | "refunded";
  payment_slip_url: string | null;
  delivery_address: DeliveryAddress;
  customer_phone: string;
  customer_name: string;
  scheduled_date: string | null;
  scheduled_slot: string | null;
  note: string;
  cancel_reason: string | null;
  driver: Driver | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivering"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  quantity: number;
  options: SelectedOption[];
  item_note: string;
  total_price: number;
}

export interface DeliveryAddress {
  label: string;
  address_text: string;
  latitude: number;
  longitude: number;
  note: string;
}

// ============ Driver ============
export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar_url: string;
  status: "available" | "busy" | "offline";
  total_deliveries: number;
}

// ============ Promotion ============
export type PromotionType =
  | "DELIVERY_DISCOUNT"
  | "ORDER_DISCOUNT"
  | "PRODUCT_DISCOUNT"
  | "BUY_X_GET_Y"
  | "BUNDLE"
  | "LOYALTY_REWARD"
  | "NEW_CUSTOMER"
  | "MIN_QUANTITY"
  | "FLASH_SALE"
  | "PAYMENT_METHOD"
  | "REFERRAL"
  | "HAPPY_HOUR"
  | "RE_ORDER"
  | "WEATHER_BASED";

export interface Promotion {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  promotion_type: PromotionType;
  image_url: string | null;
  is_active: boolean;
  priority: number;
  stackable: boolean;
  auto_apply: boolean;
  starts_at: string;
  ends_at: string | null;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  limits: PromotionLimits;
  codes: PromotionCode[];
  usage_count: number;
  created_at: string;
}

export interface PromotionLimits {
  max_total_uses: number | null;
  max_uses_per_customer: number | null;
  max_uses_per_customer_per_day: number | null;
  max_total_budget: number | null;
  current_spent: number;
  max_total_quantity: number | null;
}

export interface PromotionCode {
  id: string;
  code: string;
  is_active: boolean;
  max_uses: number | null;
  used_count: number;
}

// ============ Banner ============
export interface Banner {
  id: string;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

// ============ Profile ============
export interface Profile {
  id: string;
  role: "owner" | "manager" | "staff" | "driver" | "customer";
  full_name: string;
  phone: string;
  avatar_url: string;
  email: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  address_text: string;
  latitude: number;
  longitude: number;
  note: string;
  is_default: boolean;
}
