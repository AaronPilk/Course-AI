---
module: 2
position: 4
title: "Order management essentials"
objective: "Track orders correctly so your bot's internal state matches reality."
estimated_minutes: 7
---

# Order management essentials

## The order management problem

Your bot has an intent: "Be long 100 AAPL." The broker has a state: "Order #12345 is partially filled, 60 of 100 done." Real position: "60 shares of AAPL at $187.43."

These three must stay in sync. They drift apart constantly:

- Bot submits an order; doesn't hear back; assumes filled when actually rejected.
- Order fills partially; bot assumes full fill.
- User intervenes manually in the brokerage UI.
- Connection drops; reconnects; some events missed.

Order Management System (OMS) is the layer that keeps these aligned. Even a small bot needs an OMS pattern.

## Order lifecycle states

Every order goes through states:

```
new → submitted → accepted → filled / partially_filled / canceled / rejected
```

Other terminal states: expired, replaced. Specific names vary by broker; semantics are similar.

Your bot should track each open order's state and transition through:

```python
from enum import Enum

class OrderState(Enum):
    PENDING_SUBMIT = 'pending_submit'   # bot has decided, hasn't sent
    SUBMITTED = 'submitted'             # sent, awaiting broker ack
    ACCEPTED = 'accepted'               # broker accepted, on book
    PARTIAL = 'partial_fill'            # some shares filled
    FILLED = 'filled'                   # done
    CANCELED = 'canceled'
    REJECTED = 'rejected'
```

## Local order DB

Store orders in your own database (SQLite is enough for retail-scale):

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,           -- broker's ID
  client_id TEXT NOT NULL,       -- your tag
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  qty INTEGER NOT NULL,
  filled_qty INTEGER DEFAULT 0,
  type TEXT NOT NULL,
  limit_price REAL,
  stop_price REAL,
  state TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  strategy TEXT,                 -- which strategy submitted this
  metadata JSON                  -- whatever
);
```

Every order event updates this row. On startup, your bot reconciles with broker state: fetch open orders from broker, compare against DB.

## Positions table

Same pattern:

```sql
CREATE TABLE positions (
  symbol TEXT PRIMARY KEY,
  qty INTEGER NOT NULL,           -- positive = long; negative = short
  avg_entry REAL NOT NULL,
  realized_pl REAL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL,
  strategy TEXT
);
```

When orders fill, update the position row. When positions close, the realized PnL adds.

For multi-strategy bots, each strategy gets its own position tracking; the broker view is the aggregate.

## Reconciliation

The fundamental check: do your books match the broker?

On bot startup, and periodically during the trading day:

```python
def reconcile(broker, db):
    broker_positions = broker.list_positions()
    db_positions = db.list_positions()
    
    for sym, broker_pos in broker_positions.items():
        db_pos = db_positions.get(sym)
        if not db_pos or db_pos.qty != broker_pos.qty:
            alert(f'POSITION MISMATCH: {sym} broker={broker_pos.qty} db={db_pos.qty if db_pos else 0}')
            # Don't auto-correct — investigate
    
    for sym in set(db_positions) - set(broker_positions):
        alert(f'PHANTOM DB POSITION: {sym}')
    
    broker_orders = broker.list_open_orders()
    db_orders = db.list_open_orders()
    
    # Same check for orders
    ...
```

If a mismatch happens, alert loudly. Don't auto-correct — the cause might be a bug that more autocorrection would amplify.

## Handling partial fills

A 100-share order may fill in chunks. Each fill is an event:

```python
def on_fill(event):
    order_id = event.order_id
    fill_qty = event.fill_qty
    fill_price = event.fill_price
    
    with db.transaction():
        order = db.get_order(order_id)
        order.filled_qty += fill_qty
        order.avg_fill_price = recompute_avg(order, fill_qty, fill_price)
        
        if order.filled_qty == order.qty:
            order.state = OrderState.FILLED
        else:
            order.state = OrderState.PARTIAL
        
        db.upsert_position(order.symbol, fill_qty, fill_price, order.side)
        db.save(order)
```

Each event in a transaction. Don't read-modify-write outside one — race conditions cause double-counting.

## Idempotency

Brokers occasionally deliver events twice. Your handler must be idempotent — processing the same event twice should not double the position.

Pattern: deduplicate by event ID.

```python
def on_event(event):
    if db.has_event(event.id):
        return  # already processed
    
    process(event)
    db.save_event(event.id)
```

For Alpaca, every `trade_update` has a unique ID. Same for IBKR's `execId`. Use them.

## Order ID strategy

Brokers assign IDs after they accept the order. Until then, you don't have one. To track an order from submission to fill:

```python
client_order_id = uuid()
order = LimitOrder(..., client_order_id=client_order_id)

# Save BEFORE submitting
db.create_order(client_order_id=client_order_id, broker_id=None, state='PENDING_SUBMIT')

result = broker.submit(order)
db.update_order(client_order_id=client_order_id, broker_id=result.id, state='SUBMITTED')
```

The client_order_id is yours; the broker_id is theirs. Some brokers let you pass your client_order_id at submission so it's the linking key.

If the network dies between submit and ack: you may have an order you don't know about. Reconciliation catches this — broker's view will show the order with your client_order_id, you can re-attach.

## Position sizing on entry

When a strategy says "long AAPL 1% of portfolio", compute size:

```python
def size_position(symbol, target_pct, account, current_price):
    equity = account.equity
    target_value = equity * target_pct
    target_qty = int(target_value / current_price)
    return target_qty
```

For fractional shares (Alpaca, M1, others), use floats. For traditional brokers, round to whole shares.

For risk-based sizing (Kelly, fixed-risk-per-trade), the formula is different — covered in Module 5.

## Closing positions cleanly

Strategy says "exit AAPL". Submit a market or limit:

```python
def close_position(symbol):
    pos = db.get_position(symbol)
    if not pos or pos.qty == 0:
        return
    
    side = 'SELL' if pos.qty > 0 else 'BUY'
    qty = abs(pos.qty)
    
    order = MarketOrder(symbol, qty, side, time_in_force='DAY')
    broker.submit(order)
```

Or use the broker's `close_position(symbol)` helper if available — it computes side/qty for you.

Watch out: if there are open orders for the symbol (e.g., a resting stop), cancel them first to avoid double-trading.

## End-of-day cleanup

Some patterns:

- **Flatten everything at close.** Strategy doesn't hold overnight. Just call `close_all_positions()` at 3:55 PM.
- **Cancel all open orders.** Even GTC orders: if your strategy's state assumes only its own orders, stale orders from yesterday confuse it.
- **Snapshot books.** Save day's PnL, position summary, error log.
- **Generate report.** Daily PnL, top winners/losers, slippage analysis, anomalies.

Automating the EOD routine prevents the slow accumulation of stale state.

## Mistakes to avoid

- **Reading broker state in tight loops.** Use event streams, sync DB once on startup.
- **Trusting bot state as ground truth.** Broker is the source of truth; reconcile.
- **No idempotency.** Duplicate events corrupt positions.
- **Auto-correcting mismatches.** Alert instead — investigate before fixing.
- **Mixing strategies in one position.** Use separate `strategy` tags.

## Summary

- OMS = local DB tracking your view of orders/positions.
- Lifecycle: PENDING → SUBMITTED → ACCEPTED → PARTIAL → FILLED / CANCELED.
- Reconcile against broker periodically; alert on mismatch.
- Event handlers must be idempotent (dedupe by event ID).
- Track orders by your client_order_id, link to broker IDs.
- EOD cleanup keeps state clean.

Next module: strategy design — what edges look like and how to find them.
