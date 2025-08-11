# MyVillupuram

MyVillupuram is a hyperlocal community platform for Villupuram district, Tamil Nadu, India.

Modules:
- Local News & Announcements
- Business & Service Directory
- Jobs & Opportunities
- Marketplace
- Transport & Travel Info (Automated train/bus timings)

Tech Stack:
- Mobile: React Native (Expo) + Firebase
- Admin: Next.js + Firebase
- Backend: Firebase Firestore, Auth (OTP), Cloud Functions, Cloud Scheduler, FCM


## Repository Structure

```
myvillupuram/
  mobile/               # React Native (Expo) Android app
  admin/                # Next.js admin dashboard for content management
  functions/            # Firebase Cloud Functions (train/bus updaters)
  firestore.rules       # Firestore security rules
  firestore.indexes.json# Firestore composite indexes
  firebase.json         # Firebase Hosting/Functions config
  .firebaserc           # Firebase project alias config
  README.md             # This file
```


## Prerequisites
- Node.js 18+ and npm or yarn
- Firebase CLI (`npm i -g firebase-tools`)
- A Firebase project with Firestore, Auth, Functions, Hosting enabled
- Android Studio (to build APK/AAB for Play Store) or EAS Build (Expo)
- Accounts/API Keys:
  - data.gov.in API key (optional, for fetching static datasets)
  - Live train status API key (free-tier provider; e.g., IndianRailAPI or RapidAPI)


## Firebase Setup

1) Login and initialize:
- `firebase login`
- `firebase use <PROJECT_ID>` or set an alias with `.firebaserc`

2) Create services:
- Enable: Firestore (in Native mode), Authentication, Cloud Functions, Cloud Messaging (FCM), Cloud Scheduler
- Authentication: enable Phone provider (OTP) and Email/Password for admin

3) Firestore rules and indexes:
- From repo root:
  - `firebase deploy --only firestore:rules`
  - `firebase deploy --only firestore:indexes`

Collections used:
- `news`: { title, description, image, category, posted_date }
- `directory`: { name, phone, location_link, category, image }
- `jobs`: { title, company, description, contact_number, posted_date }
- `marketplace`: { item_name, price, description, photo, seller_contact, approved }
- `transport_trains`: { train_no, train_name, scheduled_arrival, scheduled_departure, last_reported_station, estimated_arrival_time, delay_minutes, last_updated }
- `transport_buses`: { route_id, route_name, stop_name, arrival_time, service_days, last_updated }


## Cloud Functions and Scheduler

- Train updater: every 2–5 mins
- Bus updater: every 30–60 mins

Set required secrets:
- `firebase functions:secrets:set TRAIN_API_KEY`
- `firebase functions:secrets:set DATA_GOV_API_KEY`
- Optionally: `firebase functions:secrets:set TRAIN_API_BASE` and `BUS_GTFS_URL`

Deploy functions:
- `cd functions && npm ci && cd ..`
- `firebase deploy --only functions`

Configure Cloud Scheduler (examples):
- Train updater (every 3 mins):
  - `gcloud scheduler jobs create pubsub update-trains --schedule="*/3 * * * *" --topic=firebase-schedule-updateTrains --message-body="{}" --project=<PROJECT_ID> --location=<REGION>`
- Bus updater (every 45 mins):
  - `gcloud scheduler jobs create pubsub update-buses --schedule="*/45 * * * *" --topic=firebase-schedule-updateBuses --message-body="{}" --project=<PROJECT_ID> --location=<REGION>`

Note: Replace `<PROJECT_ID>` and `<REGION>` (e.g., asia-south1). The topics are auto-created by scheduled functions.


## Admin Panel (Next.js)

- `cd admin`
- `cp .env.example .env.local` and fill Firebase config + projectId
- `npm install`
- `npm run dev`

Deploy to Firebase Hosting:
- `npm run build`
- From repo root: `firebase deploy --only hosting:admin`


## Mobile App (Expo)

- `cd mobile`
- `cp .env.example .env`
- `npm install`
- `npx expo run:android` (first-time prebuild) or `npx expo start`

Build for Play Store:
- Configure your package name in `app.json`
- Configure FCM for Android notifications
- Use EAS Build (recommended): `npm install -g eas-cli` then `eas build -p android --profile production`


## Security and Roles

- Only admins can write/approve content. Assign admin role using custom claims:
  - Use Admin SDK (Node REPL or temporary script) to set `isAdmin: true` on the desired user UID
- All users: read-only access to published/approved content; marketplace write is restricted to admins per v1. Public listing submission can be implemented via Cloud Function + moderation.


## Internationalization (Tamil/English)

- Mobile and Admin support Tamil and English toggle via i18next


## Offline Support

- Mobile uses Firestore persistence and local caching for transport data


## Environment Variables and Secrets

- Mobile: `.env` for Firebase web config and optional API base URLs
- Admin: `.env.local` for Firebase web config
- Functions: Secrets via `firebase functions:secrets:set`


## Collections Schema

- news: title (string), description (string), image (string, URL), category (string), posted_date (Timestamp)
- directory: name (string), phone (string), location_link (string, URL), category (string), image (string, URL)
- jobs: title (string), company (string), description (string), contact_number (string), posted_date (Timestamp)
- marketplace: item_name (string), price (number), description (string), photo (string, URL), seller_contact (string), approved (bool)
- transport_trains: train_no (string), train_name (string), scheduled_arrival (string, HH:mm), scheduled_departure (string, HH:mm), last_reported_station (string), estimated_arrival_time (string, HH:mm), delay_minutes (number), last_updated (Timestamp)
- transport_buses: route_id (string), route_name (string), stop_name (string), arrival_time (string, HH:mm), service_days (string), last_updated (Timestamp)


## Publishing to Google Play

1) Generate AAB via EAS Build or Android Studio
2) Create store listing, upload AAB, set content rating, privacy policy
3) Add Firebase SHA-1/SHA-256 for phone auth verification
4) Configure FCM in Firebase console for Production


## Privacy and Compliance

- Store only necessary data
- Use Firebase App Check (optional) and deploy security rules
- Store API keys in Secrets Manager (Functions) and `.env` files locally


## Support

For issues, file a ticket or contact the maintainers.