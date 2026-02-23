# Delivery System App - แผนงานการพัฒนาแบบละเอียด

## 1. ภาพรวมโปรเจค (Project Overview)

ระบบสั่งซื้อและจัดส่งสินค้าสำหรับร้านค้า (Shop Delivery System)
- **โทนสี**: เขียวมิ้น (Mint Green) - `#4ECDC4` / `#A8E6CF` / `#E0F7FA`
- **แนวคิด**: Mobile-first, PWA, SPA
- **เข้าถึงผ่าน**: Web Browser ปกติ + LINE LIFF

---

## 2. Tech Stack

| เทคโนโลยี | ใช้ทำอะไร |
|---|---|
| **Next.js 14 (App Router)** | Framework หลัก, SSR/SSG, API Routes |
| **React 18** | UI Components |
| **TypeScript** | Type safety |
| **TailwindCSS** | Styling (mint green theme) |
| **Supabase** | Auth, PostgreSQL Database, Realtime subscriptions, Storage (รูปสินค้า) |
| **Vercel** | Hosting & Deployment |
| **PWA (next-pwa)** | Offline support, Push notifications, Install to home screen |
| **LINE LIFF SDK** | LINE Login, LINE integration |
| **Zustand** | Client state management |
| **React Hook Form + Zod** | Form validation |
| **date-fns** | Date formatting (i18n) |
| **Lucide React** | Icons |

---

## 3. โครงสร้างระบบ 3 ส่วนหลัก

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### ส่วนที่ 1: ระบบหลังบ้านและรับออเดอร์ (Admin Panel)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Route**: `/admin/*`
**ผู้ใช้**: เจ้าของร้าน, พนักงานรับออเดอร์

#### 1.1 Dashboard (หน้าหลัก)
- สรุปยอดขายวันนี้ / สัปดาห์ / เดือน
- จำนวนออเดอร์ตามสถานะ (ใหม่, กำลังเตรียม, กำลังส่ง, สำเร็จ, ยกเลิก)
- กราฟรายได้ (แบบง่าย)
- รายการออเดอร์ล่าสุด (Realtime)
- การแจ้งเตือนออเดอร์ใหม่ (เสียง + Push notification)

#### 1.2 จัดการออเดอร์ (Order Management)
- รายการออเดอร์ทั้งหมด (filter ตามสถานะ/วันที่)
- **Board View** (Kanban): ออเดอร์ใหม่ → กำลังเตรียม → รอจัดส่ง → กำลังส่ง → สำเร็จ
- **List View**: ตารางรายการออเดอร์
- รายละเอียดออเดอร์: สินค้า, จำนวน, ราคา, ที่อยู่, เบอร์โทร, หมายเหตุ
- อัพเดทสถานะออเดอร์
- มอบหมายพนักงานจัดส่ง (Assign driver)
- พิมพ์ใบเสร็จ / ใบส่งของ
- ยกเลิกออเดอร์ (พร้อมเหตุผล)

#### 1.3 จัดการเมนู/สินค้า (Product Management)
- CRUD สินค้า (ชื่อ, รูป, ราคา, รายละเอียด, หมวดหมู่)
- อัพโหลดรูปสินค้า (Supabase Storage)
- จัดหมวดหมู่ (Categories)
- เปิด/ปิด สถานะสินค้า (พร้อมขาย / หมด / ซ่อน)
- จัดลำดับการแสดงผล (Drag & drop sorting)
- ตั้งราคาพิเศษ / โปรโมชั่น
- ตัวเลือกสินค้า (Options/Variants): ขนาด, ระดับความหวาน, topping ฯลฯ

#### 1.4 จัดการหมวดหมู่ (Category Management)
- CRUD หมวดหมู่
- จัดลำดับหมวดหมู่
- รูปหมวดหมู่

#### 1.5 จัดการพนักงานจัดส่ง (Driver Management)
- เพิ่ม/แก้ไข/ลบ พนักงาน
- ดูสถานะ (ว่าง / กำลังส่ง / ออฟไลน์)
- ประวัติการจัดส่ง
- สรุปผลงานจัดส่ง

#### 1.6 ตั้งค่าร้านค้า (Shop Settings)
- ข้อมูลร้าน (ชื่อ, โลโก้, ที่อยู่, เบอร์โทร)
- เวลาเปิด-ปิดร้าน
- พื้นที่จัดส่ง & ค่าจัดส่ง (กำหนดเป็นโซน/ระยะทาง)
- ยอดสั่งซื้อขั้นต่ำ
- วิธีการชำระเงิน (เงินสด, โอนเงิน, PromptPay QR)
- เปิด/ปิดรับออเดอร์
- ข้อความแจ้งเตือน / ประกาศ

