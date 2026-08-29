# CryonFX — Realtime Requirements

---

## 1. What Belongs in Valkey vs PostgreSQL

### Valkey (Redis-compatible)

| Data | Key Pattern | TTL | Notes |
|------|-------------|-----|-------|
| Session tokens | `session:{token_hash}` | 8h | HTTP-only cookie maps to this |
| Staff presence status | `presence:{user_id}` | 30s heartbeat | online/away/busy/offline |
| Typing indicators | `typing:{conversation_id}:{user_id}` | 3s auto-expire | Ephemeral |
| Market price cache | `quote:{symbol}` | 2s | From provider WebSocket |
| Market candle cache | `candles:{symbol}:{timeframe}` | 60s | From provider |
| Order book cache | `orderbook:{symbol}` | 1s | From provider |
| Rate limiting | `ratelimit:{ip}:{endpoint}` | 60s | Per-IP per-endpoint |
| Pub/Sub channels | `channel:chat:{conversation_id}` | — | Message fan-out |
| Pub/Sub channels | `channel:notifications:{user_id}` | — | Notification delivery |
| Pub/Sub channels | `channel:presence` | — | Presence broadcast |
| Pub/Sub channels | `channel:market:{symbol}` | — | Market data broadcast |

### PostgreSQL

| Data | Table | Notes |
|------|-------|-------|
| Session metadata | `sessions` | Token hash, device, IP, expiry |
| Presence history | `staff_presence_log` | Phase 2 — for reporting |
| Messages | `messages` | Persistent chat history |
| Notifications | `notifications` | Persistent notification inbox |
| Audit logs | `audit_logs` | Immutable |
| All business data | (all other tables) | Persistent source of truth |

---

## 2. Realtime Features by Category

### Market Data

| Feature | Mechanism | Source |
|---------|-----------|--------|
| Live price updates | WebSocket → Valkey → WS broadcast | External provider (Binance/etc.) |
| Candlestick charts | WebSocket + REST for history | Provider + Valkey cache |
| Order book | WebSocket | Provider + Valkey cache |
| Recent trades | WebSocket | Provider + Valkey cache |
| Top movers | Computed from price cache | Valkey |

**WebSocket Events**:
- `quote:update` — `{ symbol, price, change24h, changePct24h, high24h, low24h, volume24h, lastUpdated }`
- `candle:update` — `{ symbol, timeframe, candle: { time, open, high, low, close, volume } }`
- `trade:update` — `{ symbol, price, amount, side, timestamp }`
- `market:status` — `{ status: 'open' | 'closed' | 'maintenance' }`

---

### Chat (Customer ↔ Staff)

| Feature | Mechanism | Storage |
|---------|-----------|---------|
| New message | WS pub/sub | PostgreSQL (persistent) |
| Message delivery | WS event | PostgreSQL |
| Read receipts | WS event | PostgreSQL `message_reads` |
| Typing indicator | WS event | Valkey (3s TTL) |
| Customer online status | WS event | Valkey |

**WebSocket Events**:
- `message:new` — `{ id, conversationId, senderId, senderName, senderRole, content, timestamp, isInternal }`
- `message:read` — `{ conversationId, messageId, readBy, readAt }`
- `typing:start` — `{ conversationId, userId, userName }`
- `typing:stop` — `{ conversationId, userId }`

---

### Internal Staff Chat

| Feature | Mechanism | Storage |
|---------|-----------|---------|
| New message | WS pub/sub | PostgreSQL |
| Read receipts | WS event | PostgreSQL `message_reads` |
| Typing indicator | WS event | Valkey (3s TTL) |
| Staff presence | WS event | Valkey (30s heartbeat) |
| New conversation | WS event | PostgreSQL |

**WebSocket Events** (same as chat + presence):
- `message:new`
- `message:read`
- `typing:start`
- `typing:stop`
- `presence:update` — `{ userId, userName, status, lastSeen }`
- `conversation:new` — `{ id, type, name, participants }`

---

### Presence

| Feature | Mechanism | Storage |
|---------|-----------|---------|
| Staff online/away/busy/offline | Heartbeat + WS | Valkey (primary) |
| Customer online status | WS event | Valkey |
| Last seen | Updated on heartbeat | Valkey + PostgreSQL (on disconnect) |

**Heartbeat**: Client sends heartbeat every 20s. Server sets Valkey TTL to 30s. If no heartbeat, presence expires to `offline`.

