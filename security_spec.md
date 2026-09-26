# Security Specification: BrandForge Studio

## 1. Data Invariants
- All user resources (`logos`, `videos`, `palettes`, `music`, `verifications`) are strictly nested under `/users/{userId}/`.
- Access to any document under `/users/{userId}/` is restricted exclusively to authenticated users whose `request.auth.uid == userId`.
- All document IDs (`userId`, `logoId`, `videoId`, `paletteId`, `musicId`, `checkId`) must be valid alphanumeric identifier strings with length <= 128 characters.
- Documents require mandatory fields (`id`, `userId`, `createdAt`) and string limits to prevent payload poisoning and Denial of Wallet attacks.
- Users cannot read or modify another user's documents.
- Unauthenticated requests are completely rejected.

## 2. The Dirty Dozen Payloads
1. **Unauthenticated Read**: Attempting to read `/users/{userId}/logos` without signing in. Expected: `PERMISSION_DENIED`.
2. **Cross-Tenant Read**: User A (`uid_1`) attempting to read `/users/{uid_2}/logos/{logoId}`. Expected: `PERMISSION_DENIED`.
3. **Cross-Tenant Write**: User A (`uid_1`) attempting to write a logo under `/users/{uid_2}/logos/{logoId}`. Expected: `PERMISSION_DENIED`.
4. **Id Spoofing**: User A creates a document under `/users/{uid_1}/logos/{logoId}` where `incoming().userId == 'uid_2'`. Expected: `PERMISSION_DENIED`.
5. **Path Poisoning**: Target operation with 2KB string as `logoId`. Expected: `PERMISSION_DENIED`.
6. **Ghost Field Injection**: Adding arbitrary undocumented root key `isAdmin: true` during update. Expected: `PERMISSION_DENIED`.
7. **Type Poisoning**: Sending an integer or boolean for `companyName` or `imageUrl`. Expected: `PERMISSION_DENIED`.
8. **Immutability Bypass**: Attempting to alter `userId` or `createdAt` during an update. Expected: `PERMISSION_DENIED`.
9. **Blanket Query Scraping**: Attempting a collection group query or unbounded read without `userId == request.auth.uid`. Expected: `PERMISSION_DENIED`.
10. **Oversized Payload**: Sending `companyName` exceeding 128 characters. Expected: `PERMISSION_DENIED`.
11. **Malicious Subcollection Creation**: Attempting to create an arbitrary subcollection `/users/{userId}/system_secrets`. Expected: `PERMISSION_DENIED`.
12. **Root Document Tampering**: Attempting to write directly to `/admin` or arbitrary unmapped collections. Expected: `PERMISSION_DENIED`.
