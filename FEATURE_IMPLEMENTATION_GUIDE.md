# TestNova Feature Implementation Guide

**Date:** March 9, 2026  
**Status:** 🎯 IMPLEMENTATION IN PROGRESS  
**Version:** 2.0

---

## 📋 Overview of New Features

This guide covers the implementation of major new features for TestNova:

1. **Guest Login** - Limited access without registration
2. **Landing Page** - Showcase all features and pricing
3. **Pricing Page** - Flexible pricing plans with stripe integration
4. **Ollama Model Selection** - Choose best AI model for your task
5. **ChatGPT-Style Dashboard** - Modern UI with sidebar and chat bubbles
6. **Stripe Payment Gateway** - Secure payment processing
7. **Transaction Tracking** - Payment history in MongoDB

---

## ✨ Feature Details

### 1. Guest Login (Limited Access)

**What Changed:**
- Landing page has "Try as Guest" button
- Guest users get 5 free prompts per session
- No sign-up required
- Guest session stored in localStorage

**Implementation:**
```javascript
// In LandingPageView.vue
const handleGuestLogin = () => {
  const guestToken = `guest_${Date.now()}_${Math.random()}`;
  localStorage.setItem('guestToken', guestToken);
  localStorage.setItem('isGuest', 'true');
  localStorage.setItem('guestPromptsUsed', '0');
  router.push('/dashboard');
};
```

**Location Files:**
- `client/src/views/LandingPageView.vue` - Guest login button
- `client/src/router/index.js` - Router allows guest access to dashboard

**Testing:**
```
1. Click "Try as Guest" on landing page
2. Should be redirected to dashboard
3. Counter shows "5/5 prompts available"
4. After 5 prompts, button disables with "Sign up to continue"
```

---

### 2. Landing Page

**What Changed:**
- New `/` route shows landing page instead of dashboard
- Hero section with CTA buttons
- Features section (6 feature cards)
- Use cases section (4 scenarios)
- Pricing preview
- Models showcase
- Footer with links

**Design Highlights:**
- Gradient backgrounds (slate-950 to cyan-600)
- Responsive grid layout
- Hover animations on cards
- Feature cards with icons
- Pricing cards with popular badge

**Location:**
- `client/src/views/LandingPageView.vue` (450 lines)

**Navigation:**
```
Landing Page (/)
├── Login/Register links (top-right)
├── Try as Guest button
├── Get Started button → /register
└── View Pricing button → /pricing
```

---

### 3. Pricing Page

**What Changed:**
- New `/pricing` route
- 3 pricing tiers: Free ($0), Super ($5), Premium ($10)
- All plans are annual subscriptions
- Feature comparison table
- FAQ section with 5 questions
- Upgrade buttons integrated with Stripe

**Pricing Tiers:**

| Feature | Free | Super | Premium |
|---------|------|-------|---------|
| Daily Prompts | 5 | Unlimited | Unlimited |
| Chat History | 7 days | 90 days | Forever |
| Models | 3 | 6 | 10+ |
| Code Generation | ✗ | ✓ | ✓ |
| Unit Tests | ✗ | ✗ | ✓ |
| API Access | ✗ | ✗ | ✓ |
| Support | Community | Email | 24/7 |

**Location:**
- `client/src/views/PricingView.vue` (450+ lines)

**Upgrade Flow:**
```
User clicks "Upgrade Now"
  ↓
Check if logged in (if not → redirect to /login)
  ↓
Create Stripe checkout session
  ↓
Redirect to Stripe checkout page
  ↓
User completes payment
  ↓
Redirected to /payment-success?session_id=...
```

---

### 4. Ollama Model Selection

**What Changed:**
- Model selector dropdown in dashboard sidebar
- 6 different AI models available
- Models grouped by category: Code vs Testing
- Store selected model preference in localStorage
- Send selected model with each prompt

**Available Models:**

**Code Generation:**
- Mistral 7B - Fast, for all languages
- Neural Chat 7B - Fast, balanced
- Code Llama 13B - Specialized for code
- Deepseek Coder 6.7B - Advanced code understanding

