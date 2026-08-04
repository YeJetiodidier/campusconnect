# CampusConnect System Documentation

---

## Executive Summary
CampusConnect is a centralized, web-based Progressive Web App (PWA) tailored exclusively for university ecosystems. The system integrates student marketplace transactions, peer service directories, career/internship opportunities, campus event tracking, direct peer-to-peer messaging, promotional notifications, peer referral mechanisms, a seller/provider rating system, and an administrative announcements hub.

**Backend Infrastructure:** Firebase is utilized entirely as the serverless backend, leveraging **Firebase Authentication**, **Cloud Firestore**, **Cloud Storage for Firebase**, **Cloud Functions**, and **Firebase Cloud Messaging (FCM)**.

---

## 1. Requirements & System Specifications

### 1.1 Architecture & Interfaces
* **User Interface:** Responsive PWA supporting Desktop, Tablet, and Mobile viewports (320px to 2560px).
* **Backend Infrastructure (Firebase Suite):**
  * **Firebase Authentication:** Restricts registration to university domains (`.edu.cm` or approved institutional domains).
  * **Cloud Storage for Firebase:** Stores media assets, portfolio files, and PDF resumes.
  * **Cloud Firestore:** Real-time NoSQL database managing users, products, services, internships, events, chats, reviews, referrals, and announcements.
  * **Firebase Cloud Messaging (FCM) & Cloud Functions:** Handles promotional push notifications, real-time message alerts, automated referral tracking, and system update broadcasts.

### 1.2 Functional Requirements (FRD)

| Requirement ID | Module | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-AUTH-01** | User Auth | Restrict registration strictly to valid university email addresses (`.edu.cm` or institutional domain). | High |
| **FR-AUTH-02** | User Auth | Send automated verification email upon registration. | High |
| **FR-MKT-01** | Marketplace | Create, edit, soft-delete, and mark items as "Sold" in Firestore. | High |
| **FR-MKT-02** | Marketplace | Attach up to 5 high-resolution images per listing. | Medium |
| **FR-SRV-01** | Services | Post skill listings with hourly rates, skill tags, and portfolio links. | High |
| **FR-JOB-01** | Opportunities | Enable verified recruiters/admins to post internships and jobs with deadlines. | High |
| **FR-JOB-02** | Opportunities | Allow students to upload PDF resumes and apply directly. | High |
| **FR-EVT-01** | Campus Events | Schedule events with location, date, time, category, and capacity flags. | Medium |
| **FR-MSG-01** | Messaging | Enable direct, real-time messaging between prospective buyers/clients and sellers/providers. | High |
| **FR-SCH-01** | Search/Filter | Search globally or filter by category, price, condition, and posting date. | High |
| **FR-NOTIF-01** | Notifications | Send promotional push notifications to inform users about new listings and important updates. | High |
| **FR-REF-01** | Growth & Referral | Generate unique invite links/codes allowing students to invite peers and expand platform adoption. | Medium |
| **FR-REV-01** | Rating & Feedback | Allow users to submit star ratings and written feedback for sellers and service providers. | High |
| **FR-ANC-01** | Announcements | Broadcast administrative announcements and key campus updates on a dedicated board. | Medium |

### 1.3 Non-Functional Requirements (NFRD)
* **Performance:** Initial page load under 2.0 seconds over 4G; search execution under 500ms using indexed Firestore queries.
* **Security:** TLS 1.3/HTTPS transport encryption; granular Firebase Security Rules for documents and collections; media MIME validation.
* **Reliability & Availability:** Multi-region automated replication via Firebase maintaining 99.5%+ uptime.
* **Usability:** Compliance with WCAG 2.1 Level AA accessibility standards.

---

## 2. Updated Firebase System Architecture & Software Components

```
┌──────────────────────────────────────────────────────────────┐ 
│                         CLIENT LAYER                         │  
│  Desktop Browser   Mobile Browser   Tablet Browser           │  
│  HTML • CSS • JavaScript (Responsive Web App / PWA)          │  
└──────────────────────────────┬───────────────────────────────┘  
                               │ HTTPS / WebSockets
                               ▼  
┌──────────────────────────────────────────────────────────────┐  
│                      FIREBASE BACKEND                        │  
│                                                              │  
│  ┌────────────────────────┐      ┌────────────────────────┐  
│  │ Firebase Auth          │      │ Cloud Firestore        │  
│  │ • University Domain    │      │ • Real-time DB         │  
│  │   Verification         │      │ • Indexed Collections  │  
│  └────────────────────────┘      └────────────────────────┘  
│  ┌────────────────────────┐      ┌────────────────────────┐  
│  │ Cloud Storage          │      │ Cloud Functions & FCM  │  
│  │ • Images & PDF Resumes │      │ • Push Notifications   │  
│  │ • Portfolio Attachments│      │ • Referral Automation  │  
│  └────────────────────────┘      └────────────────────────┘  
└──────────────────────────────────────────────────────────────┘
```

