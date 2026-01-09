# 📦 Inventory Management System - Implementation Plan

## Overview
Complete inventory management system for Blue Ice CRM to track bottles (filled, empty, damaged, with customers) and manage restocking operations.

---

## 🎯 Requirements

### For Inventory Manager:
1. ✅ Record stock-in (restocking) transactions
2. ✅ Record stock-out (damaged/lost) transactions
3. ✅ View complete inventory dashboard
4. ✅ Track stock movements with history
5. ✅ View bottles currently with customers

### For Admin:
1. ✅ All Inventory Manager permissions
2. ✅ Approve/reject stock transactions (optional)
3. ✅ View comprehensive reports
4. ✅ Audit trail of all stock movements

---

## 📊 Database Schema Changes

### 1. New Table: `StockTransaction`
```prisma
model StockTransaction {
  id          String   @id @default(uuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])

  type        StockTransactionType
  quantity    Int

  // Type-specific fields
  reason      String?  // For DAMAGE_OUT, LOSS_OUT
  notes       String?  // Additional notes
  batchNumber String?  // For RESTOCK_IN

  // Before/After snapshots for audit
  stockFilledBefore  Int
  stockEmptyBefore   Int
  stockDamagedBefore Int

  stockFilledAfter  Int
  stockEmptyAfter   Int
  stockDamagedAfter Int

  // Who made the transaction
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])

  createdAt DateTime @default(now())

  @@index([productId, createdAt])
  @@index([type])
  @@index([createdAt])
}

enum StockTransactionType {
  RESTOCK_IN         // New bottles filled (restocking)
  EMPTY_IN           // Empty bottles returned from customers
  DAMAGE_OUT         // Bottles marked as damaged
  LOSS_OUT           // Bottles lost/stolen
  ADJUSTMENT         // Manual stock adjustment
  FILL_CONVERSION    // Convert empty to filled
}
```

### 2. Add to Product Model:
```prisma
model Product {
  // ... existing fields
  stockTransactions StockTransaction[]
}
```

---

## 🗂️ Feature Structure

```
src/features/inventory/
├── api/
│   ├── use-create-transaction.ts
│   ├── use-get-transactions.ts
│   ├── use-get-inventory-stats.ts
│   └── use-get-bottles-with-customers.ts
├── components/
│   ├── restock-form.tsx              // Stock-in form
│   ├── damage-form.tsx               // Damage/loss recording
│   ├── inventory-stats-cards.tsx     // Overview cards
│   ├── stock-transaction-table.tsx   // Transaction history
│   ├── bottles-with-customers.tsx    // Customer bottle tracking
│   └── inventory-dashboard.tsx       // Main dashboard
├── hooks/
│   └── use-inventory-filters.ts
├── server/
│   └── route.ts
├── queries.ts
├── schema.ts
└── types.ts
```

---

## 🎨 UI Pages

### 1. Inventory Dashboard (`/inventory`)
**Route:** `/inventory`
**Access:** Admin, Inventory Manager

**Components:**
- 📊 **Stats Cards:**
  - Total Filled Bottles
  - Total Empty Bottles
  - Damaged Bottles
  - Bottles with Customers
  - Total Transactions (Last 30 days)

- 📦 **Quick Actions:**
  - [+] Record Restock
  - [!] Report Damage/Loss
  - [⟳] Fill Empty Bottles

- 📋 **Recent Transactions Table**
- 👥 **Bottles with Customers Summary**

### 2. Restock Page (`/inventory/restock`)
**Form Fields:**
- Product (dropdown)
- Quantity (number)
- Batch Number (text, optional)
- Notes (textarea, optional)

**Action:** Creates `RESTOCK_IN` transaction

### 3. Damage/Loss Page (`/inventory/damage`)
**Form Fields:**
- Product (dropdown)
- Type (Damage / Loss)
- Quantity (number)
- Reason (text, required)
- Notes (textarea, optional)

**Action:** Creates `DAMAGE_OUT` or `LOSS_OUT` transaction