#### 1.7 รายงาน (Reports)
- สรุปยอดขายรายวัน/สัปดาห์/เดือน
- สินค้าขายดี (Top products)
- สรุปรายได้ตามช่องทาง (Web / LINE)
- Export CSV/PDF

#### 1.8 จัดการผู้ใช้ (User Management)
- จัดการ Admin / Staff accounts
- กำหนดสิทธิ์ (Role-based: Owner, Manager, Staff)

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### ส่วนที่ 2: ระบบเดลิเวอรี่สำหรับพนักงานจัดส่ง (Driver App)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Route**: `/driver/*`
**ผู้ใช้**: พนักงานจัดส่ง (Delivery driver)

#### 2.1 หน้า Dashboard พนักงาน
- ออเดอร์ที่ได้รับมอบหมาย (Realtime)
- สถานะ: ว่าง / กำลังส่ง
- Toggle เปิด/ปิดรับงาน
- สรุปงานจัดส่งวันนี้

#### 2.2 รายการออเดอร์ที่ต้องส่ง
- รายการออเดอร์ที่ assign มาให้
- รายละเอียด: สินค้า, ที่อยู่ลูกค้า, เบอร์โทร, หมายเหตุ
- ปุ่มโทรหาลูกค้า (tel: link)
- ปุ่มนำทาง (เปิด Google Maps)
- อัพเดทสถานะ: กำลังไปรับ → กำลังส่ง → ส่งสำเร็จ
- ถ่ายรูปยืนยันการจัดส่ง (Camera API)

#### 2.3 ประวัติการจัดส่ง
- รายการจัดส่งที่ผ่านมา
- Filter ตามวันที่
- สรุปจำนวนงาน/รายได้

#### 2.4 แจ้งเตือน
- Push notification เมื่อมีงานใหม่
- เสียงแจ้งเตือน

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### ส่วนที่ 3: ระบบสั่งซื้อสำหรับลูกค้า (Customer App)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Route**: `/` (หน้าหลัก), `/menu/*`, `/cart`, `/checkout`, `/orders/*`
**ผู้ใช้**: ลูกค้าทั่วไป
**เข้าถึง**: Web browser ปกติ + LINE LIFF

#### 3.1 หน้าแรก (Landing/Home)
- โลโก้ร้าน + ชื่อร้าน
- สถานะร้าน (เปิด/ปิด)
- เวลาทำการ
- Banner โปรโมชั่น (Carousel)
- หมวดหมู่สินค้า (Horizontal scroll)
- สินค้าแนะนำ / สินค้ายอดนิยม
- ช่องค้นหาสินค้า

#### 3.2 หน้ารายการสินค้า (Menu/Product List)
- แสดงสินค้าตามหมวดหมู่
- Sticky category tabs (เลื่อนถึงหมวดไหน tab highlight)
- Card view: รูป, ชื่อ, ราคา, ปุ่มเพิ่ม
- แสดง badge "หมด" เมื่อสินค้าหมด
- ค้นหา / กรองสินค้า

#### 3.3 หน้ารายละเอียดสินค้า (Product Detail)
- รูปสินค้าขนาดใหญ่
- ชื่อ, ราคา, รายละเอียด
- ตัวเลือก (Options): ขนาด, ระดับความหวาน, topping ฯลฯ
- กำหนดจำนวน (+/-)
- หมายเหตุเพิ่มเติม
- ปุ่ม "เพิ่มลงตะกร้า"

#### 3.4 ตะกร้าสินค้า (Cart)
- รายการสินค้าในตะกร้า
- แก้ไขจำนวน / ลบสินค้า
- สรุปราคา (ค่าสินค้า + ค่าจัดส่ง + ส่วนลด = ยอดรวม)
- ปุ่ม "สั่งซื้อ"
- Floating cart button (แสดงจำนวนสินค้า + ยอดรวม)