### System Software Modules

| Module | Responsibility |
| :--- | :--- |
| **Presentation Layer** | Renders HTML/CSS/JS UI and listens to Firestore updates. |
| **Authentication Module** | Enforces institutional email validation (`.edu.cm`) and user sessions. |
| **Marketplace Module** | Manages listings, image uploads, and status updates. |
| **Services Directory** | Handles freelance skills, hourly rates, and portfolios. |
| **Internship & Career Portal** | Manages job posts and PDF resume uploads. |
| **Campus Events Hub** | Coordinates event schedules and attendee RSVPs. |
| **Messaging Module** | Executes low-latency chat using Firestore listeners. |
| **Notifications System** | Dispatches promotional push notifications and alerts via FCM. |
| **Referral System** | Tracks invite links and registers peer sign-ups. |
| **Rating & Feedback System** | Collects seller/provider reviews and updates composite trust scores. |
| **Announcements Hub** | Displays system updates and platform news published by administrators. |

---

## 3. Cloud Firestore NoSQL Data Schema

```
Firestore Root
├── users/ (Collection)
│   └── {userId} (Document)
│       ├── name: String
│       ├── email: String
│       ├── role: String
│       ├── referralCode: String
│       ├── referredBy: String
│       ├── averageRating: Number
│       └── createdAt: Timestamp
│
├── products/ (Collection)
│   └── {productId} (Document)
│       ├── sellerId: String
│       ├── title: String
│       ├── price: Number
│       ├── condition: String
│       ├── description: String
│       ├── imageUrls: Array<String>
│       ├── isSold: Boolean
│       └── createdAt: Timestamp
│
├── services/ (Collection)
│   └── {serviceId} (Document)
│       ├── providerId: String
│       ├── title: String
│       ├── description: String
│       ├── hourlyRate: Number
│       └── portfolioLink: String
│
├── ratings/ (Collection)
│   └── {ratingId} (Document)
│       ├── targetUserId: String (Seller or Service Provider)
│       ├── reviewerId: String
│       ├── ratingValue: Number (1 - 5)
│       ├── reviewText: String
│       └── createdAt: Timestamp
│
├── announcements/ (Collection)
│   └── {announcementId} (Document)
│       ├── title: String
│       ├── content: String
│       ├── authorId: String (Admin)
│       └── createdAt: Timestamp
│
├── referrals/ (Collection)
│   └── {referralId} (Document)
│       ├── referrerId: String
│       ├── referredUserId: String
│       ├── status: String ("Pending", "Completed")
│       └── createdAt: Timestamp
│
├── internships/ (Collection)
│   └── {internshipId} (Document)
│       ├── company: String
│       ├── location: String
│       ├── deadline: Timestamp
│       └── applications/ (Sub-collection)
│           └── {applicationId} (Document)
│               ├── applicantId: String
│               └── resumeUrl: String
│
├── events/ (Collection)
│   └── {eventId} (Document)
│       ├── title: String
│       ├── venue: String
│       └── date: Timestamp
│
└── chats/ (Collection)
    └── {chatId} (Document)
        ├── participants: Array<String>
        └── messages/ (Sub-collection)
            └── {messageId} (Document)
                ├── senderId: String
                ├── content: String
                └── timestamp: Timestamp
```

---

## 4. Visual Diagrams: UML Models & System Workflows

### 4.1 Visual UML Use Case Diagram
The following diagram details the interactions between the primary actors (Student and Administrator) and system use cases:

![CampusConnect UML Use Case Diagram](media/input_file_3.png)

---

### 4.2 Visual Use Case Diagram & Sequence Diagram (UC-01: Create Marketplace Listing)
The sequence flow and use case architecture for creating a marketplace listing with validation steps:

![UC-01 Create Marketplace Listing Sequence Diagram](media/input_file_2.png)

---

