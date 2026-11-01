# Spring Boot API Reference

This reference was read from the running local OpenAPI document on 2026-10-31:

- Swagger UI: `http://localhost:8080/api/v1/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/api/v1/v3/api-docs`
- OpenAPI version: 3.1.0; API version: 1.0.0
- Server base path: `/api/v1`

In the endpoint table below, paths are relative to `/api/v1`.

## Response envelope

OpenAPI schemas define the shared envelope as:

```json
{
  "success": true,
  "code": 200,
  "errorCode": null,
  "message": "OK",
  "data": {},
  "meta": null,
  "errors": null,
  "timestamp": "2026-10-31T12:00:00Z",
  "correlationId": "..."
}
```

The schema includes `success`, numeric `code`, `message`, `data`, optional `errorCode`, pagination `meta`, field-level `errors`, `timestamp`, and `correlationId`. List endpoints return arrays in `data` and page information in `meta` (`pageNumber`, `pageSize`, `totalElements`, `totalPages`, `hasNext`, `hasPrevious`, `first`, `last`).

Do not assume the previous proposed `{ statusCode, message, data }` shape. Check HTTP status and the backend's `success`/`code` fields; validation details may be in `errors[]` with `field`, `rejectedValue`, and `message`.

## Authentication

The OpenAPI security scheme is HTTP Bearer JWT (`Authorization: Bearer <accessToken>`). The document sets `bearerAuth` globally, but the backend is configured with `permitAll()` for login, register, and refresh. The frontend interceptor deliberately omits Bearer JWT from those three calls. Logout and protected business endpoints retain Bearer authentication.

Authentication endpoints:

| Method | Path | Request | Response data |
|---|---|---|---|
| POST | `/auth/login` | `{ username, password }` | `AuthResponse` |
| POST | `/auth/register` | `RegisterRequest` | `AuthResponse` |
| POST | `/auth/refresh-token` | `{ refreshToken }` | `AuthResponse` |
| POST | `/auth/logout` | `{ refreshToken }` | void response |
| GET | `/auth/me` | — | `CustomUserDetails` (password field is ignored by the SPA) |

`AuthResponse` contains `accessToken`, `refreshToken`, `tokenType`, `expiresIn`, and `user`. `UserSummaryDto` contains `id`, `username`, `email`, `fullName`, `phoneNumber`, and `roles`.

## Endpoint inventory

### Guests

| Method | Path | Request/query | Result |
|---|---|---|---|
| GET | `/guests` | optional `keyword`; required `pageable` | paginated guest list |
| POST | `/guests` | `CreateGuestRequest` | guest |
| GET | `/guests/search` | required `criteria`, `pageable` | paginated guest list |
| GET | `/guests/{id}` | path `id` (int64) | guest |
| PUT | `/guests/{id}` | path `id`; `UpdateGuestRequest` | guest |
| DELETE | `/guests/{id}` | path `id` | void response |
| GET | `/guests/id-card/{idCardNumber}` | path `idCardNumber` | guest |

`GuestDto`: `id`, `userId`, `firstName`, `lastName`, `fullName`, `idCardNumber`, `phoneNumber`, `email`, `address`, `nationality`, `dateOfBirth`, `gender`, `vipLevel`, `notes`, `createdAt`.

`CreateGuestRequest` requires `firstName`, `lastName`, `idCardNumber`, and `phoneNumber`; it also accepts `userId`, `email`, `address`, `nationality`, `dateOfBirth`, `gender`, `vipLevel`, and `notes`. `UpdateGuestRequest` requires `firstName`, `lastName`, and `phoneNumber`; other profile fields are optional.

Guest search criteria: `firstName`, `lastName`, `idCardNumber`, `phoneNumber`, `email`, `nationality`, `gender`, `vipLevel`.

The guest-management page uses the shared API client for all operations. `GET /guests` supports keyword search and pageable fields; `GET /guests/search` sends populated search-criteria fields alongside pageable fields using the OpenAPI query-object form (for example, `firstName=An&page=0&size=10`). Exact ID-card lookup uses `GET /guests/id-card/{idCardNumber}`. The page also supports detail, create, update, and delete operations.

Paginated calls can use `$api.withMeta<T>()` to receive the validated success envelope, including its `meta` pagination fields. Existing `$api<T>()` callers still receive only `data`.

### Rooms

| Method | Path | Request/query | Result |
|---|---|---|---|
| GET | `/rooms` | optional `status`, `roomTypeId`, `floorNumber`; required `pageable` | paginated room list |
| POST | `/rooms` | `CreateRoomRequest` | room |
| GET | `/rooms/{id}` | path `id` (int64) | room |
| PATCH | `/rooms/{id}/status` | path `id`; `UpdateRoomStatusRequest` | room |
| GET | `/rooms/available` | required `roomTypeId`, `checkInDate`, `checkOutDate` | available room list |

`RoomDto`: `id`, `roomNumber`, `roomTypeId`, `roomTypeCode`, `roomTypeName`, `basePrice`, `floorNumber`, `status`, `notes`.