#### 3.5 หน้าชำระเงิน (Checkout)
- ที่อยู่จัดส่ง (เพิ่มใหม่ / เลือกจากที่บันทึก)
- Pin location บน Map (Google Maps / Leaflet)
- เบอร์โทรติดต่อ
- เลือกเวลาจัดส่ง (จัดส่งทันที / กำหนดเวลา)
- เลือกวิธีชำระเงิน (เงินสด / โอนเงิน / PromptPay)
- หมายเหตุถึงร้านค้า
- สรุปรายการ + ราคารวม
- ปุ่ม "ยืนยันสั่งซื้อ"

#### 3.6 หน้ายืนยันออเดอร์ (Order Confirmation)
- หมายเลขออเดอร์
- สถานะ: รอร้านค้ายืนยัน
- รายละเอียดออเดอร์
- QR Code สำหรับ PromptPay (ถ้าเลือกโอนเงิน)
- ปุ่มอัพโหลดสลิปโอนเงิน

#### 3.7 ติดตามออเดอร์ (Order Tracking)
- Realtime status tracking:
  - ✅ สั่งซื้อแล้ว
  - ✅ ร้านค้ายืนยัน
  - ✅ กำลังเตรียม
  - ✅ กำลังจัดส่ง
  - ✅ จัดส่งสำเร็จ
- ข้อมูลพนักงานจัดส่ง (ชื่อ, เบอร์โทร)
- ปุ่มโทรหาพนักงานจัดส่ง / ร้านค้า

#### 3.8 ประวัติการสั่งซื้อ (Order History)
- รายการออเดอร์ที่ผ่านมา
- สั่งซื้ออีกครั้ง (Reorder)
- รายละเอียดออเดอร์

#### 3.9 โปรไฟล์ลูกค้า (Profile)
- ข้อมูลส่วนตัว (ชื่อ, เบอร์โทร)
- ที่อยู่จัดส่ง (เพิ่ม/แก้ไข/ลบ)
- ประวัติการสั่งซื้อ

#### 3.10 LINE LIFF Integration
- Login ผ่าน LINE
- ดึงข้อมูล profile จาก LINE
- Share order confirmation ผ่าน LINE
- เปิดหน้าสั่งซื้อใน LINE app โดยตรง

---

## 4. Database Schema (Supabase PostgreSQL)

### ตารางหลัก:

```
shops
├── id (UUID, PK)
├── name
├── slug
├── logo_url
├── address
├── phone
├── opening_hours (JSONB)
├── delivery_zones (JSONB)
├── min_order_amount
├── is_open (boolean)
├── settings (JSONB)
├── line_liff_id
├── promptpay_id
├── created_at
└── updated_at

categories
├── id (UUID, PK)
├── shop_id (FK → shops)
├── name
├── image_url
├── sort_order
├── is_active
├── created_at
└── updated_at

products
├── id (UUID, PK)
├── shop_id (FK → shops)
├── category_id (FK → categories)
├── name
├── description
├── price (DECIMAL)
├── image_url
├── sort_order
├── status (available / sold_out / hidden)
├── is_recommended (boolean)
├── created_at
└── updated_at

product_options
├── id (UUID, PK)
├── product_id (FK → products)
├── name (เช่น "ขนาด", "ความหวาน")
├── type (single_select / multi_select)
├── is_required (boolean)
├── sort_order
├── created_at
└── updated_at

product_option_choices
├── id (UUID, PK)
├── option_id (FK → product_options)
├── name (เช่น "ไซส์ L", "หวานน้อย")
├── price_adjustment (DECIMAL, +/- ราคาเพิ่ม)
├── sort_order
├── is_available
├── created_at
└── updated_at

profiles (extends Supabase auth.users)
├── id (UUID, PK, FK → auth.users)
├── shop_id (FK → shops, nullable)
├── role (owner / manager / staff / driver / customer)
├── full_name
├── phone
├── avatar_url
├── line_user_id
├── created_at
└── updated_at

customer_addresses
├── id (UUID, PK)
├── customer_id (FK → profiles)
├── label (เช่น "บ้าน", "ที่ทำงาน")
├── address_text
├── latitude (DECIMAL)
├── longitude (DECIMAL)
├── note
├── is_default (boolean)
├── created_at
└── updated_at

orders
├── id (UUID, PK)
├── shop_id (FK → shops)
├── customer_id (FK → profiles)
├── driver_id (FK → profiles, nullable)
├── order_number (auto-increment display number)
├── status (pending / confirmed / preparing / ready / delivering / delivered / cancelled)
├── subtotal (DECIMAL)
├── delivery_fee (DECIMAL)
├── discount (DECIMAL)
├── total (DECIMAL)
├── payment_method (cash / transfer / promptpay)
├── payment_status (pending / paid / refunded)
├── payment_slip_url
├── delivery_address (JSONB)
├── customer_phone
├── customer_name
├── scheduled_at (TIMESTAMP, nullable - สำหรับกำหนดเวลาส่ง)
├── note
├── cancel_reason
├── delivered_photo_url
├── channel (web / line)
├── created_at
└── updated_at

order_items
├── id (UUID, PK)
├── order_id (FK → orders)
├── product_id (FK → products)
├── product_name (snapshot)
├── product_price (snapshot)
├── quantity
├── options (JSONB - snapshot ตัวเลือกที่เลือก)
├── item_note
├── total_price (DECIMAL)
├── created_at
└── updated_at

order_status_logs
├── id (UUID, PK)
├── order_id (FK → orders)
├── status
├── changed_by (FK → profiles)
├── note
├── created_at
└── updated_at

banners
├── id (UUID, PK)
├── shop_id (FK → shops)
├── image_url
├── link_url
├── sort_order
├── is_active
├── start_date
├── end_date
├── created_at
└── updated_at
```

