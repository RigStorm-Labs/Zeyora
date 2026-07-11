# Zeyora - Next-Generation Delivery Service App Specification

## 1. Project Overview

### Project Name
**Zeyora** - A unified delivery service platform

### Core Functionality
Multi-platform delivery service application enabling customers to order food, groceries, and parcels; delivery partners to fulfill orders with optimized routing; vendors to manage their businesses; and administrators to oversee all operations.

### Target Users
- **Customers**: End-users ordering delivery services via mobile app
- **Delivery Partners**: Independent contractors delivering orders
- **Vendors**: Businesses (restaurants, grocery stores, retailers) selling products
- **Administrators**: Internal staff managing platform operations

### Technology Stack
- **Mobile Apps**: React Native (Expo) - iOS & Android
- **Web Apps**: React.js with TypeScript
- **Backend**: Node.js with Express.js
- **Databases**: PostgreSQL (structured data), MongoDB (flexible/catalog data)
- **Authentication**: JWT with refresh tokens, OAuth 2.0 for social login
- **Maps**: Google Maps API / Mapbox for tracking and routing
- **Payments**: Razorpay, Stripe integrations
- **Cloud**: AWS (EC2, RDS, S3, CloudFront)
- **Containerization**: Docker, Kubernetes-ready
- **CI/CD**: GitHub Actions

---

## 2. Architecture Design

### Monorepo Structure
```
zeyora/
├── apps/
│   ├── user-app/           # React Native - Customer app
│   ├── partner-app/        # React Native - Delivery partner app
│   ├── vendor-dashboard/   # React.js web - Vendor admin
│   └── admin-panel/        # React.js web - Platform admin
├── packages/
│   ├── api/                # Express.js backend
│   ├── shared/              # Shared types, utilities
│   └── config/             # Shared configurations
├── docker/
├── k8s/                    # Kubernetes manifests
└── docs/                   # Documentation
```

### Microservices Architecture (Future-Ready)
1. **Auth Service** - Authentication & authorization
2. **Order Service** - Order management & processing
3. **User Service** - Customer profile & preferences
4. **Partner Service** - Delivery partner management
5. **Vendor Service** - Vendor/business management
6. **Payment Service** - Payment processing
7. **Notification Service** - Push notifications, emails
8. **Analytics Service** - Reporting & insights
9. **Location Service** - GPS tracking & routing

---

## 3. Database Schema

### PostgreSQL (Primary - Relational Data)

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'customer', -- customer, partner, vendor, admin
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Partners Table
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  vehicle_type VARCHAR(50), -- bike, car, van
  vehicle_number VARCHAR(50),
  license_number VARCHAR(100),
  kyc_status VARCHAR(20) DEFAULT 'pending',
  kyc_documents JSONB,
  bank_details JSONB,
  current_location JSONB,
  is_available BOOLEAN DEFAULT false,
  rating DECIMAL(3,2),
  total_deliveries INTEGER DEFAULT 0,
  earnings_wallet DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Vendors Table
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  business_name VARCHAR(255),
  business_type VARCHAR(50), -- restaurant, grocery, retail, pharmacy
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  operating_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2),
  commission_rate DECIMAL(5,2),
  bank_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE,
  customer_id UUID REFERENCES users(id),
  vendor_id UUID REFERENCES vendors(id),
  partner_id UUID REFERENCES partners(id),
  status VARCHAR(30) DEFAULT 'pending',
  -- pending, confirmed, preparing, ready, assigned, picked_up, in_transit, delivered, cancelled
  order_type VARCHAR(20), -- food, grocery, parcel
  items JSONB,
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  tax DECIMAL(10,2),
  discount DECIMAL(10,2),
  total DECIMAL(10,2),
  payment_method VARCHAR(20),
  payment_status VARCHAR(20) DEFAULT 'pending',
  delivery_address JSONB,
  pickup_address JSONB,
  special_instructions TEXT,
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20), -- payment, payout, refund, bonus
  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'INR',
  payment_method VARCHAR(30),
  payment_gateway VARCHAR(30),
  gateway_transaction_id VARCHAR(255),
  status VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### MongoDB (Catalog & Analytics)