Room statuses: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`, `MAINTENANCE`. The rooms page filters with `GET /rooms` by status, room type, and floor; pageable fields are sent as `page`, `size`, and `sort`. Its optional availability search uses `GET /rooms/available` with check-in/check-out dates and a room type. If no type is selected, the page queries each active room type and combines the results so the search covers all types. Availability results are paginated locally because the API does not expose a pageable parameter. The page also creates rooms with `POST /rooms` and updates a room's status with `PATCH /rooms/{id}/status`.

`CreateRoomRequest` requires `roomNumber`, `roomTypeId`, and `floorNumber`; accepts `status` and `notes`. `UpdateRoomStatusRequest` requires `status`, and accepts `notes`.

### Room types

| Method | Path | Request/query | Result |
|---|---|---|---|
| GET | `/room-types` | — | active room type list |
| POST | `/room-types` | `CreateRoomTypeRequest` | room type |
| GET | `/room-types/{id}` | path `id` (int64) | room type |
| GET | `/room-types/search` | required `criteria`, `pageable` | paginated room type list |

`RoomTypeDto`: `id`, `code`, `name`, `description`, `basePrice`, `maxAdults`, `maxChildren`, `sizeSqm`, `status`, `amenities`.

`CreateRoomTypeRequest` requires `code`, `name`, and `basePrice`; accepts `description`, `maxAdults`, `maxChildren`, `sizeSqm`, and `amenityCodes`. Search criteria: `code`, `name`, `status`, `minBasePrice`, `maxBasePrice`, `maxAdults`, `maxChildren`.

### Bookings

| Method | Path | Request/query | Result |
|---|---|---|---|
| GET | `/bookings` | optional `status`, `startDate`, `endDate`; required `pageable` | paginated booking list |
| POST | `/bookings` | `CreateBookingRequest` | booking |
| GET | `/bookings/search` | required `criteria`, `pageable` | paginated booking list |
| GET | `/bookings/{id}` | path `id` (int64) | booking |
| GET | `/bookings/code/{bookingCode}` | path `bookingCode` | booking |
| POST | `/bookings/{id}/check-in` | path `id`; no body | booking |
| POST | `/bookings/{id}/check-out` | path `id`; no body | booking |
| POST | `/bookings/{id}/cancel` | path `id`; no body | booking |

`BookingDto`: `id`, `bookingCode`, `guest`, `createdByUserId`, `checkInDate`, `checkOutDate`, `actualCheckIn`, `actualCheckOut`, `adultsCount`, `childrenCount`, `totalAmount`, `depositAmount`, `status`, `specialRequests`, `rooms`, `createdAt`.

Booking statuses: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`. Search criteria: `bookingCode`, `guestId`, `guestIdCardNumber`, `status`, `checkInDateFrom`, `checkInDateTo`, `checkOutDateFrom`, `checkOutDateTo`, `minTotalAmount`, `maxTotalAmount`.

The room page supports listing/searching, room creation, and room-status updates. Create and status-update requests use the typed bodies above and refresh the current room list after success. Operation results use a shared popup: the API response `message` is the title, while a contextual message is shown in the body; API validation details and correlation IDs are included on failures when available. The booking page supports criteria-based search and server pagination only. It uses `GET /bookings` for the unfiltered list or status-only filter, and `GET /bookings/search` for booking code, guest identity, date range, or amount criteria. Selecting a result loads its full detail with `GET /bookings/{id}`. The booking page does not create or mutate records.

`CreateBookingRequest` requires `roomIds`, `checkInDate`, and `checkOutDate`; it accepts `guestId` or `newGuest`, plus `adultsCount`, `childrenCount`, `depositAmount`, and `specialRequests`.

## Request serialization notes

- Dates use ISO `YYYY-MM-DD`; timestamps use ISO date-time.
- `pageable` and advanced-search `criteria` are documented as required query parameters whose schemas are objects (`Pageable`, `GuestSearchCriteria`, `RoomTypeSearchCriteria`, `BookingSearchCriteria`). Object fields use OpenAPI's default form/explode query serialization; verify the Spring binding with Swagger UI or an actual request when implementing other object-query endpoints.
- Pageable properties: `page` (minimum 0), `size` (minimum 1), `sort` (string array).
- IDs use 64-bit integers; monetary values use JSON numbers.
- Request bodies use `application/json`.

## Frontend integration

The shared client is configured to target `http://localhost:8080/api/v1` by default; override it with `NUXT_PUBLIC_API_BASE` for another environment. Its refresh route is `/auth/refresh-token` and can be overridden with `NUXT_PUBLIC_API_REFRESH_ENDPOINT`.

`$api<T>()` unwraps `data` from the backend envelope, normalizes `success: false` responses into `ApiError`, and adds Bearer JWT to protected requests. When a protected request returns HTTP 401, it shares one refresh request across concurrent calls, stores the rotated `accessToken` and `refreshToken`, and retries the original request once. Login, register, and refresh do not attach Bearer JWT and do not start a nested refresh. If refresh fails or a retried request still gets 401, both tokens are cleared.

The local dashboard mock is not part of the Spring API and explicitly targets the Nuxt origin.

## Login and preview mode

The `/login` page defaults to Admin mode. It calls `POST /api/v1/auth/login` with `{ username, password }`, stores the returned access/refresh tokens, and displays the backend message and field-level validation errors on the form.

Guest mode is a frontend-only preview persisted for the current browser tab. It clears JWTs and allows the dashboard's local Nuxt mock only. Navigation to other pages shows an Admin-required message; direct protected API calls are rejected client-side with `GUEST_MODE_REQUIRES_AUTH` and are not sent to Spring Boot.

The topbar account menu links to `/profile`, which loads `GET /api/v1/auth/me`, and offers logout via `POST /api/v1/auth/logout`. Logout clears local tokens even if server-side revocation fails; the user is returned to login with a visible warning in that case. The profile view explicitly whitelists display fields and never stores or renders the `password` property exposed by the OpenAPI `CustomUserDetails` schema.
