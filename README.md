
  
# GRC Dashboard Application

A Governance, Risk & Compliance (GRC) dashboard built with Convex, React, TypeScript, and Tailwind.

This app is a **portfolio project** to show how I think about:
- Structuring GRC data (risks, controls, organizations, integrations)
- Tracking risk posture in real time
- Integrating with external systems (SIEM, HR, ERP, APIs)
- Building a modern, responsive dashboard UI

---

## Features

### 🏢 Multi-organization support
- Create and manage multiple organizations
- Role-based access (admin, manager, viewer)
- Organization selector in the header

### 📊 GRC dashboard overview
- Real-time counts of risks, controls, and compliance items
- Risk distribution by category
- Risk heat map visualization
- Control effectiveness indicators

### ⚠️ Risk management
- Create, edit, and track risks
- Likelihood × impact scoring
- Status tracking (identified, assessed, mitigated, etc.)
- Risk categories: operational, financial, strategic, AI, etc.

### 🔗 Integrations
- Placeholder structure for:
  - REST API integrations
  - Webhooks
  - File imports
  - SIEM / logging systems
- Integration status and sync options

### 🛡️ Security & auditability
- Convex Auth for authentication
- Data isolation per organization
- Audit trail via backend functions

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** [Convex](https://www.convex.dev/) (serverless database & functions)
- **Auth:** Convex Auth
- **Tooling:** ESLint, TypeScript, npm

---

## Running the project locally

> Requires Node.js (LTS) and npm.

```bash
# Install dependencies
npm install

# Start the dev server
npm run devauthentication routes.
