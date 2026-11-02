# Feature: Prepare payment details
## 1. User goal
As a pet owner, I want to see the service and amount I will be charged
before I pay, so that I can confirm it is correct.
## 2. Scope
Review selected service and amount before payment.
Services and prices: see section 4.

Use the server catalogue price. Do not accept a client-supplied payment amount.
Any query-string values sent by the client (for example ?amount=1 or
?currency=usd) are ignored. Every response value comes from the server
catalogue or the fixed values in section 5.

## 3. Request
GET /payments/prepare/:serviceId

## 4. Service catalogue
Stored in the CommonJS module data/mockServices.js on the server (not in the
database), which exports an array, for example:
[{ id: 1, name: "Vaccination", price: 35 }, ...]
Module fields map to the response as: id -> serviceId, name -> serviceName,
price -> amount.
Prices are whole Singapore dollars (integers).
id, service name, price
1, Vaccination, 35
2, Pet Grooming, 50
3, Boarding, 80
serviceName must match the name above exactly, including capitalisation.
AC1-AC3 assume data/mockServices.js contains exactly these three services.

## 5. Successful response
HTTP 200, Content-Type application/json, with exactly five JSON fields:
serviceId (number, e.g. 1, not the string "1"),
serviceName (string, exactly as in section 4),
amount (number, whole dollars, from section 4),
currency (string, exactly "sgd"),
status (string, exactly "READY_FOR_PAYMENT").

## 6. Unsuccessful response
Any serviceId that is not an id in section 4 is an unknown service. The id
must be written as plain digits with no leading zeros, sign, decimal point
or spaces (e.g. exactly 1). This includes unknown ids (999), non-numbers
(abc), 0, negative numbers (-1), decimals (1.5), leading zeros (01), other
forms of a valid number (+1, 1.0, 1e0, %201 i.e. " 1") and a missing id
(/payments/prepare/ or /payments/prepare).
Unknown service: HTTP 404, Content-Type application/json,
body exactly {"error":"Service not found"}.

## 7. Acceptance criteria
"Body exactly" means the same fields, values and types; field order and
whitespace do not matter.
AC1: GET /payments/prepare/1 -> 200; body exactly
{"serviceId":1,"serviceName":"Vaccination","amount":35,"currency":"sgd","status":"READY_FOR_PAYMENT"}
AC2: GET /payments/prepare/2 -> 200; body exactly
{"serviceId":2,"serviceName":"Pet Grooming","amount":50,"currency":"sgd","status":"READY_FOR_PAYMENT"}
AC3: GET /payments/prepare/3 -> 200; body exactly
{"serviceId":3,"serviceName":"Boarding","amount":80,"currency":"sgd","status":"READY_FOR_PAYMENT"}
AC4: GET /payments/prepare/999 -> 404; body exactly {"error":"Service not found"}.
AC5: Each success has exactly the five agreed fields, no more and no fewer;
serviceId and amount are JSON numbers, not strings.
AC6: GET /payments/prepare/abc, /0, /-1, /1.5, /01, /+1, /1.0, /1e0, /%201,
/payments/prepare/ and /payments/prepare
each -> 404; body exactly {"error":"Service not found"}.
AC7: GET /payments/prepare/1?amount=1&currency=usd -> 200; body exactly as AC1.
AC8: Every response in AC1-AC7 and AC9 has a Content-Type starting with
application/json (a suffix such as "; charset=utf-8" is acceptable).
AC9: GET /payments/prepare/1 without logging in -> 200 with the AC1 body
(not a redirect to /login). The same request while logged in as any
normal-user account, and as any admin account, from db.sql returns the
same AC1 body.
Access: No login required for this classroom mock. Logged-in users (normal
or admin) and visitors who are not logged in receive the same response.
Out of scope: charging money, gateway integration, transactions,
new database tables, EJS pages, or changes to the behaviour of existing
routes and pages (they must work exactly as before; existing files may be
edited only to add this route).
HTTP methods other than GET (e.g. POST /payments/prepare/1) are not
specified or tested.
A missing or invalid data/mockServices.js (e.g. a syntax error, a price
written as text, or a duplicate id) is out of scope.
Values sent in a request body with GET are not specified or tested.
A trailing slash after a valid id (e.g. /payments/prepare/1/) may return the
same response as without it; this is not specified or tested.
Other paths (e.g. /payments or /payments/prepare/1/extra) are not specified
or tested.


## 8. Open questions
What has not yet been agreed? Do not silently invent an answer.
None at present.