### 4. Transaction History (`/inventory/transactions`)
**Features:**
- Filterable table (by product, type, date range)
- Pagination
- Export to CSV (optional)

---

## 🔄 Stock Calculation Logic

### Current Stock Formula:
```typescript
// Product model already has these fields:
- stockFilled: filled bottles in warehouse
- stockEmpty: empty bottles in warehouse
- stockDamaged: damaged bottles (audit only)

// Calculate bottles with customers:
bottlesWithCustomers = SUM(CustomerBottleWallet.bottleBalance) for this product

// Total bottles in circulation:
totalBottles = stockFilled + stockEmpty + stockDamaged + bottlesWithCustomers
```

### Transaction Impact:
```typescript
RESTOCK_IN:
  stockFilled += quantity

EMPTY_IN:
  stockEmpty += quantity
  // Happens automatically when driver collects empties

DAMAGE_OUT:
  stockFilled -= quantity (if from filled)
  stockEmpty -= quantity (if from empty)
  stockDamaged += quantity

LOSS_OUT:
  stockFilled -= quantity
  // No stockDamaged increment (lost completely)

FILL_CONVERSION:
  stockEmpty -= quantity
  stockFilled += quantity
```

---

## 🚀 Implementation Steps

### Phase 1: Database & Backend
1. ✅ Create migration for `StockTransaction` model
2. ✅ Create `StockTransactionType` enum
3. ✅ Write queries in `queries.ts`
4. ✅ Create API routes in `server/route.ts`
5. ✅ Add validation schemas in `schema.ts`

### Phase 2: API Hooks
1. ✅ `use-create-transaction.ts`
2. ✅ `use-get-transactions.ts`
3. ✅ `use-get-inventory-stats.ts`
4. ✅ `use-get-bottles-with-customers.ts`

### Phase 3: UI Components
1. ✅ Create restock form
2. ✅ Create damage/loss form
3. ✅ Create inventory stats cards
4. ✅ Create transaction history table
5. ✅ Create main inventory dashboard

### Phase 4: Pages & Routes
1. ✅ `/inventory` - Main dashboard
2. ✅ `/inventory/restock` - Restock form
3. ✅ `/inventory/damage` - Damage/loss form
4. ✅ `/inventory/transactions` - History

### Phase 5: Integration & Testing
1. ✅ Add sidebar navigation item
2. ✅ Test all transaction types
3. ✅ Verify stock calculations
4. ✅ Test role-based access

---

## 🎯 Benefits

✅ **No More Manual Editing**: Stock updated through transactions only
✅ **Full Audit Trail**: Every stock change recorded with who/when/why
✅ **Better Visibility**: Real-time view of all inventory metrics
✅ **Accurate Tracking**: Know exactly where every bottle is
✅ **Efficient Restocking**: Quick restock workflow for Inventory Manager
✅ **Damage Accountability**: Track damaged bottles for analysis

---

## 📈 Future Enhancements (Optional)

1. **Automated Alerts**: Low stock notifications
2. **Predictive Ordering**: ML-based stock prediction
3. **Barcode Scanning**: QR code-based inventory management
4. **Multi-location**: Track stock across multiple warehouses
5. **Batch Tracking**: Track batches with expiry dates
6. **Stock Transfer**: Transfer between locations
7. **Physical Count**: Periodic stock count reconciliation

---

## 🔐 Permissions Matrix

| Action | Admin | Inventory Manager | Driver | Customer |
|--------|-------|-------------------|--------|----------|
| View Inventory | ✅ | ✅ | ❌ | ❌ |
| Record Restock | ✅ | ✅ | ❌ | ❌ |
| Record Damage/Loss | ✅ | ✅ | ❌ | ❌ |
| View Transactions | ✅ | ✅ | ❌ | ❌ |
| Adjust Stock | ✅ | ⚠️ (with approval) | ❌ | ❌ |
| Delete Transaction | ✅ | ❌ | ❌ | ❌ |

---

Ready to implement? Let's build this system step by step! 🚀
