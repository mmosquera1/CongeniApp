# CongeniApp Firestore Data Model

## Collections

- `users`
  - `fullName`: string
  - `email`: string
  - `displayUnit`: string (e.g. "Torre A - Piso 4 - Dpto 2")
  - `address`: map { `street`, `city`, `province`, `country`, `postalCode` }
  - `geoPoint`: geopoint (lat, lng) within 50 m of building
  - `unitNumber`: string
  - `phoneNumber`: string
  - `verificationStatus`: string (`pending`, `approved`, `rejected`)
  - `verificationMethod`: string (`geo`, `docs`)
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
  - `buildingId`: reference to building document
  - `avatarUrl`: string (optional)

  - Subcollection `publicProfile`
    - Single document mirroring public-safe fields for cacheable lookups.

- `buildings`
  - `name`: string
  - `address`: map (structured address)
  - `geoPoint`: geopoint for building centroid
  - `radiusMeters`: number (default 50)
  - `createdAt`: timestamp
  - `stats`: map { `reviewCount`, `averageRating`, `serviceCount`, `listingCount` }
  - Subcollection `units`
    - `unitNumber`: string
    - `userId`: reference to users document
    - `status`: string (`occupied`, `vacant`)

- `reviews`
  - `buildingId`: reference
  - `authorId`: reference to users document
  - `type`: string (`noise`, `neighbor`, `amenity`, `green-space`, `general`)
  - `title`: string
  - `body`: string
  - `summary`: string (auto-generated excerpt)
  - `rating`: number (1–5)
  - `images`: array<string> (Firebase Storage URLs, max length 3)
  - `helpfulCount`: number
  - `notHelpfulCount`: number
  - `reportedBy`: array<string> (user ids)
  - `createdAt`: timestamp
  - `updatedAt`: timestamp
  - `visibilityUnit`: string (public-facing unit label)

  - Subcollection `ratings`
    - `userId`: string
    - `value`: number (1 = helpful, -1 = not helpful)
    - `createdAt`: timestamp

- `services`
  - `buildingId`: reference (optional)
  - `neighborhoodId`: string (for broader reach)
  - `category`: string (`plumber`, `electrician`, etc.)
  - `name`: string
  - `description`: string
  - `contact`: map { `phone`, `email`, `url` }
  - `createdBy`: reference to users
  - `averageRating`: number
  - `ratingCount`: number
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

  - Subcollection `ratings`
    - `userId`: string
    - `value`: number (1–5)
    - `comment`: string
    - `createdAt`: timestamp

- `listings`
  - `buildingId`: reference
  - `sellerId`: reference to users
  - `title`: string
  - `description`: string
  - `price`: number
  - `currency`: string (ISO 4217 code)
  - `condition`: string (`new`, `used`)
  - `imageUrls`: array<string> (max length 6)
  - `status`: string (`active`, `reserved`, `sold`)
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

- `verifications`
  - `userId`: reference
  - `method`: string (`geo`, `document`)
  - `status`: string (`pending`, `approved`, `rejected`)
  - `documents`: array<map> (each map with `type`, `fileUrl`, `uploadedAt`)
  - `geoAttempt`: map { `lat`, `lng`, `accuracyMeters`, `requestedAt` }
  - `reviewedBy`: string (admin uid)
  - `reviewedAt`: timestamp

- `geofences`
  - `buildingId`: reference
  - `center`: geopoint
  - `radiusMeters`: number
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

## Storage Buckets

- `reviewImages/{reviewId}/{filename}`: max 3 files per review, validate mime type.
- `verificationDocs/{userId}/{filename}`: restricted to admin read.

## Authentication Claims

- Custom claims `admin`: boolean; set via backend after manual approval.

## Cloud Functions (suggested)

- Trigger on `reviews` write: recompute building stats.
- Trigger on `services/{serviceId}/ratings`: recompute average rating.
- Callable function `submitVerification` for document uploads with validation.
