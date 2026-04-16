# Epic-1 API Examples

Base URLs:

- Backend: `http://localhost:8081/api`
- Customer JWT: replace `CUSTOMER_TOKEN`
- Admin JWT: replace `ADMIN_TOKEN`

## Postman Request Examples

### 1. Create Table (`ADMIN`)

- Method: `POST`
- URL: `{{baseUrl}}/tables`
- Headers:
  - `Authorization: Bearer {{adminToken}}`
  - `Content-Type: application/json`
- Body:

```json
{
  "tableNumber": "T-12",
  "capacity": 4,
  "status": "AVAILABLE",
  "location": "Window Bay",
  "floorNumber": 1
}
```

### 2. Get Available Tables (`CUSTOMER`)

- Method: `GET`
- URL: `{{baseUrl}}/tables/available?date=2026-04-20&time=19:00:00&endTime=21:00:00&capacity=4`
- Headers:
  - `Authorization: Bearer {{customerToken}}`

### 3. Create Reservation (`CUSTOMER`)

- Method: `POST`
- URL: `{{baseUrl}}/reservations`
- Headers:
  - `Authorization: Bearer {{customerToken}}`
  - `Content-Type: application/json`
- Body:

```json
{
  "tableId": 1,
  "reservationDate": "2026-04-20",
  "startTime": "19:00:00",
  "endTime": "21:00:00",
  "guestCount": 4,
  "specialRequests": "Birthday candles and a quiet corner"
}
```

### 4. Confirm Reservation (`ADMIN`)

- Method: `PUT`
- URL: `{{baseUrl}}/reservations/15/confirm`
- Headers:
  - `Authorization: Bearer {{adminToken}}`

### 5. Cancel Reservation (`ADMIN` or owner `CUSTOMER`)

- Method: `PUT`
- URL: `{{baseUrl}}/reservations/15/cancel`
- Headers:
  - `Authorization: Bearer {{customerToken}}`

### 6. Mark Table Occupied (`ADMIN`)

- Method: `PUT`
- URL: `{{baseUrl}}/tables/1/status`
- Headers:
  - `Authorization: Bearer {{adminToken}}`
  - `Content-Type: application/json`
- Body:

```json
{
  "status": "OCCUPIED"
}
```

## cURL Examples

```bash
curl -X POST http://localhost:8081/api/tables \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": "T-12",
    "capacity": 4,
    "status": "AVAILABLE",
    "location": "Window Bay",
    "floorNumber": 1
  }'
```

```bash
curl "http://localhost:8081/api/tables/available?date=2026-04-20&time=19:00:00&endTime=21:00:00&capacity=4" \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

```bash
curl -X POST http://localhost:8081/api/reservations \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": 1,
    "reservationDate": "2026-04-20",
    "startTime": "19:00:00",
    "endTime": "21:00:00",
    "guestCount": 4,
    "specialRequests": "Birthday candles and a quiet corner"
  }'
```

```bash
curl -X PUT http://localhost:8081/api/reservations/15/confirm \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

```bash
curl -X PUT http://localhost:8081/api/reservations/15/cancel \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

```bash
curl -X PUT http://localhost:8081/api/tables/1/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "OCCUPIED"
  }'
```