### 4.3 Visual Core System Workflows

#### Workflow 1: Buying an Item Flow
```
 ┌───────┐      ┌───────┐      ┌────────────────────┐      ┌─────────────┐
 │ Start │ ───> │ Login │ ───> │ Browse Marketplace │ ───> │ Search Item │
 └───────┘      └───────┘      └────────────────────┘      └─────────────┘
                                                                  │
 ┌───────┐      ┌────────────────────────┐      ┌──────────────┐  │
 │  End  │ <─── │ Seller Receives Message│ <─── │Contact Seller│ <┘
 └───────┘      └────────────────────────┘      └──────────────┘
```

#### Workflow 2: Selling an Item Flow
```
 ┌───────┐      ┌───────┐      ┌────────────────┐      ┌──────────────────────┐
 │ Start │ ───> │ Login │ ───> │ Create Listing │ ───> │ Enter Product Details│
 └───────┘      └───────┘      └────────────────┘      └──────────────────────┘
                                                                  │
 ┌───────┐      ┌───────────────────────────────┐      ┌──────────┴───────────┐
 │  End  │ <─── │ Listing Appears in Marketplace│ <─── │    Upload Images     │
 └───────┘      └───────────────────────────────┘      └──────────────────────┘
```

#### Workflow 3: Finding & Applying for an Internship Flow
```
 ┌───────┐      ┌───────┐      ┌────────────────────────┐      ┌──────────────────┐
 │ Start │ ───> │ Login │ ───> │ Open Internship Portal │ ───> │ Search Internship│
 └───────┘      └───────┘      └────────────────────────┘      └──────────────────┘
                                                                         │
 ┌───────┐      ┌────────────────────┐      ┌───────────────┐      ┌─────┴────────┐
 │  End  │ <─── │ Submit Application │ <─── │ Upload Resume │ <─── │ View Details │
 └───────┘      └────────────────────┘      └───────────────┘      └──────────────┘
```

---

#### Workflow 4: Rating & Feedback Workflow
```
 ┌───────┐      ┌───────┐      ┌────────────────────────┐      ┌───────────────────────┐
 │ Start │ ───> │ Login │ ───> │ Select Seller/Provider │ ───> │ Submit Rating (1-5★)  │
 └───────┘      └───────┘      └────────────────────────┘      └───────────────────────┘
                                                                           │
 ┌───────┐      ┌──────────────────────────────┐      ┌────────────────────┴───────────────────┐
 │  End  │ <─── │ Update Seller Composite Rating│ <─── │ Firestore Trigger (Calculate Average) │
 └───────┘      └──────────────────────────────┘      └────────────────────────────────────────┘
```

#### Workflow 5: Peer Referral Workflow
```
 ┌───────┐      ┌─────────────────────┐      ┌─────────────────────────┐      ┌───────────────────┐
 │ Start │ ───> │ Generate Invite Code│ ───> │ Peer Registers via Link │ ───> │ Validate Domain   │
 └───────┘      └─────────────────────┘      └─────────────────────────┘      └───────────────────┘
                                                                                        │
 ┌───────┐      ┌─────────────────────────────────┐      ┌──────────────────────────────┴──┐
 │  End  │ <─── │ Award Referral Status to User   │ <─── │ Store Referral Doc in Firestore │
 └───────┘      └─────────────────────────────────┘      └─────────────────────────────────┘
```

#### Workflow 6: Promotional Notification & Announcement Broadcast
```
 ┌───────┐      ┌─────────────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
 │ Start │ ───> │ Admin Posts Announcement│ ───> │ Write to Firestore   │ ───> │ Cloud Function Fired│
 └───────┘      └─────────────────────────┘      └──────────────────────┘      └─────────────────────┘
                                                                                          │
 ┌───────┐      ┌────────────────────────────────┐      ┌─────────────────────────────────┴──┐
 │  End  │ <─── │ User Opens Announcement Section│ <─── │ FCM Sends Push Notification Alert  │
 └───────┘      └────────────────────────────────┘      └────────────────────────────────────┘
```

---

## 5. UI/UX Design & Navigation Architecture

### 5.1 Visual Site Navigation Structure