---

## 5. Authentication & Authorization

### Auth Flow:
- **Admin/Staff**: Email + Password (Supabase Auth)
- **Driver**: Email + Password หรือ Magic Link
- **Customer**: LINE Login (via LIFF) หรือ Phone/OTP หรือ Guest checkout (ไม่ต้อง login)

### Row Level Security (RLS):
- Admin เห็นเฉพาะข้อมูลร้านตัวเอง
- Driver เห็นเฉพาะออเดอร์ที่ได้รับมอบหมาย
- Customer เห็นเฉพาะออเดอร์ตัวเอง

### Role-based Access:
| Role | Admin Panel | Driver App | Customer App |
|------|------------|------------|--------------|
| Owner | Full access | ❌ | ❌ |
| Manager | Most access (ไม่รวม settings บางส่วน) | ❌ | ❌ |
| Staff | รับออเดอร์, จัดการออเดอร์ | ❌ | ❌ |
| Driver | ❌ | ✅ | ❌ |
| Customer | ❌ | ❌ | ✅ |

---

## 6. Realtime Features (Supabase Realtime)

- ออเดอร์ใหม่ → แจ้งเตือน Admin ทันที (เสียง + notification)
- สถานะออเดอร์เปลี่ยน → อัพเดทหน้า Customer tracking ทันที
- ออเดอร์ถูก assign → แจ้งเตือน Driver ทันที
- Driver อัพเดทสถานะ → Admin + Customer เห็นทันที

---

## 7. PWA Features

- **Service Worker**: Cache static assets, offline fallback page
- **Web App Manifest**: ติดตั้งเป็น app บน home screen
- **Push Notifications**: แจ้งเตือนออเดอร์ใหม่ (Admin/Driver), สถานะออเดอร์ (Customer)
- **Camera API**: ถ่ายรูปยืนยันจัดส่ง (Driver)
- **Geolocation API**: ตำแหน่ง pin ที่อยู่ (Customer)

---

## 8. โครงสร้างโฟลเดอร์ (Project Structure)

