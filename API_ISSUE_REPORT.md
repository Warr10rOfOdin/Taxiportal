# Taxi4U API Issue Report

## Objective
We need to fetch active/pending taxi bookings with complete data (addresses, pickup times, passenger info, status, vehicle assignments) to display on a real-time dispatch board.

## What We've Tried

### 1. `/api/triplists` with Mode 0 (Pending)
**Request:**
```json
{
  "centralCode": "VS",
  "mode": 0,
  "objValues": {}
}
```
**Result:** ❌ 400 Bad Request

---

### 2. `/api/triplists` with Mode 1 (Finished)
**Request:**
```json
{
  "centralCode": "VS",
  "mode": 1,
  "objValues": {
    "minPickupTime": "2026-01-09T09:12:56.551Z",
    "maxPickupTime": "2026-01-10T10:12:56.551Z"
  }
}
```
**Result:** ✅ 200 OK - Returns 12 trips
**Problem:** All fields are null except `internalNo`

**Sample Response:**
```json
{
  "internalNo": 755965,
  "tripStatus": null,
  "licenseNo": null,
  "pickupTime": null,
  "passengers": [
    {
      "fromStreet": null,
      "toStreet": null,
      "clientName": null,
      // ... all null
    }
  ]
}
```

---

### 3. `/api/triplists` with Mode 2 (Search)
**Request:**
```json
{
  "centralCode": "VS",
  "mode": 2,
  "objValues": {
    "minPickupTime": "2026-01-09T09:36:15.391Z",
    "maxPickupTime": "2026-01-10T10:36:15.391Z"
  }
}
```
**Result:** ✅ 200 OK - Returns 21 trips
**Problem:** Same as Mode 1 - all fields null except `internalNo`

---

## What We Need

We need an API endpoint that returns **complete booking data** similar to what's shown in the Taxi4U dispatch interface:

### Required Fields:
- ✅ Internal number / booking reference
- ✅ Trip status (e.g., "UnderSending", "Sent", "OnRoute")
- ✅ License plate number / vehicle assignment
- ✅ Pickup time
- ✅ Pickup address (street, city, postal code)
- ✅ Dropoff address (street, city, postal code)
- ✅ Passenger name and phone number
- ✅ Messages/comments

### Current Authentication:
- Using `POST /api/auth/login` successfully
- Receiving valid `accessToken`
- Token is being sent as `Bearer {token}` in Authorization header

## Questions for Taxi4U Support

1. **What is the correct API endpoint to fetch active/pending bookings with complete data?**

2. **Why does `/api/triplists` return only `internalNo` with all other fields null?**
   - Is this expected behavior?
   - Do we need a different mode or parameters?
   - Does our user account need additional scopes/permissions?

3. **Do we need to call multiple endpoints?**
   - For example: `/api/triplists` for IDs, then `/api/bookingdetails` for each trip?
   - If so, what parameter identifies each trip for the detail call?

4. **Does our API user have the correct permissions?**
   - Current scopes: BOOKING, ALLE (assumed)
   - Do we need additional permissions to see full trip data?

## Technical Details
- **Central Code:** VS
- **API Base URL:** https://api.taxi4u.cab
- **Authentication:** Working correctly (POST /api/auth/login)
- **Programming Language:** Node.js with node-fetch

## Contact Information
**Project:** Voss Taxi Real-time Dispatch Display
**Deployed on:** Vercel
**Repository:** https://github.com/Warr10rOfOdin/Taxiportal