**Testing & Documentation:**
- Llama 2 7B - Comprehensive analysis
- Phind CodeLlama 34B - Expert reviews

**Implementation:**
```javascript
// In prompts.js store
const selectedModel = ref('mistral'); // Default

const setSelectedModel = (modelId) => {
  selectedModel.value = modelId;
  localStorage.setItem('selectedModel', modelId);
};
```

**Location Files:**
- `client/src/store/prompts.js` - Model state and actions
- `client/src/views/DashboardView.vue` - Model selector dropdown

**Usage:**
```
1. Open dashboard
2. See model selector in left sidebar
3. Click dropdown to choose model
4. Description shows below selector
5. Send prompt with selected model
```

---

### 5. ChatGPT-Style Dashboard

**What Changed:**
- Complete UI redesign (dark theme)
- Left sidebar with:
  - Logo
  - New Chat button
  - Model selector
  - Chat history list
  - View History & Logout buttons
- Main chat area with:
  - Header showing active model
  - Chat bubbles (user vs AI)
  - Auto-scrolling to latest message
  - Loading indicator
- Input area with:
  - Textarea for prompts
  - Send button (Ctrl+Enter shortcut)
  - Clear history button
  - Guest mode indicator

**Visual Features:**
- Gradient backgrounds
- Message bubbles with rounded corners
- User messages: blue gradient, right-aligned
- AI messages: gray with border, left-aligned
- Smooth transitions and hover effects
- Responsive layout
- Custom scrollbar styling

**Location:**
- `client/src/views/DashboardView.vue` (350+ lines)

**Key Features:**
- Auto-scroll to latest message
- Keyboard shortcut: Ctrl+Enter or Cmd+Enter
- Empty state with emoji and hint
- Loading spinner during response
- Guest mode counter (5 prompts)
- Clear history with confirmation

---

### 6. Stripe Payment Gateway

**What Changed:**
- Stripe integration for secure payments
- Test mode ready (use test card: 4242 4242 4242 4242)
- Payment controller handles checkout sessions
- Webhook support for payment confirmations
- Transaction model to track all payments

**Payment Flow:**
```
User clicks "Upgrade Now" on pricing page
        ↓
Frontend calls: POST /api/payments/create-checkout-session
        ↓
Backend creates Stripe checkout session
        ↓
Returns sessionId to frontend
        ↓
Frontend redirects to Stripe checkout
        ↓
User enters payment details (test card in dev)
        ↓
Stripe processes payment
        ↓
Redirects to /payment-success?session_id=...
        ↓
Frontend calls: POST /api/payments/success
        ↓
Backend confirms payment with Stripe
        ↓
Updates user subscription and transaction status
        ↓
Shows success page with plan details
```

**Test Cards (Stripe):**
```
Visa:           4242 4242 4242 4242
Mastercard:     5555 5555 5555 4444
American Express: 3782 822463 10005

Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
```

**Location Files:**
- `server/controllers/paymentController.js` - Payment logic
- `server/routes/paymentRoutes.js` - Payment endpoints
- `server/models/Transaction.js` - Payment tracking

**Endpoints:**
```
POST /api/payments/create-checkout-session
  Body: { plan: 'super'|'premium', duration: '1year' }
  Response: { sessionId, transactionId }

POST /api/payments/success
  Body: { sessionId }
  Response: { message, plan, expiresAt, transaction }

GET /api/payments/transactions
  Response: { transactions: [], total }

POST /api/payments/webhook (Stripe webhook)
```

---

### 7. Transaction Tracking

**What Changed:**
- New Transaction model in MongoDB
- All payment attempts stored
- Track payment status: pending → completed → refunded
- Link transactions to users by userId

