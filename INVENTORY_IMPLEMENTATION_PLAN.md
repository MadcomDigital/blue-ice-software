# 🚚 Truck Inventory & Reconciliation - Implementation Plan

## 1. Executive Summary
This plan addresses the "Physical vs. Digital" inventory gap by introducing a formal **Load & Return Workflow**.

**Core Concept:**
Instead of orders directly deducting from Warehouse Stock (which assumes perfect logistics), we move stock from **Warehouse** → **Truck** (Load Sheet). Sales deduct from **Truck**. End-of-day reconciles **Truck** → **Warehouse** (Return Sheet).

---

## 2. Database Schema Changes

We will introduce a new model `InventoryHandover` to track physical movements, separate from the financial `CashHandover`.

### New Model: `InventoryHandover`
```prisma
enum InventoryHandoverStatus {
  PENDING   // Draft
  CONFIRMED // Signed off by Driver & Warehouse
}

enum HandoverType {
  LOAD      // Morning: Warehouse -> Truck
  RETURN    // Evening: Truck -> Warehouse
}

model InventoryHandover {
  id            String    @id @default(uuid())
  readableId    Int       @default(autoincrement())

  driverId      String
  driver        DriverProfile @relation(fields: [driverId], references: [id])

  date          DateTime  @db.Date
  type          HandoverType
  status        InventoryHandoverStatus @default(PENDING)

  // Who performed the action
  warehouseMgrId String
  warehouseMgr   User   @relation(fields: [warehouseMgrId], references: [id])

  items         InventoryHandoverItem[]

  createdAt     DateTime @default(now())
}

model InventoryHandoverItem {
  id                  String @id @default(uuid())
  inventoryHandoverId String
  inventoryHandover   InventoryHandover @relation(fields: [inventoryHandoverId], references: [id], onDelete: Cascade)

  productId     String
  product       Product @relation(fields: [productId], references: [id])

  quantity      Int    // Number of bottles Loaded or Returned
  condition     String? // "Good", "Damaged" (Specific to Returns)
}
```

### Update `StockTransaction`
Ensure `StockTransaction` can link to `InventoryHandover` for audit trails.
```prisma
model StockTransaction {
  // ... existing fields
  referenceId   String? // Link to InventoryHandover.id
}
```

---

## 3. Business Logic & Flow Updates

### A. The New Inventory Lifecycle

| Stage | Action | Actor | System Impact |
| :--- | :--- | :--- | :--- |
| **1. Morning Load** | **Create Load Sheet** | Warehouse Mgr | 1. Creates `InventoryHandover` (Type: `LOAD`)<br>2. **Decrements** Warehouse Stock<br>3. **Increments** "Truck Stock" (Virtual) |
| **2. Delivery** | **Complete Order** | Driver | 1. Updates Order Status<br>2. **NO CHANGE** to Warehouse Stock (Previously this decremented stock)<br>3. Decrements "Truck Stock" (Virtual calculation) |
| **3. Evening Return** | **Create Return Sheet** | Warehouse Mgr | 1. Counts leftover bottles on truck<br>2. Creates `InventoryHandover` (Type: `RETURN`)<br>3. **Increments** Warehouse Stock |
| **4. Reconciliation** | **View Report** | Admin | Calculates Discrepancy:<br>`Loaded - Sold - Returned = Missing` |

### B. Critical Logic Change: `updateOrder`
**Current:** `updateOrder` -> Decrements `Product.stockFilled`.
**New:** `updateOrder` -> **Stops** decrementing `Product.stockFilled`.
*Why?* Because stock was already decremented when it left the warehouse in the morning.

---

## 4. UI/UX: Screens & Dashboards

### 🏭 Warehouse Manager View
**1. Daily Load Dashboard**
- **List:** Active Drivers
- **Action:** "Create Load Sheet"
- **Form:** Select Driver, Add Products + Quantities.
- **Validation:** Cannot load more than Warehouse Stock.

**2. Return Station**
- **Action:** "Process Return"
- **Form:** Select Driver. System shows "Expected Return" (Calculated from Load - Completed Orders).
- **Input:** Actual Quantities Counted.

### 🚚 Driver App View
**1. My Truck Inventory**
- **Read-Only Card:** Shows "Loaded: 50 | Delivered: 30 | Remaining: 20".
- **Benefit:** Driver knows exactly what they should have.

### 📊 Admin Dashboard
**1. Inventory Reconciliation Report**
- **Table:**
  - Driver Name
  - Loaded (50)
  - Sold (40)
  - Expected Return (10)
  - Actual Return (8)
  - **Discrepancy (-2)** 🔴 *Alert*

---

## 5. Role-Based Actions & Visibility

| Role | Actions Allowed | Visibility |
| :--- | :--- | :--- |
| **Warehouse Mgr** | Create/Edit Load Sheets<br>Create/Edit Return Sheets | Warehouse Stock<br>All Driver Loads |
| **Driver** | Acknowledge Load (Optional)<br>View Truck Stock | Own Load Sheet<br>Own Current Stock |
| **Admin** | Edit Locked Sheets (Corrections)<br>View Reconciliation Reports | Full System Access |

---

## 6. Step-by-Step Implementation Plan

### Phase 1: Database & API (Week 1)
1.  **Schema Migration:** Create `InventoryHandover` and `InventoryHandoverItem` tables.
2.  **API - Load:** `POST /api/inventory/handover/load` (Decrement Warehouse).
3.  **API - Return:** `POST /api/inventory/handover/return` (Increment Warehouse).
4.  **API - Stats:** `GET /api/inventory/driver-stats/:id` (Calculates Truck Stock).

### Phase 2: Logic Switch (Week 1)
1.  **Refactor `updateOrder`:** Remove the `db.product.update({ stockFilled: { decrement: ... } })` call.
2.  **Refactor `markOrderUnableToDeliver`:** Ensure it doesn't touch stock logic (it currently doesn't, but verify).

### Phase 3: Frontend - Warehouse App (Week 2)
1.  **Load Sheet Form:** A simple form to add products and quantities for a driver.
2.  **Return Sheet Form:** A form that pre-fills "Expected Return" but allows editing "Actual Return".

### Phase 4: Frontend - Reporting (Week 2)
1.  **Reconciliation Widget:** A table on the Admin Dashboard showing daily discrepancies.
2.  **Driver View:** Add a "Truck Stock" card to the Driver App home screen.

---

## 7. Validations & Approvals

1.  **Stock Availability:** Warehouse Manager cannot load 50 bottles if Warehouse only has 40.
2.  **Double Entry Prevention:** Warning if a "Load Sheet" already exists for the driver for Today.
3.  **Negative Stock:** "Truck Stock" calculation can technically go negative if a driver delivers more than loaded (e.g., swapped bottles with another driver). System should flag this as "Critical Alert".

## 8. Migration Strategy
To avoid disrupting operations:
1.  **Deploy Code:** Add new tables and APIs.
2.  **Day 1:** Warehouse starts using Load/Return sheets (Data Collection only). `updateOrder` **STILL** decrements stock (Double Counting temporarily, or use a Feature Flag).
3.  **Day 2:** Enable `DISABLE_DIRECT_STOCK_DECREMENT` flag. Switch fully to Load Sheet model.
