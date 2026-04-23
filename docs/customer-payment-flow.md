# Customer Payment Documentation

This document explains two things for the current RTROM implementation:
1. How the customer pays
2. When the customer pays

## Scope
This flow is based on the current code paths in frontend and backend:
- Frontend checkout and Stripe payment screens
- Backend bill generation and payment verification services

## When Customer Will Pay
Customer payment happens at checkout time, after an order exists and a bill is generated.

In the current implementation, payment is triggered only when the customer enters the checkout/payment routes:
- Checkout summary route: /customer/checkout/:orderId
- Payment route: /customer/payment/:billId

Practical timing:
1. Order is placed and prepared/served as part of restaurant operations.
2. Customer (or UI flow) opens checkout for a specific order.
3. Bill is generated (or reused if already generated).
4. Customer proceeds to payment and completes payment in Stripe.

Important:
- Payment is not collected during menu browsing.
- Payment is not auto-collected at order creation.
- Payment is considered complete only after backend verification succeeds.

## How Customer Will Pay (Step-by-Step)

### Step 1: Bill generation at checkout
Frontend calls bill generation for the order.
- API call: POST /api/bills/{orderId}/generate
- Result: Bill details (subtotal, tax, discount, grand total, bill number)

### Step 2: Create Stripe payment intent
When customer opens payment page, frontend requests payment initialization.
- API call: POST /api/payments/create-order
- Request body: { billId }
- Backend action:
  - Finds bill by ID
  - Converts grand total to paise
  - Creates Stripe PaymentIntent in INR
  - Stores a local payment record with status PENDING
- Response includes:
  - clientSecret (for Stripe Elements)
  - paymentId (internal DB payment record)

### Step 3: Customer enters card and confirms
Frontend Stripe Elements form submits card details using Stripe client SDK.
- Action: stripe.confirmCardPayment(clientSecret, card data)
- If Stripe returns success (paymentIntent.status = succeeded), frontend proceeds to verification.

### Step 4: Server-side verification
Frontend verifies payment with backend.
- API call: POST /api/payments/verify
- Request body: { paymentId, paymentIntentId }

Backend verification logic:
1. Loads payment by paymentId
2. Confirms stored Stripe PaymentIntent ID matches paymentIntentId
3. Retrieves latest PaymentIntent status from Stripe
4. Updates records based on status

If succeeded:
- Payment status -> SUCCESS
- paidAt timestamp is set
- Bill status -> PAID
- Order status -> PAID
- API response: Payment Successful

If failed/canceled:
- Payment status -> FAILED
- API response: Payment Failed

If still pending:
- API response: Payment Pending

## Payment Status Lifecycle
Internal payment states in current flow:
1. PENDING: Created after /create-order
2. SUCCESS: Verified as succeeded by Stripe
3. FAILED: Verified as requires_payment_method or canceled

## Customer-Facing Outcome
After successful payment verification:
- Customer sees success toast
- Frontend navigates customer to /customer/menu

## Failure Cases
Common failure paths:
1. Stripe is not configured on backend (503)
2. Bill ID not found
3. Payment ID not found
4. PaymentIntent ID mismatch
5. Stripe payment not completed or canceled

Recommended UX handling (future enhancement):
- Add dedicated payment success page with receipt
- Add retry flow for failed payments
- Show explicit reason for failure from backend response

## Current Constraints
- Payment method is effectively card-based through Stripe Elements in this implementation.
- No cash/UPI/manual settlement flow is implemented in the current customer checkout path.
- No webhook-based asynchronous reconciliation is present; flow relies on client-triggered verify endpoint.

## Quick Sequence Summary
1. Customer opens checkout for order
2. Bill generated/retrieved
3. Customer clicks Proceed to Payment
4. Payment intent created (PENDING)
5. Customer confirms card payment in Stripe
6. Backend verifies Stripe intent
7. Payment, bill, and order are marked paid when successful
