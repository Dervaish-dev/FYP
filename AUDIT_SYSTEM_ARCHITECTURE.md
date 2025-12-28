# Audit Logging System - Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUDIT LOGGING SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Settings.jsx    │         │ CaregiverDash    │             │
│  │  (Patient View)  │         │ (Caregiver View) │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                            │                        │
│           └──────────┬─────────────────┘                        │
│                      │                                          │
│           ┌──────────▼──────────┐                               │
│           │  AuditLogViewer.jsx │                               │
│           │  - Timeline Display │                               │
│           │  - Filter by Action │                               │
│           │  - Stats Summary    │                               │
│           │  - Friendly Messages│                               │
│           └──────────┬──────────┘                               │
│                      │                                          │
│           ┌──────────▼──────────┐                               │
│           │     api.js          │                               │
│           │  - auditAPI methods │                               │
│           └──────────┬──────────┘                               │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                    HTTP GET
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                       BACKEND API                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              auditRoutes.js (API Endpoints)              │  │
│  │  GET /api/audit/my-logs      (Patient: View Access)     │  │
│  │  GET /api/audit/my-activity  (Caregiver: View Activity) │  │
│  │  GET /api/audit/stats        (Both: Statistics)         │  │
│  │  GET /api/audit/recent       (Both: Recent Activity)    │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│                  ┌────▼────┐                                    │
│                  │  auth   │ Verify user role                  │
│                  │middleware│                                   │
│                  └────┬────┘                                    │
│                       │                                         │
│                  ┌────▼────┐                                    │
│                  │AuditLog │ Query database                     │
│                  │ Model   │ getPatientLogs()                   │
│                  └────┬────┘ getCaregiverLogs()                 │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                    ┌───▼───┐
                    │MongoDB│
                    │AuditLog│
                    │Collection│
                    └───▲───┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│               AUDIT LOG CREATION FLOW                           │
├───────────────────────┴─────────────────────────────────────────┤
│                                                                  │
│  Caregiver Request → Caregiver Endpoint                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  caregiverRoutes.js                                      │  │
│  │  GET /api/caregiver/patient/:id                          │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│              ┌────▼────────┐                                    │
│              │authenticateCaregiver│                            │
│              │ Sets req.user.role  │                            │
│              └────┬────────┘                                    │
│                   │                                             │
│              ┌────▼──────────────────────┐                      │
│              │auditLogger middleware     │                      │
│              │1. Intercepts res.json()   │                      │
│              │2. Extracts patientId      │                      │
│              │3. Captures metadata       │                      │
│              │4. Creates audit log       │                      │
│              │5. Non-blocking async      │                      │
│              └────┬──────────────────────┘                      │
│                   │                                             │
│              ┌────▼────────────┐                                │
│              │ Route Handler   │                                │
│              │ Fetch patient   │                                │
│              │ data & respond  │                                │
│              └────┬────────────┘                                │
│                   │                                             │
│         ┌─────────┼─────────┐                                   │
│         │         │         │                                   │
│    ┌────▼───┐    │    ┌────▼────┐                              │
│    │Response│    │    │AuditLog │                              │
│    │to Client│   │    │Created  │                              │
│    └────────┘    │    └────┬────┘                              │
│                  │         │                                    │
│                  │    ┌────▼────┐                               │
│                  │    │ MongoDB │                               │
│                  │    │ Saved   │                               │
│                  │    └─────────┘                               │
│                  │                                              │
│              (Parallel execution)                               │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### Scenario: Caregiver views patient emotions

```
1. Caregiver clicks "View Patient" → Frontend sends:
   GET /api/caregiver/patient/abc123
   Authorization: Bearer <caregiver_token>

2. Request hits caregiverRoutes.js:
   router.get('/patient/:patientId', 
     authenticateCaregiver,           // Sets req.user.role = 'caregiver'
     auditLogger('view_full_profile', 'profile'),  // Audit middleware
     async (req, res) => { ... }
   )

3. auditLogger middleware:
   - Intercepts res.json()
   - Waits for successful response (200-299)
   - Extracts: patientId = 'abc123', caregiverId from token
   - Creates audit log asynchronously:
     {
       caregiver: caregiver._id,
       patient: 'abc123',
       action: 'view_full_profile',
       resourceType: 'profile',
       metadata: { endpoint: '/api/caregiver/patient/abc123' },
       ipAddress: '192.168.1.1',
       accessedAt: new Date()
     }

4. Route handler executes:
   - Fetches patient data from DB
   - Returns response to caregiver
   - Audit log saved in parallel (non-blocking)

5. Patient later views Settings → Audit tab:
   - Sees: "Dr. Smith viewed your full profile - 2 hours ago"
   - Can filter by action type, date range
   - Views statistics: total access, active days, etc.
```

## Audit Log Document Structure

```javascript
{
  _id: ObjectId("..."),
  caregiver: ObjectId("caregiver_id"),
  patient: ObjectId("patient_id"),
  action: "view_full_profile",
  resourceType: "profile",
  metadata: {
    endpoint: "/api/caregiver/patient/abc123",
    method: "GET",
    query: {}
  },
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0 ...",
  accessedAt: ISODate("2025-12-20T10:30:00Z"),
  
  // Virtual fields (computed)
  actionDescription: "viewed your full profile",
  timeAgo: "2 hours ago"
}
```

## Key Design Decisions

1. **Non-Blocking**: Audit logging never delays API responses
2. **Middleware-Based**: Automatic logging with minimal code duplication
3. **Flexible Filtering**: Patients/caregivers can filter by action, date
4. **Privacy First**: Role-based access to logs (patients see their own, caregivers see their activity)
5. **Metadata Rich**: Captures endpoint, IP, user agent for security
6. **Indexed Queries**: Fast retrieval with compound indexes
7. **Human-Friendly**: Virtual fields for readable action descriptions

## Security Considerations

- ✅ No PII in action descriptions
- ✅ IP addresses stored for anomaly detection
- ✅ Cannot be disabled by caregivers
- ✅ Tamper-proof (write-once, no delete API)
- ✅ Role-based access control
- ✅ Non-blocking to prevent DoS