#### Products Collection
```javascript
{
  _id: ObjectId,
  vendor_id: UUID,
  name: String,
  description: String,
  category: String,
  subcategory: String,
  images: [String],
  price: Decimal,
  compare_at_price: Decimal,
  currency: String,
  unit: String, // kg, piece, liter, etc.
  in_stock: Boolean,
  stock_quantity: Number,
  variants: [{
    name: String,
    options: [{name: String, price: Decimal}]
  }],
  add_ons: [{
    name: String,
    price: Decimal
  }],
  preparation_time: Number, // minutes
  tags: [String],
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### Analytics Events Collection
```javascript
{
  _id: ObjectId,
  event_type: String, // page_view, product_view, add_to_cart, search, etc.
  user_id: UUID,
  session_id: String,
  device_type: String,
  platform: String, // ios, android, web
  properties: Object,
  timestamp: Date
}
```

---

## 4. API Endpoints

### Authentication API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout user |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| POST | /api/auth/verify-otp | Verify OTP |
| POST | /api/auth/social/google | Google OAuth |
| POST | /api/auth/social/apple | Apple OAuth |

### User API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/profile | Get user profile |
| PUT | /api/users/profile | Update profile |
| POST | /api/users/addresses | Add address |
| GET | /api/users/addresses | Get addresses |
| PUT | /api/users/addresses/:id | Update address |
| DELETE | /api/users/addresses/:id | Delete address |
| GET | /api/users/orders | Get order history |
| GET | /api/users/orders/:id | Get order details |
| POST | /api/users/favorites | Add to favorites |
| GET | /api/users/favorites | Get favorites |
| GET | /api/users/wallet | Get wallet balance |

### Vendor API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vendors | List vendors |
| GET | /api/vendors/:id | Get vendor details |
| GET | /api/vendors/:id/products | Get vendor products |
| POST | /api/vendors/:id/products | Add product |
| PUT | /api/vendors/:id/products/:pid | Update product |
| DELETE | /api/vendors/:id/products/:pid | Delete product |
| GET | /api/vendors/:id/orders | Get vendor orders |
| PUT | /api/vendors/:id/orders/:oid | Update order status |
| GET | /api/vendors/analytics | Get analytics |

### Order API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Create order |
| GET | /api/orders/:id | Get order details |
| PUT | /api/orders/:id/status | Update order status |
| POST | /api/orders/:id/cancel | Cancel order |
| GET | /api/orders/:id/track | Track order live |
| POST | /api/orders/:id/rate | Rate order |

### Partner API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/partners/register | Register as partner |
| GET | /api/partners/profile | Get partner profile |
| PUT | /api/partners/profile | Update profile |
| POST | /api/partners/kyc | Submit KYC documents |
| GET | /api/partners/earnings | Get earnings report |
| GET | /api/partners/orders | Get available orders |
| POST | /api/orders/:id/accept | Accept order |
| POST | /api/orders/:id/reject | Reject order |
| PUT | /api/partners/location | Update location |
| PUT | /api/partners/availability | Toggle availability |
| POST | /api/partners/sos | Trigger SOS |

### Payment API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create | Create payment intent |
| POST | /api/payments/verify | Verify payment |
| POST | /api/payments/refund | Process refund |
| GET | /api/payments/history | Payment history |

### Admin API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List all users |
| GET | /api/admin/vendors | List all vendors |
| GET | /api/admin/partners | List all partners |
| GET | /api/admin/orders | List all orders |
| GET | /api/admin/analytics | Platform analytics |
| PUT | /api/admin/commissions | Update commission rates |
| GET | /api/admin/reports/fraud | Fraud detection alerts |
| POST | /api/admin/suspend | Suspend user/vendor/partner |

---

## 5. UI/UX Design

### Design System
- **Primary Color**: #FF6B35 (Vibrant Orange)
- **Secondary Color**: #004E89 (Deep Blue)
- **Accent Color**: #2EC4B6 (Teal)
- **Success**: #2ECC71
- **Warning**: #F39C12
- **Error**: #E74C3C
- **Background Light**: #F8F9FA
- **Background Dark**: #1A1A2E
- **Text Primary**: #2D3436
- **Text Secondary**: #636E72

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: Inter Bold, 600-700 weight
- **Body**: Inter Regular, 400 weight
- **Sizes**: 12px (caption), 14px (body), 16px (subtitle), 20px (title), 24px (h2), 32px (h1)

### Spacing System (8pt Grid)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Mobile App Screens

#### User App
1. **Splash Screen** - Logo animation, app loading
2. **Onboarding** - 3-screen carousel with app features
3. **Login/Register** - Phone/email, social login buttons
4. **Home** - Search bar, categories, featured vendors, nearby deals
5. **Search Results** - Filter, sort, grid/list view
6. **Vendor Details** - Menu, reviews, info tabs
7. **Cart** - Items, customization, apply coupon, checkout
8. **Checkout** - Address, payment method, order summary
9. **Order Tracking** - Live map, driver info, ETA
10. **Order History** - Past orders, reorder, track active
11. **Profile** - Personal info, addresses, payment methods
12. **Settings** - Notifications, dark mode, language
13. **Rewards** - Points, coupons, referral program

#### Partner App
1. **Splash Screen**
2. **Login**
3. **Dashboard** - Today's earnings, active orders, stats
4. **Available Orders** - List with pickup/distance details
5. **Order Details** - Customer info, items, route
6. **Active Delivery** - Navigation, customer contact, complete
7. **Earnings** - Daily/weekly/monthly breakdown
8. **Performance** - Rating, delivery stats
9. **KYC Status** - Document submission progress
10. **SOS** - Emergency button with location sharing

#### Vendor Dashboard (Web)
1. **Login**
2. **Dashboard** - Today's orders, revenue, ratings
3. **Orders** - New, preparing, ready, completed tabs
4. **Menu Management** - Add/edit products, categories
5. **Inventory** - Stock levels, low stock alerts
6. **Analytics** - Sales, popular items, peak hours
7. **Reviews** - Customer feedback
8. **Settings** - Business info, hours, notifications

#### Admin Panel (Web)
1. **Login**
2. **Dashboard** - KPIs, live map, recent activity
3. **Users** - Customer management
4. **Vendors** - Vendor approval, management
5. **Partners** - Delivery partner management
6. **Orders** - All orders with filters
7. **Analytics** - Comprehensive reports
8. **Fraud Detection** - Alerts and investigation
9. **Payouts** - Commission, partner payouts
10. **Settings** - Platform configuration

---

## 6. Security Requirements

### Authentication
- JWT with 15-minute access tokens
- Refresh tokens with 7-day expiry
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints (5 attempts/15 min)
- Account lockout after 5 failed attempts

### Data Protection
- End-to-end encryption for sensitive data
- HTTPS-only for all communications
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (content security policy)
- CSRF tokens for state-changing operations

### Compliance
- GDPR data subject rights
- India IT Act compliance
- PCI DSS for payment data
- Regular security audits
- Penetration testing (quarterly)

---

## 7. Performance Requirements

### Speed
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- API response time: < 200ms (p95)
- Image loading: Progressive with placeholders

### Scalability
- Support 10,000+ concurrent users
- Handle 1,000 orders/minute peak
- Auto-scaling based on CPU/memory
- CDN for static assets

### Reliability
- 99.9% uptime SLA
- Graceful degradation
- Circuit breakers for external services
- Multi-region disaster recovery

---

## 8. Offline Capabilities

- Cache vendor menus locally
- Store cart in local storage
- Queue orders when offline, sync when online
- Show cached order history
- Offline order status updates

---

## 9. Testing Strategy

### Unit Tests
- All business logic functions
- Utility functions
- API endpoint handlers

### Integration Tests
- Database operations
- Authentication flows
- Payment processing

### E2E Tests
- Critical user journeys
- Order placement flow
- Payment flow

### Load Testing
- 10x normal traffic simulation
- Identify bottlenecks

---

## 10. Deployment Configuration

### Environments
- **Development**: Local, mock services
- **Staging**: AWS staging environment
- **Production**: AWS production with multi-AZ

### Docker Setup
- Multi-stage builds for optimized images
- Separate containers for each service
- Docker Compose for local development

### Kubernetes (Future)
- Horizontal pod autoscaling
- Rolling deployments
- Health checks and readiness probes
- ConfigMaps and Secrets management

---

## 11. Future Enhancements (Phase 2+)

- AI-powered demand prediction
- Blockchain-based payment ledger
- IoT smart locker integration
- AR/VR vendor showcases
- Multi-language support
- Dark mode (default)
- Voice ordering assistant
