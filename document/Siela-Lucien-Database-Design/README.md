# Team Member 5 — Database Design & Technical Documentation
**Siela Lucien — Database Designer & Technical Documentation**

This folder is my scoped deliverable for the Analysis & Design phase, per
`analysis_and_design_phase_guide.pdf`. It covers exactly what's assigned
to Team Member 5 — nothing from Requirements (Gig), System
Architecture/UML (Arrey), UX (Fon Ronic), or UI (Didiertech).

## ⚠️ Flag for the team before I present this

Arrey's System Architecture Diagram specifies **Node.js + Express.js +
MySQL**. I've been told the actual database is **Firebase (Firestore)**.
Those two documents currently contradict each other, and it affects more
than just my part:

- **MySQL is relational** (tables, foreign keys, JOINs). **Firestore is a
  NoSQL document database** (collections of documents, no joins, no
  fixed schema enforced by the database itself). The data model, the ER
  diagram, and the "schema" all had to be designed differently as a
  result — this is not a small find-and-replace.
- Firebase also **replaces entire modules** in Arrey's Application
  Server layer, not just the database box at the bottom:
  - **Authentication Module** → Firebase Authentication handles
    registration, login, and email verification natively. No custom
    password hashing or SMTP server needed.
  - **Messaging Module's "real-time"** → Firestore's real-time listeners
    (`onSnapshot`) push live updates to clients directly — no custom
    WebSocket server needed.
  - Media storage → Firebase Storage, not a generic "cloud storage API."

**I'd raise this with Arrey and the group before the presentation** —
either the architecture diagram needs a Firebase-specific update, or
someone confirms MySQL is actually still correct and I'm working from
wrong information. I'm proceeding on the Firebase instruction I was
given, but this is a real cross-team dependency, not just a detail.

## What's in this folder

| File | Deliverable (per the task allocation doc) |
|---|---|
| `ER_DIAGRAM.md` | ER Diagram (adapted to a Firestore collection/document model) |
| `FIRESTORE_SCHEMA.md` | Database Schema |
| `DATA_DICTIONARY.md` | Data Dictionary |
| `API_DOCUMENTATION.md` | Initial API Documentation |
| `INSTALLATION_GUIDE.md` | Installation Guide |
| `TECHNICAL_DOCUMENTATION.md` | Technical Documentation |

## Scope covered

Matches the seven modules from Arrey's System Analysis (Authentication,
Marketplace, Services, Internships & Jobs, Campus Events, Messaging,
Search & Filter) — the collections below exist because those modules
need somewhere to keep their data, not because I designed new features.