```
/
├── public/
│   ├── icons/             # PWA icons
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
│
├── src/
│   ├── app/
│   │   ├── (customer)/    # Customer-facing pages (route group)
│   │   │   ├── page.tsx              # Home
│   │   │   ├── menu/
│   │   │   │   └── page.tsx          # Menu listing
│   │   │   ├── product/[id]/
│   │   │   │   └── page.tsx          # Product detail
│   │   │   ├── cart/
│   │   │   │   └── page.tsx          # Cart
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx          # Checkout
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Order history
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Order tracking
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # Customer profile
│   │   │   └── layout.tsx            # Customer layout (bottom nav)
│   │   │
│   │   ├── admin/         # Admin pages
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Order management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Order detail
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Add product
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Edit product
│   │   │   ├── categories/
│   │   │   │   └── page.tsx          # Category management
│   │   │   ├── drivers/
│   │   │   │   └── page.tsx          # Driver management
│   │   │   ├── reports/
│   │   │   │   └── page.tsx          # Reports
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # Shop settings
│   │   │   └── layout.tsx            # Admin layout (sidebar)
│   │   │
│   │   ├── driver/        # Driver pages
│   │   │   ├── page.tsx              # Driver dashboard
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Active deliveries
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Delivery detail
│   │   │   ├── history/
│   │   │   │   └── page.tsx          # Delivery history
│   │   │   └── layout.tsx            # Driver layout (bottom nav)
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   ├── callback/
│   │   │   │   └── route.ts          # Auth callback
│   │   │   └── line/
│   │   │       └── page.tsx          # LINE LIFF auth
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── line/
│   │   │   │       └── route.ts      # LINE webhook
│   │   │   └── upload/
│   │   │       └── route.ts          # File upload handler
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── ui/            # Shared UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── ...
│   │   ├── customer/      # Customer-specific components
│   │   │   ├── product-card.tsx
│   │   │   ├── cart-floating-button.tsx
│   │   │   ├── category-tabs.tsx
│   │   │   ├── order-status-tracker.tsx
│   │   │   ├── address-picker.tsx
│   │   │   └── ...
│   │   ├── admin/         # Admin-specific components
│   │   │   ├── sidebar.tsx
│   │   │   ├── order-board.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── product-form.tsx
│   │   │   └── ...
│   │   └── driver/        # Driver-specific components
│   │       ├── delivery-card.tsx
│   │       ├── status-toggle.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── use-cart.ts
│   │   ├── use-orders.ts
│   │   ├── use-realtime.ts
│   │   ├── use-auth.ts
│   │   ├── use-liff.ts
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   ├── middleware.ts          # Auth middleware
│   │   │   └── types.ts              # Generated types
│   │   ├── liff.ts                   # LINE LIFF setup
│   │   ├── utils.ts                  # Utility functions
│   │   └── constants.ts              # App constants
│   │
│   ├── stores/
│   │   ├── cart-store.ts             # Cart state (Zustand)
│   │   └── ui-store.ts              # UI state
│   │
│   └── types/
│       ├── database.ts               # Supabase generated types
│       ├── order.ts
│       ├── product.ts
│       └── ...
│
├── supabase/
│   ├── migrations/                   # Database migrations
│   ├── seed.sql                      # Seed data
│   └── config.toml                   # Supabase config
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```

---

## 9. Design System - Mint Green Theme

### Color Palette:
```
Primary:        #4ECDC4 (Mint Green)
Primary Dark:   #26A69A
Primary Light:  #A8E6CF
Accent:         #FF6B6B (สำหรับ notification/alert)
Background:     #F0FFF4 (เขียวอ่อนมาก)
Surface:        #FFFFFF
Text Primary:   #1A1A2E
Text Secondary: #6B7280
Border:         #E5E7EB
Success:        #10B981
Warning:        #F59E0B
Error:          #EF4444
```

### Typography:
- Font: `Noto Sans Thai` + `Inter` (Google Fonts)
- หัวข้อ: font-bold
- เนื้อหา: font-normal

### Spacing & Sizing:
- Border radius: `rounded-xl` (12px) สำหรับ cards
- Button radius: `rounded-full` สำหรับปุ่มหลัก
- Padding: Mobile `p-4`, Tablet `p-6`
- Bottom navigation height: 64px
- Safe area: `env(safe-area-inset-*)` สำหรับ notch devices

---

## 10. แผนการพัฒนา (Development Phases)

### Phase 1: Foundation & Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Setup TailwindCSS with mint green theme
- [ ] Setup Supabase project & database schema
- [ ] Setup PWA (manifest, service worker)
- [ ] Create shared UI components (Button, Input, Card, Modal, etc.)
- [ ] Setup authentication (Supabase Auth)
- [ ] Setup project folder structure

### Phase 2: Customer App (ระบบลูกค้า)
- [ ] Home page with shop info & banners
- [ ] Menu/Product listing with category tabs
- [ ] Product detail with options
- [ ] Cart system (Zustand store)
- [ ] Checkout flow (address, payment, confirmation)
- [ ] Order tracking (Realtime)
- [ ] Order history
- [ ] Customer profile & addresses

### Phase 3: Admin Panel (ระบบหลังบ้าน)
- [ ] Admin login & auth guard
- [ ] Dashboard with stats
- [ ] Order management (Board + List view)
- [ ] Product CRUD
- [ ] Category management
- [ ] Driver management
- [ ] Shop settings
- [ ] Reports

### Phase 4: Driver App (ระบบพนักงานจัดส่ง)
- [ ] Driver login
- [ ] Active deliveries list
- [ ] Delivery detail & navigation
- [ ] Status updates
- [ ] Photo proof of delivery
- [ ] Delivery history

