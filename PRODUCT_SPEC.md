# PRODUCT_SPEC.md

## 1. Overview

AssetFlow -- multi-tenant asset-based request and approval platform with
Slack notifications.

## 2. Core Principles

-   Simplicity over configurability
-   Mobile-first employee UX
-   Clear lifecycle tracking
-   Minimal setup friction
-   Premium UI/UX

## 3. Tech Stack

-   Next.js, TypeScript, TailwindCSS
-   PostgreSQL
-   Google OAuth
-   S3 storage
-   Slack Incoming Webhooks

## 4. Core Entities

User, Organization, Membership, Asset, Request, RequestAttachment,
SlackConfig

## 5. Roles

-   Owner/Admin: full access
-   Manager: approve/deny for assigned assets

## 6. Assets

Real-world entities (cars, machines, buildings, clients). Fields: -
name, description, tags - assigned managers - optional Slack override

## 7. Requests

Fields: - requestIdentifier - asset (optional) - amount + currency -
purpose - payeeDetails - additionalDetails - deadline - attachments

## 8. Lifecycle

SUBMITTED → UNDER_REVIEW → APPROVED → PAID → RECEIPTS_SUBMITTED →
COMPLETED\
OR → DENIED

## 9. Assignment Logic

-   Asset managers auto-assigned
-   Fallback to admins

## 10. Employee Features

-   Dashboard
-   Create request
-   View status
-   Upload receipts

## 11. Admin Features

-   Manage requests (approve/deny/pay)
-   Manage assets
-   Manage users
-   Slack settings
-   Insights dashboard

## 12. Slack Notifications

-   Incoming webhooks
-   Org-level fallback
-   Asset-level override
-   Events:
    -   New request
    -   Receipt submission

## 13. File Uploads

-   Images + PDF
-   Multiple uploads

## 14. Insights

-   Requests per asset
-   Trends over time
-   Status distribution

## 15. UX Guidelines

-   Light theme
-   Glassmorphism
-   Smooth animations
-   Mobile-first

## 16. Edge Cases

-   Multi-org users
-   Missing managers fallback
-   Slack failure handling

## 17. Future (Not MVP)

-   Multi-step approvals
-   Budget tracking
-   OCR receipts