**WebSocket Events**:
- `presence:update` — `{ userId, status: 'online' | 'away' | 'busy' | 'offline', lastSeen }`

---

### Notifications

| Feature | Mechanism | Storage |
|---------|-----------|---------|
| New notification | WS push | PostgreSQL |
| Unread count | WS event | PostgreSQL (computed) |
| Mark as read | REST + WS | PostgreSQL |

**WebSocket Events**:
- `notification:new` — `{ id, type, title, message, resourceType, resourceId, customerId, linkHref, createdAt }`

---

### Assignments

| Feature | Mechanism | Storage |
|---------|-----------|---------|
| New assignment | WS push to assignee | PostgreSQL |
| Reassignment | WS push to new + old assignee | PostgreSQL |
| Assignment status change | WS push | PostgreSQL |

**WebSocket Events**:
- `assignment:new` — `{ id, customerId, customerName, priority, assignedAt }`
- `assignment:updated` — `{ id, customerId, status, reassignedTo? }`

---

### Tasks

| Feature | Mechanism | Storage |
|---------|-----------|---------|
| New task | WS push to assignee | PostgreSQL |
| Task status update | WS push to manager | PostgreSQL |
| Task overdue | Scheduled job → WS | PostgreSQL |

**WebSocket Events**:
- `task:new` — `{ id, customerId, customerName, type, priority, dueDate }`
- `task:updated` — `{ id, status, updatedBy, updatedAt }`

---

### Calls

| Feature | Mechanism | Storage |
|---------|-----------|---------|
| Call state changes | WS push | PostgreSQL |
| Call connected/ended | WS event | PostgreSQL |

**WebSocket Events**:
- `call:status` — `{ sessionId, customerId, state, duration }`

---

## 3. WebSocket Architecture

```
Browser Client
    │
    │ WSS connection (authenticated via session cookie)
    ▼
CryonFX API Server (Node.js)
    │
    ├── Authenticates WS connection via session cookie
    ├── Subscribes client to relevant Valkey channels
    │
    ▼
Valkey Pub/Sub
    │
    ├── channel:chat:{conversation_id}
    ├── channel:notifications:{user_id}
    ├── channel:presence
    ├── channel:market:{symbol}
    ├── channel:assignments:{staff_id}
    └── channel:tasks:{staff_id}
```

---

## 4. Complete WebSocket Event Reference

| Event Name | Direction | Payload | Trigger |
|-----------|-----------|---------|---------|
| `message:new` | S→C | `{ id, conversationId, senderId, senderName, content, timestamp, isInternal }` | New message sent |
| `message:read` | S→C | `{ conversationId, messageId, readBy, readAt }` | Message read |
| `typing:start` | S→C | `{ conversationId, userId, userName }` | User typing |
| `typing:stop` | S→C | `{ conversationId, userId }` | User stopped typing |
| `conversation:new` | S→C | `{ id, type, name, participants }` | New conversation |
| `presence:update` | S→C | `{ userId, status, lastSeen }` | Presence change |
| `notification:new` | S→C | `{ id, type, title, message, linkHref }` | New notification |
| `assignment:new` | S→C | `{ id, customerId, customerName, priority }` | New assignment |
| `assignment:updated` | S→C | `{ id, status, reassignedTo? }` | Assignment change |
| `task:new` | S→C | `{ id, customerId, type, priority, dueDate }` | New task |
| `task:updated` | S→C | `{ id, status, updatedBy }` | Task status change |
| `quote:update` | S→C | `{ symbol, price, change24h, changePct24h, high24h, low24h, volume24h }` | Market price tick |
| `candle:update` | S→C | `{ symbol, timeframe, candle }` | New candle |
| `trade:update` | S→C | `{ symbol, price, amount, side, timestamp }` | Market trade |
| `market:status` | S→C | `{ status }` | Market open/close |
| `call:status` | S→C | `{ sessionId, customerId, state, duration }` | Call state change |

---

## 5. Scheduled Jobs (Not Realtime but Related)

| Job | Frequency | Action |
|-----|-----------|--------|
| Task overdue check | Every 5 minutes | Mark tasks as `overdue` if past `due_date` |
| Session cleanup | Every hour | Remove expired sessions from PostgreSQL |
| Presence cleanup | Every 60s | Expire stale Valkey presence keys |
| Market data refresh | Every 2s | Update Valkey quote cache from provider |