**Transaction Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to user
  plan: 'super' | 'premium',
  amount: 5 | 10,            // In USD
  currency: 'usd',
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  stripeId: 'pi_xxx',        // Stripe payment intent ID
  sessionId: 'cs_xxx',       // Stripe session ID
  paymentMethod: 'card',
  description: 'super plan for 1year',
  subscriptionDuration: '1year',
  createdAt: Date,
  updatedAt: Date
}
```

**Location:**
- `server/models/Transaction.js`

**Usage:**
```
GET /api/payments/transactions
Response includes all user transactions with:
- Plan purchased
- Amount paid
- Payment status
- Date and time
```

---

### 8. User Model Enhancement

**What Changed:**
- Added subscription fields to User model:
  - `plan` (free | super | premium) - default: 'free'
  - `subscriptionId` - Stripe subscription ID
  - `expiresAt` - When subscription expires
  - `preferredModel` - Default AI model choice

**Updated User Schema:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  plan: 'free' | 'super' | 'premium', // NEW
  subscriptionId: String,              // NEW
  expiresAt: Date,                     // NEW
  preferredModel: String,              // NEW
  createdAt: Date
}
```

**Location:**
- `server/models/User.js`

**Automatic Updates:**
- Plan updates to 'super' or 'premium' on successful payment
- expiresAt set to 1 year from payment date
- preferredModel syncs with user's selection

---

## 🚀 Deployment & Environment Setup

### Environment Variables

Add to `server/.env`:
```env
# Stripe Configuration (Get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

### Get Stripe Keys:

1. **Create Stripe Account:**
   - Go to https://stripe.com
   - Sign up for free account
   - Switch to Test mode (toggle in top-right)

2. **Get Keys:**
   - Navigate to Developers → API Keys
   - Copy "Secret key" → `STRIPE_SECRET_KEY`
   - Copy "Publishable key" → `STRIPE_PUBLISHABLE_KEY`

3. **Get Webhook Secret:**
   - Go to Developers → Webhooks
   - Create new endpoint: `https://yourapp.com/api/payments/webhook`
   - Select events: `checkout.session.completed`, `charge.refunded`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### Vercel Deployment:

1. Add environment variables in Vercel dashboard:
   ```
   Settings → Environment Variables
   Add: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
   ```

2. Update webhook URL in Stripe:
   ```
   Developers → Webhooks → Edit endpoint
   URL: https://your-app.vercel.app/api/payments/webhook
   ```

---

## 🧪 Testing Checklist

### Guest Login Test
- [ ] Click "Try as Guest" button
- [ ] Redirected to dashboard
- [ ] Counter shows 5/5 available
- [ ] Can submit 5 prompts
- [ ] 6th prompt shows "limit reached" message
- [ ] "Sign up to continue" message appears

### Landing Page Test
- [ ] Landing page loads at `/`
- [ ] Navigation links work
- [ ] Feature cards are responsive
- [ ] Pricing preview shows all tiers
- [ ] CTA buttons navigate correctly
- [ ] Footer links are visible

### Pricing Page Test
- [ ] Pricing page loads at `/pricing`
- [ ] All 3 plans display correctly
- [ ] Feature comparison table visible
- [ ] FAQ sections expand/collapse
- [ ] "Super" plan has "MOST POPULAR" badge
- [ ] Upgrade buttons functional

### Model Selection Test
- [ ] Dashboard shows model selector
- [ ] Can select different models
- [ ] Model preference saves to localStorage
- [ ] Model description shows below selector
- [ ] Selected model used in API calls

### Payment Flow Test (Stripe Test Mode)
- [ ] Click "Upgrade Now" on pricing
- [ ] Redirected to Stripe checkout
- [ ] Can enter test card: `4242 4242 4242 4242`
- [ ] Payment processes successfully
- [ ] Redirected to `/payment-success`
- [ ] Success page shows plan details
- [ ] User plan updated to 'super'/'premium'
- [ ] Transaction appears in database

### Transaction History Test
- [ ] Complete payment transaction
- [ ] Call `/api/payments/transactions` endpoint
- [ ] All payment details displayed
- [ ] Status shows 'completed'
- [ ] Amount is correct

### ChatGPT-Style Dashboard Test
- [ ] Sidebar displays correctly
- [ ] New Chat button clears history
- [ ] Chat history shows previous conversations
- [ ] Messages auto-scroll to bottom
- [ ] User messages are blue, AI messages are gray
- [ ] Loading spinner shows during response
- [ ] Ctrl+Enter sends prompt
- [ ] Clear history works with confirmation

