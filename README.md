# Vouch — Community Tool Sharing

Vouch is a hyper-local tool-sharing mobile app that helps neighbors lend and borrow equipment with clear pricing, trust signals, handover verification, and rental protection.

## Product highlights

- Browse nearby tools by category and search radius
- List tools with photos, pricing, availability, and protection settings
- Track borrowing and lending activity in one place
- Use trust scores, verification, ratings, and handover PINs to make exchanges safer
- Manage notifications, location privacy, payouts, payment methods, and support
- Optional Vouch Plus membership for unlimited borrowing and added protection

## Screenshots

The `assets/screenshots/` directory contains a visual reference for the complete product surface:

| Screen | Preview |
| --- | --- |
| The Stash | [01-stash.jpg](assets/screenshots/01-stash.jpg) |
| My Garage | [02-garage.jpg](assets/screenshots/02-garage.jpg) |
| Activity | [03-activity.jpg](assets/screenshots/03-activity.jpg) |
| Profile & Trust Center | [04-profile.jpg](assets/screenshots/04-profile.jpg) |
| Tool detail | [05-item-detail.jpg](assets/screenshots/05-item-detail.jpg) |
| Rental detail | [06-rental-detail.jpg](assets/screenshots/06-rental-detail.jpg) |
| List a tool | [07-list-item.jpg](assets/screenshots/07-list-item.jpg) |
| Location & privacy | [08-location.jpg](assets/screenshots/08-location.jpg) |
| Notification controls | [09-notifications.jpg](assets/screenshots/09-notifications.jpg) |
| Payments & membership | [10-payments.jpg](assets/screenshots/10-payments.jpg) |
| Support & knowledge base | [11-support.jpg](assets/screenshots/11-support.jpg) |

## Project structure

- `app/` — Expo Router screens and navigation
- `components/` — reusable UI components
- `contexts/` — local app state and persistence
- `constants/` and `hooks/` — theme tokens and shared hooks
- `assets/images/` — product imagery and app icon
- `assets/screenshots/` — portfolio reference images

## Run locally

```bash
npm install
npx expo start
```

The app uses local sample data and device storage so the core flows can be explored without a server.

## Portfolio note

This repository is a focused showcase of the Vouch mobile product experience and its supporting interaction design.