```
                                     CampusConnect
                                           │
 ┌──────────────┬──────────────┬───────────┼───────────┬──────────────┬──────────────┐
 │              │              │           │           │              │              │
Home        Dashboard     Marketplace   Services  Internships       Events        Announcements
 ├─ Search   ├─ Quick Stats ├─ Categories├─ Provider├─ Company      ├─ Date/Venue  ├─ System News
 ├─ Banners  ├─ Shortcuts   ├─ Filters    ├─ Rates   ├─ Location     └─ RSVP        └─ Campus Updates
 ├─ Featured ├─ Activity    ├─ Product   └─ Portfolio└─ PDF Apply
 └─ Push Alerts             └─ Reviews
```

```
                       ┌──────────────────┼──────────────────┐
                       │                                     │
                  Referral System                         Profile
               ├─ Copy Invite Link                   ├─ Edit Profile
               └─ Track Referrals                    ├─ Seller Rating
                                                     ├─ My Listings
                                                     └─ Logout
```

---

### 5.2 Low-Fidelity Layout Wireframes

```
+-----------------------------------------------------------------------+
|  LOGO             [ Search Bar ]      Home | Marketplace | News (2)   |
+-----------------------------------------------------------------------+
|  [ ANNOUNCEMENT BANNER: System Update v1.2 Live - Check New Features ]|
+-----------------------------------------------------------------------+
|  REFERRAL BANNER: Invite a classmate & help grow CampusConnect!       |
|  [ Your Code: CAMPUS2026 ]                            [ Copy Link ]   |
+-----------------------------------------------------------------------+
|  FEATURED SELLERS & PROVIDERS                                         |
|  +-----------------+  +-----------------+  +-----------------+        |
|  | [ Photo ]       |  | [ Photo ]       |  | [ Photo ]       |        |
|  | Alex M. (Tutor) |  | Sarah K. (Tech) |  | John D. (Books) |        |
|  | Rating: ★★★★★  |  | Rating: ★★★★☆  |  | Rating: ★★★★★  |        |
|  | [ View Profile] |  | [ View Profile] |  | [ View Profile] |        |
|  +-----------------+  +-----------------+  +-----------------+        |
+-----------------------------------------------------------------------+
|  FOOTER: Terms | Privacy | Support                                    |
+-----------------------------------------------------------------------+
```

---

## 6. Requirement Traceability Matrix (RTM)

| REQ Ref ID | Business Objective / User Story | Functional REQ ID | Use Case Reference | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | Filter marketplace listings by category & price (US-01, US-02) | FR-MKT-01 | UC-01 | Integration Testing, UI Automated Tests |
| **REQ-02** | Direct messaging between buyer and seller (US-06) | FR-MSG-01 | UC-02 | Firestore Real-Time Listener Test |
| **REQ-03** | Dynamic search across listings with low latency (US-01, US-04) | FR-SCH-01 | UC-02 | Firestore Composite Index Test |
| **REQ-04** | Create peer service page and portfolio links (US-03) | FR-SRV-01 | UC-01 (Variant) | Functional System Test |
| **REQ-05** | Apply for internships using PDF resumes (US-04) | FR-JOB-01, FR-JOB-02 | UC-01 (Variant) | Cloud Storage & Firestore UAT |
| **REQ-06** | System Security & Restricted Email Auth (System Security) | FR-AUTH-01, FR-AUTH-02 | All Use Cases | Firebase Security Rules & Auth Test |
| **REQ-07** | Receive promotional push notifications for new listings & news | FR-NOTIF-01 | FCM Notification Flow | FCM Delivery & Mobile Alert Test |
| **REQ-08** | Invite other students via referral links to grow platform | FR-REF-01 | Referral Generation Flow | End-to-End Invite & Registration Test |
| **REQ-09** | Rate and review sellers/providers to build trust | FR-REV-01 | Rating & Review Flow | Firestore Trigger & Rating Calculation Test |
| **REQ-10** | Broadcast system updates via dedicated announcements section | FR-ANC-01 | Announcement View Flow | Admin Content Publishing Test |

---

## Technical Feasibility Summary
The consolidated architecture combining Firebase backend services with visual UML workflows, rating engines, push notifications, referrals, and announcements is fully feasible:
* **Firebase Services:** Firebase Auth handles `.edu.cm` domain validation; Cloud Firestore manages real-time reads/writes; Firebase Cloud Messaging handles user notifications.
* **Scalability:** The NoSQL structure handles dynamic feature expansion (ratings, announcements, referrals) without data migration bottlenecks.
* **User Engagement:** Structured referral engines and push notifications drive campus community growth, while ratings maintain trust.