### Phase 5: LINE LIFF Integration
- [ ] LIFF SDK setup
- [ ] LINE Login integration
- [ ] Customer app within LIFF context
- [ ] Share functionality

### Phase 6: Polish & Optimization
- [ ] Push notifications
- [ ] Sound notifications for admin
- [ ] Performance optimization (virtualization, lazy loading)
- [ ] Accessibility audit (ตาม Web Interface Guidelines)
- [ ] Testing
- [ ] SEO & meta tags

---

## 11. Vercel Web Interface Guidelines ที่จะปฏิบัติตาม

### Accessibility:
- ✅ ทุก icon button ต้องมี `aria-label`
- ✅ ทุก form input ต้องมี `<label>`
- ✅ ใช้ semantic HTML (`<button>`, `<nav>`, `<main>`, `<header>`)
- ✅ ทุกรูปต้องมี `alt` text
- ✅ Focus states ด้วย `focus-visible:ring-*`
- ✅ Skip link สำหรับ main content

### Forms:
- ✅ ใช้ `autocomplete` และ `inputmode` ที่เหมาะสม
- ✅ ไม่ block paste
- ✅ แสดง inline error messages
- ✅ Submit button แสดง spinner ระหว่าง loading
- ✅ เตือนก่อนออกจากหน้าที่มี unsaved changes

### Performance:
- ✅ Virtualize list ที่มี >50 items
- ✅ Lazy loading สำหรับรูปภาพ below-fold
- ✅ `priority` สำหรับ above-fold images
- ✅ `<img>` ต้องมี width + height
- ✅ Preconnect สำหรับ CDN domains

### Animation:
- ✅ `prefers-reduced-motion` support
- ✅ Animate เฉพาะ `transform` / `opacity`
- ✅ ไม่ใช้ `transition: all`

### Touch & Mobile:
- ✅ `touch-action: manipulation`
- ✅ `overscroll-behavior: contain` ใน modal/drawer
- ✅ Safe area insets สำหรับ notch devices

### Dark Mode:
- ✅ รองรับ dark mode ในอนาคต (ใช้ CSS variables)

### Content:
- ✅ Text overflow handling (truncate / line-clamp)
- ✅ Empty states สำหรับทุก list
- ✅ Error messages ที่มี next step

---

## 12. API Endpoints (Next.js Route Handlers)

### Public API:
- `GET /api/shop` - ข้อมูลร้าน
- `GET /api/categories` - รายการหมวดหมู่
- `GET /api/products` - รายการสินค้า
- `GET /api/products/[id]` - รายละเอียดสินค้า
- `POST /api/orders` - สร้างออเดอร์ใหม่
- `GET /api/orders/[id]` - รายละเอียดออเดอร์
- `POST /api/upload` - อัพโหลดรูป (slip, delivery proof)

### Admin API:
- `PATCH /api/admin/orders/[id]` - อัพเดทสถานะออเดอร์
- `POST /api/admin/orders/[id]/assign` - มอบหมาย driver
- `CRUD /api/admin/products` - จัดการสินค้า
- `CRUD /api/admin/categories` - จัดการหมวดหมู่
- `CRUD /api/admin/drivers` - จัดการ driver
- `PATCH /api/admin/settings` - อัพเดทตั้งค่า
- `GET /api/admin/reports` - ข้อมูลรายงาน

### Driver API:
- `GET /api/driver/orders` - ออเดอร์ที่ได้รับ
- `PATCH /api/driver/orders/[id]` - อัพเดทสถานะจัดส่ง
- `PATCH /api/driver/status` - อัพเดทสถานะตัวเอง

### Webhook:
- `POST /api/webhooks/line` - LINE webhook

---

## สรุป

ระบบนี้ประกอบด้วย **~35+ หน้า** และ **~50+ components** แบ่งเป็น 3 ส่วนหลัก:
1. **Customer App**: 10 หน้า - ระบบสั่งซื้อที่ใช้งานง่าย, รองรับ LINE LIFF
2. **Admin Panel**: 15+ หน้า - ระบบจัดการครบวงจร, Realtime order management
3. **Driver App**: 5+ หน้า - ระบบจัดส่งที่เรียบง่ายและรวดเร็ว

Database: **11 ตาราง** บน Supabase พร้อม RLS policies
Realtime: อัพเดทสถานะออเดอร์แบบ real-time ทุกฝั่ง
