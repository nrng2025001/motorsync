# 🔧 Backend Implementation Guide: Remarks Feature

## Overview
This guide outlines all the backend changes needed to support the **3-day remarks with hierarchy** feature in the Expo app.

---

## 📋 Table of Contents
1. [Database Schema Changes](#1-database-schema-changes)
2. [API Endpoints Required](#2-api-endpoints-required)
3. [Controller Implementation](#3-controller-implementation)
4. [Service Layer](#4-service-layer)
5. [Response Format](#5-response-format)
6. [Error Handling](#6-error-handling)

---

## 1. Database Schema Changes

### Prisma Schema: Add `Remark` Model

Add this to your `prisma/schema.prisma` file:

```prisma
model Remark {
  id                String    @id @default(cuid())
  remark            String    @db.Text
  remarkType        String?   // Optional: 'enquiry_remark', 'booking_remark', etc.
  entityType        String    // 'enquiry' or 'booking'
  entityId          String    // ID of the enquiry or booking
  
  // User who created the remark
  createdById      String
  createdBy        User      @relation("CreatedRemarks", fields: [createdById], references: [id])
  
  // Cancellation fields
  cancelled        Boolean   @default(false)
  cancellationReason String? @db.Text
  cancelledAt      DateTime?
  cancelledById    String?
  cancelledBy      User?     @relation("CancelledRemarks", fields: [cancelledById], references: [id])
  
  // Timestamps
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  enquiry          Enquiry?  @relation(fields: [entityId], references: [id])
  booking          Booking?  @relation(fields: [entityId], references: [id])
  
  @@index([entityType, entityId])
  @@index([createdById])
  @@index([createdAt])
  @@map("remarks")
}
```

### Update `Enquiry` Model

Add the relation to `Remark`:

```prisma
model Enquiry {
  // ... existing fields ...
  
  remarks          Remark[]  // Add this relation
  
  // ... rest of fields ...
}
```

### Update `Booking` Model (if needed)

```prisma
model Booking {
  // ... existing fields ...
  
  remarks          Remark[]  // Add this relation
  
  // ... rest of fields ...
}
```

### Update `User` Model

Add relations for created and cancelled remarks:

```prisma
model User {
  // ... existing fields ...
  
  createdRemarks   Remark[]  @relation("CreatedRemarks")
  cancelledRemarks Remark[]  @relation("CancelledRemarks")
  
  // ... rest of fields ...
}
```

### Run Migration

```bash
npx prisma migrate dev --name add_remarks_table
npx prisma generate
```

---

## 2. API Endpoints Required

The frontend expects these endpoints:

### 2.1 Add Enquiry Remark
```
POST /api/remarks/enquiry/:enquiryId/remarks
```

**Request Body:**
```json
{
  "remark": "Customer showed interest in the vehicle."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Remark added successfully",
  "data": {
    "id": "cmi123...",
    "remark": "Customer showed interest in the vehicle.",
    "remarkType": "enquiry_remark",
    "createdAt": "2025-11-22T13:44:55.119Z",
    "createdBy": {
      "id": "A3JKSTqvuPa3mxvPVcERcOD2buv2",
      "name": "Test Advisor",
      "role": {
        "id": "cmi9szpep0004c1xlx5mtv2od",
        "name": "CUSTOMER_ADVISOR"
      }
    },
    "cancelled": false
  }
}
```

### 2.2 Cancel Remark
```
POST /api/remarks/remarks/:remarkId/cancel
```

**Request Body:**
```json
{
  "reason": "Incorrect information provided"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Remark cancelled successfully",
  "data": {
    "id": "cmi123...",
    "remark": "Customer showed interest in the vehicle.",
    "cancelled": true,
    "cancellationReason": "Incorrect information provided",
    "cancelledAt": "2025-11-22T14:00:00.000Z",
    "cancelledBy": {
      "id": "A3JKSTqvuPa3mxvPVcERcOD2buv2",
      "name": "Test Advisor"
    }
  }
}
```

### 2.3 Update Enquiry Detail Response

The `GET /api/enquiries/:id` endpoint must include `remarkHistory`:

```json
{
  "success": true,
  "data": {
    "enquiry": {
      "id": "cmiac4u8f0006wcuo7va7e0bq",
      "customerName": "aditya",
      // ... other enquiry fields ...
      "remarkHistory": [
        {
          "id": "cmi123...",
          "remark": "Customer showed interest.",
          "remarkType": "enquiry_remark",
          "createdAt": "2025-11-22T13:44:55.119Z",
          "createdBy": {
            "id": "A3JKSTqvuPa3mxvPVcERcOD2buv2",
            "name": "Test Advisor",
            "role": {
              "id": "cmi9szpep0004c1xlx5mtv2od",
              "name": "CUSTOMER_ADVISOR"
            }
          },
          "cancelled": false
        }
        // ... more remarks (sorted by createdAt DESC)
      ]
    }
  }
}
```

---

## 3. Controller Implementation

### 3.1 Remarks Controller (`controllers/remarks.controller.ts`)

```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { remarksService } from '../services/remarks.service';
import { authMiddleware } from '../middleware/auth.middleware';

/**
 * Add remark to enquiry
 * POST /api/remarks/enquiry/:enquiryId/remarks
 */
export const addEnquiryRemark = asyncHandler(async (req: Request, res: Response) => {
  const { enquiryId } = req.params;
  const { remark } = req.body;
  const user = req.user; // From auth middleware

  if (!remark || !remark.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Remark text is required',
    });
  }

  const newRemark = await remarksService.addRemark({
    entityType: 'enquiry',
    entityId: enquiryId,
    remark: remark.trim(),
    createdById: user.userId || user.firebaseUid,
  });

  res.status(201).json({
    success: true,
    message: 'Remark added successfully',
    data: newRemark,
  });
});

/**
 * Cancel a remark
 * POST /api/remarks/remarks/:remarkId/cancel
 */
export const cancelRemark = asyncHandler(async (req: Request, res: Response) => {
  const { remarkId } = req.params;
  const { reason } = req.body;
  const user = req.user;

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Cancellation reason is required',
    });
  }

  const cancelledRemark = await remarksService.cancelRemark({
    remarkId,
    reason: reason.trim(),
    cancelledById: user.userId || user.firebaseUid,
  });

  res.status(200).json({
    success: true,
    message: 'Remark cancelled successfully',
    data: cancelledRemark,
  });
});
```

### 3.2 Update Enquiries Controller

In `controllers/enquiries.controller.ts`, update `getEnquiryById`:

```typescript
export const getEnquiryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  // Fetch enquiry with remarks (last 3 days, sorted by date DESC)
  const enquiry = await db.enquiry.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          firebaseUid: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          firebaseUid: true,
          name: true,
          email: true,
        },
      },
      remarks: {
        where: {
          cancelled: false,
          createdAt: {
            gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Last 3 days
          },
        },
        include: {
          createdBy: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Newest first
        },
      },
    },
  });

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      message: 'Enquiry not found',
    });
  }

  // Transform remarks to match frontend format
  const remarkHistory = enquiry.remarks.map((remark) => ({
    id: remark.id,
    remark: remark.remark,
    remarkType: remark.remarkType || 'enquiry_remark',
    createdAt: remark.createdAt.toISOString(),
    createdBy: {
      id: remark.createdBy.firebaseUid || remark.createdBy.id,
      name: remark.createdBy.name,
      role: {
        id: remark.createdBy.role?.id,
        name: remark.createdBy.role?.name,
      },
    },
    cancelled: remark.cancelled,
    cancellationReason: remark.cancellationReason,
  }));

  res.json({
    success: true,
    data: {
      enquiry: {
        ...enquiry,
        remarkHistory,
      },
    },
  });
});
```

---

## 4. Service Layer

### Remarks Service (`services/remarks.service.ts`)

```typescript
import { db } from '../config/database';
import { Prisma } from '@prisma/client';

interface AddRemarkParams {
  entityType: 'enquiry' | 'booking';
  entityId: string;
  remark: string;
  createdById: string;
}

interface CancelRemarkParams {
  remarkId: string;
  reason: string;
  cancelledById: string;
}

class RemarksService {
  /**
   * Add a new remark
   */
  async addRemark(params: AddRemarkParams) {
    const { entityType, entityId, remark, createdById } = params;

    // Verify entity exists
    if (entityType === 'enquiry') {
      const enquiry = await db.enquiry.findUnique({
        where: { id: entityId },
      });
      if (!enquiry) {
        throw new Error('Enquiry not found');
      }
    } else if (entityType === 'booking') {
      const booking = await db.booking.findUnique({
        where: { id: entityId },
      });
      if (!booking) {
        throw new Error('Booking not found');
      }
    }

    // Create remark
    const newRemark = await db.remark.create({
      data: {
        remark,
        remarkType: `${entityType}_remark`,
        entityType,
        entityId,
        createdById,
      },
      include: {
        createdBy: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return this.formatRemark(newRemark);
  }

  /**
   * Cancel a remark
   */
  async cancelRemark(params: CancelRemarkParams) {
    const { remarkId, reason, cancelledById } = params;

    // Check if remark exists and is not already cancelled
    const remark = await db.remark.findUnique({
      where: { id: remarkId },
    });

    if (!remark) {
      throw new Error('Remark not found');
    }

    if (remark.cancelled) {
      throw new Error('Remark is already cancelled');
    }

    // Update remark
    const cancelledRemark = await db.remark.update({
      where: { id: remarkId },
      data: {
        cancelled: true,
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledById,
      },
      include: {
        createdBy: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        cancelledBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.formatRemark(cancelledRemark);
  }

  /**
   * Format remark for API response
   */
  private formatRemark(remark: any) {
    return {
      id: remark.id,
      remark: remark.remark,
      remarkType: remark.remarkType,
      createdAt: remark.createdAt.toISOString(),
      createdBy: {
        id: remark.createdBy.firebaseUid || remark.createdBy.id,
        name: remark.createdBy.name,
        role: {
          id: remark.createdBy.role?.id,
          name: remark.createdBy.role?.name,
        },
      },
      cancelled: remark.cancelled,
      cancellationReason: remark.cancellationReason,
      cancelledAt: remark.cancelledAt?.toISOString(),
      cancelledBy: remark.cancelledBy
        ? {
            id: remark.cancelledBy.firebaseUid || remark.cancelledBy.id,
            name: remark.cancelledBy.name,
          }
        : null,
    };
  }
}

export const remarksService = new RemarksService();
```

---

## 5. Routes

### Remarks Routes (`routes/remarks.routes.ts`)

```typescript
import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  addEnquiryRemark,
  addBookingRemark,
  cancelRemark,
} from '../controllers/remarks.controller';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Add remark to enquiry
router.post('/enquiry/:enquiryId/remarks', addEnquiryRemark);

// Add remark to booking
router.post('/booking/:bookingId/remarks', addBookingRemark);

// Cancel a remark
router.post('/remarks/:remarkId/cancel', cancelRemark);

export default router;
```

### Update Main Routes (`routes/index.ts` or `app.ts`)

```typescript
import remarksRoutes from './remarks.routes';

app.use('/api/remarks', remarksRoutes);
```

---

## 6. Error Handling

### Common Errors to Handle

1. **Entity Not Found**
   ```json
   {
     "success": false,
     "message": "Enquiry not found"
   }
   ```

2. **Remark Not Found**
   ```json
   {
     "success": false,
     "message": "Remark not found"
   }
   ```

3. **Already Cancelled**
   ```json
   {
     "success": false,
     "message": "Remark is already cancelled"
   }
   ```

4. **Validation Errors**
   ```json
   {
     "success": false,
     "message": "Remark text is required"
   }
   ```

---

## 7. Testing Checklist

- [ ] Database migration runs successfully
- [ ] `POST /api/remarks/enquiry/:enquiryId/remarks` creates a remark
- [ ] `POST /api/remarks/remarks/:remarkId/cancel` cancels a remark
- [ ] `GET /api/enquiries/:id` includes `remarkHistory` array
- [ ] Remarks are filtered to last 3 days only
- [ ] Remarks are sorted by `createdAt DESC` (newest first)
- [ ] Cancelled remarks are excluded from history
- [ ] User information (name, role) is included in response
- [ ] Authorization checks work correctly

---

## 8. Important Notes

1. **Date Filtering**: The frontend filters to last 3 days, but it's better to filter on the backend too for performance.

2. **Sorting**: Always sort by `createdAt DESC` (newest first) to match frontend expectations.

3. **Cancelled Remarks**: Exclude cancelled remarks from the `remarkHistory` array in enquiry responses.

4. **User Relations**: Make sure to include `createdBy` with `role` information in all remark queries.

5. **Timestamps**: Always return timestamps in ISO 8601 format (`.toISOString()`).

---

## 9. Quick Start Commands

```bash
# 1. Add Prisma schema changes
# Edit prisma/schema.prisma (add Remark model)

# 2. Generate migration
npx prisma migrate dev --name add_remarks_table

# 3. Generate Prisma client
npx prisma generate

# 4. Restart backend server
npm run dev
```

---

## 10. Example Implementation Flow

1. User adds remark → `POST /api/remarks/enquiry/:id/remarks`
2. Backend creates `Remark` record in database
3. Backend returns formatted remark with user info
4. Frontend adds remark to local state
5. When viewing enquiry → `GET /api/enquiries/:id`
6. Backend includes `remarkHistory` (last 3 days, sorted DESC)
7. Frontend groups remarks by day and displays

---

## ✅ Summary

**Required Changes:**
1. ✅ Add `Remark` model to Prisma schema
2. ✅ Create database migration
3. ✅ Implement `remarksService` (add, cancel)
4. ✅ Create `remarksController` (endpoints)
5. ✅ Add routes for remarks API
6. ✅ Update `getEnquiryById` to include `remarkHistory`
7. ✅ Filter remarks to last 3 days
8. ✅ Sort by `createdAt DESC`
9. ✅ Include user and role information
10. ✅ Handle cancellation logic

**Files to Create/Modify:**
- `prisma/schema.prisma` (add Remark model)
- `services/remarks.service.ts` (new)
- `controllers/remarks.controller.ts` (new)
- `routes/remarks.routes.ts` (new)
- `controllers/enquiries.controller.ts` (update `getEnquiryById`)

---

**Need Help?** Check the error logs - the main issue was: `The table 'public.remarks' does not exist in the current database.` This guide fixes that! 🚀