---

## 📝 API Documentation Updates

### New Payment Endpoints:

```
POST /api/payments/create-checkout-session
  Description: Create Stripe checkout session
  Auth: Required (Bearer token)
  Body: { plan: 'super'|'premium', duration: '1year' }
  Response: { sessionId, transactionId }

POST /api/payments/success
  Description: Confirm payment and update subscription
  Auth: Required (Bearer token)
  Body: { sessionId }
  Response: { message, plan, expiresAt, transaction }

GET /api/payments/transactions
  Description: Get user's transaction history
  Auth: Required (Bearer token)
  Response: { transactions: [], total }

POST /api/payments/webhook
  Description: Stripe webhook for payment events
  Auth: None (Stripe signature validation)
  Events: checkout.session.completed, charge.refunded
```

---

## ⚠️ Important Notes

1. **Package Dependencies:**
   - Install Stripe: `npm install stripe`
   - Install axios for frontend: Already included

2. **Test Cards in Stripe:**
   - Use only in Test mode
   - No actual charges occur
   - Perfect for development

3. **CORS Configuration:**
   - Already configured in `server/app.js`
   - Payment endpoints use standard HTTP/HTTPS

4. **Production Security:**
   - Never expose `STRIPE_SECRET_KEY` in frontend
   - Only use `STRIPE_PUBLISHABLE_KEY` in frontend (if needed)
   - Verify webhook signature with `STRIPE_WEBHOOK_SECRET`

5. **Guest Session Limitations:**
   - 5 prompts per session
   - No history persistence after logout
   - Encourages sign-up

---

## 🔄 User Upgrade Flow

```
1. Free User (default)
   ├─ 5 prompts/day
   ├─ 7-day history
   └─ 3 basic models

2. Click "Upgrade Now" on Pricing
   ├─ Stripe checkout modal
   ├─ Pay $5 (Super) or $10 (Premium)
   └─ Payment processes

3. After Successful Payment
   ├─ User plan → 'super' or 'premium'
   ├─ expiresAt → 1 year from now
   ├─ Subscription active
   └─ Full feature access

4. At Expiration
   ├─ expiresAt date passes
   ├─ Plan reverts to 'free' (manual check)
   └─ Prompt user to renew
```

---

## 📊 Database Schema Changes

### User Model Addition:
```javascript
plan: {
  type: String,
  enum: ['free', 'super', 'premium'],
  default: 'free',
},
subscriptionId: {
  type: String,
  default: null,
},
expiresAt: {
  type: Date,
  default: null,
},
preferredModel: {
  type: String,
  default: 'mistral',
},
```

### New Transaction Model:
```javascript
{
  userId,           // Reference to User
  plan,            // super or premium
  amount,          // 5 or 10
  currency,        // 'usd'
  status,          // pending, completed, failed, refunded
  stripeId,        // Stripe payment intent
  sessionId,       // Stripe session ID
  paymentMethod,   // 'card'
  description,     // Plan details
  subscriptionDuration, // '1year'
  createdAt,       // Auto
  updatedAt        // Auto
}
```

---

## 🎯 Next Steps

### Immediate (This Session)
- [x] Create Landing Page
- [x] Create Pricing Page
- [x] Add Guest Login
- [x] Redesign Dashboard
- [x] Add Model Selection
- [x] Create Payment Controller
- [ ] Install Stripe npm package
- [ ] Get Stripe test keys

### Short Term
- [ ] Test all payment flows
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add transaction email receipts
- [ ] Create admin dashboard

### Medium Term
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Create refund policy
- [ ] Set up monitoring/logging
- [ ] Performance optimization

---

## 📞 Support

**For Issues:**
1. Check Stripe dashboard status
2. Verify webhook endpoints
3. Check browser console for errors
4. Review server logs in Vercel

**Stripe Documentation:**
- https://stripe.com/docs/payments
- https://stripe.com/docs/webhooks
- https://stripe.com/docs/testing

---

**Last Updated:** March 9, 2026  
**Next Review:** After first payment transaction  
**Status:** Ready for Stripe integration
