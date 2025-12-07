# 🚨 Database Migration Required

**Date:** December 3, 2025  
**Issue:** `The column enquiries.fuel_type does not exist in the current database`

---

## ❌ Current Error

```
ERROR: The column `enquiries.fuel_type` does not exist in the current database.
```

This error occurs because:
1. ✅ Frontend code has been updated to support `fuelType` field
2. ✅ Backend code expects `fuel_type` column
3. ❌ **Database migration has NOT been run yet**

---

## 🔧 Solution: Run Database Migration

### **Step 1: Run SQL Migration Script**

Execute the SQL script in your backend database:

```bash
# Connect to your database and run:
psql -U your_username -d your_database -f add-fuel-type-migration.sql

# OR if using MySQL:
mysql -u your_username -p your_database < add-fuel-type-migration.sql

# OR if using Prisma:
# First, update your Prisma schema, then:
npx prisma db push
```

### **Step 2: SQL Script Contents**

The migration script (`add-fuel-type-migration.sql`) will:
- ✅ Add `fuel_type VARCHAR(50)` column to `enquiries` table
- ✅ Make it nullable (optional) for backward compatibility
- ✅ Add an index for performance (optional)
- ✅ Verify the column was added successfully

### **Step 3: If Using Prisma**

If your backend uses Prisma, you also need to:

1. **Update Prisma Schema** (`schema.prisma`):
```prisma
model Enquiry {
  // ... existing fields
  fuelType              String?  @map("fuel_type")
  isImportedFromQuotation Boolean? @default(false) @map("is_imported_from_quotation")
  quotationImportedAt   DateTime? @map("quotation_imported_at")
  // ... other fields
}
```

2. **Run Prisma Commands**:
```bash
npx prisma db push
npx prisma generate
npm run build
```

---

## 📋 Quick Fix (Manual SQL)

If you just want to quickly add the column, run this SQL directly:

```sql
ALTER TABLE enquiries 
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50);
```

---

## ✅ Verification

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'enquiries' 
AND column_name = 'fuel_type';
```

Expected output:
```
column_name | data_type | is_nullable
------------|-----------|-------------
fuel_type   | varchar   | YES
```

---

## 🎯 After Migration

Once the migration is complete:
1. ✅ Restart your backend server
2. ✅ The error should disappear
3. ✅ Frontend can now send/receive `fuelType` data
4. ✅ Existing enquiries will have `fuel_type = NULL` (which is fine)

---

## 📝 Additional Fields (If Needed)

If you also need to add other Phase 2 fields:

```sql
-- Add is_imported_from_quotation field
ALTER TABLE enquiries 
ADD COLUMN IF NOT EXISTS is_imported_from_quotation BOOLEAN DEFAULT FALSE;

-- Add quotation_imported_at field
ALTER TABLE enquiries 
ADD COLUMN IF NOT EXISTS quotation_imported_at TIMESTAMP;
```

---

**Status:** ⚠️ **Action Required** - Run database migration to fix the error

