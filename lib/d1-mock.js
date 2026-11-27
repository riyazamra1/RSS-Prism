export function createD1Mock() {
  const licenses = new Map();
  const activations = new Map(); // key: `${licenseId}::${siteHash}`
  const orders = new Map();
  const webhookEvents = new Map(); // key: `${provider}::${eventId}`

  function getActivationCount(licenseId) {
    let count = 0;
    for (const act of activations.values()) {
      if (act.license_id === licenseId) count++;
    }
    return count;
  }

  return {
    _tables: { licenses, activations, orders, webhookEvents },
    prepare(sql) {
      let boundArgs = [];
      return {
        bind(...args) {
          boundArgs = args;
          return this;
        },
        async first() {
          if (sql.includes("SELECT id, product_id, status, activation_limit, starts_at, expires_at FROM licenses")) {
            const [keyHash, emailHash, product] = boundArgs;
            for (const lic of licenses.values()) {
              if (
                lic.license_key_hash === keyHash &&
                lic.customer_email_hash === emailHash &&
                lic.product_id === product
              ) {
                return { ...lic };
              }
            }
            return null;
          }
          if (sql.includes("SELECT COUNT(*) AS count FROM activations")) {
            const [licenseId] = boundArgs;
            return { count: getActivationCount(licenseId) };
          }
          if (sql.includes("SELECT 1 AS active FROM activations")) {
            const [licenseId, siteHash] = boundArgs;
            return activations.has(`${licenseId}::${siteHash}`) ? { active: 1 } : null;
          }
          if (sql.includes("FROM orders WHERE id = ?")) {
            const [orderId] = boundArgs;
            const order = orders.get(orderId);
            return order && order.provider === "payments_lk" ? { ...order } : null;
          }
          if (sql.includes("SELECT processing_status FROM payment_webhook_events")) {
            const [eventId] = boundArgs;
            const ev = webhookEvents.get(`payments_lk::${eventId}`);
            return ev ? { processing_status: ev.processing_status } : null;
          }
          if (sql.includes("SELECT expires_at FROM licenses WHERE id = ?")) {
            const [orderId] = boundArgs;
            const lic = licenses.get(orderId);
            return lic ? { expires_at: lic.expires_at } : null;
          }
          return null;
        },
        async run() {
          if (sql.startsWith("INSERT INTO activations")) {
            const [licenseId, siteHash, createdAt, lastSeenAt, _l2, now] = boundArgs;
            const lic = licenses.get(licenseId);
            if (!lic || lic.status !== "active" || (lic.expires_at && lic.expires_at <= now)) {
              return { meta: { changes: 0 } };
            }
            const key = `${licenseId}::${siteHash}`;
            if (activations.has(key)) {
              const existing = activations.get(key);
              existing.last_seen_at = lastSeenAt;
              return { meta: { changes: 1 } };
            }
            if (getActivationCount(licenseId) < Number(lic.activation_limit)) {
              activations.set(key, {
                license_id: licenseId,
                site_hash: siteHash,
                created_at: createdAt,
                last_seen_at: lastSeenAt
              });
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.startsWith("DELETE FROM activations")) {
            const [licenseId, siteHash] = boundArgs;
            const deleted = activations.delete(`${licenseId}::${siteHash}`);
            return { meta: { changes: deleted ? 1 : 0 } };
          }
          if (sql.startsWith("INSERT INTO orders")) {
            const [
              id, customer_email, customer_email_hash, product_id, license_tier,
              activation_limit, amount_minor, terms_version, created_at
            ] = boundArgs;
            orders.set(id, {
              id,
              customer_email,
              customer_email_hash,
              product_id,
              license_tier,
              billing_interval: "annual",
              activation_limit,
              amount_minor,
              currency: "LKR",
              payment_status: "pending",
              provider: "payments_lk",
              provider_session_id: null,
              provider_payment_id: null,
              terms_version,
              created_at,
              paid_at: null
            });
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("UPDATE orders SET provider_session_id")) {
            const [checkoutId, orderId] = boundArgs;
            const order = orders.get(orderId);
            if (order && order.payment_status === "pending") {
              order.provider_session_id = checkoutId;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.startsWith("INSERT INTO payment_webhook_events")) {
            const [eventId, receivedAt] = boundArgs;
            const key = `payments_lk::${eventId}`;
            if (!webhookEvents.has(key)) {
              webhookEvents.set(key, {
                provider: "payments_lk",
                event_id: eventId,
                received_at: receivedAt,
                processed_at: null,
                processing_status: "received"
              });
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.includes("UPDATE payment_webhook_events SET processing_status = 'processing'")) {
            const [eventId] = boundArgs;
            const ev = webhookEvents.get(`payments_lk::${eventId}`);
            if (ev && (ev.processing_status === "received" || ev.processing_status === "failed")) {
              ev.processing_status = "processing";
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.includes("UPDATE orders SET payment_status = 'paid'")) {
            const [providerPaymentId, now, orderId] = boundArgs;
            const order = orders.get(orderId);
            if (order && (order.payment_status === "pending" || order.payment_status === "paid")) {
              order.payment_status = "paid";
              order.provider_payment_id = providerPaymentId;
              order.paid_at = order.paid_at || now;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.startsWith("INSERT INTO licenses")) {
            const [
              id, license_key_hash, customer_email_hash, product_id, license_tier,
              activation_limit, starts_at, expires_at, created_at, updated_at
            ] = boundArgs;
            if (!licenses.has(id)) {
              licenses.set(id, {
                id,
                license_key_hash,
                customer_email_hash,
                product_id,
                license_tier,
                activation_limit,
                status: "active",
                starts_at,
                expires_at,
                created_at,
                updated_at
              });
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.includes("UPDATE payment_webhook_events SET processing_status = 'processed'")) {
            const [processedAt, eventId] = boundArgs;
            const ev = webhookEvents.get(`payments_lk::${eventId}`);
            if (ev) {
              ev.processing_status = "processed";
              ev.processed_at = processedAt;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.includes("UPDATE payment_webhook_events SET processing_status = 'failed'")) {
            const [eventId] = boundArgs;
            const ev = webhookEvents.get(`payments_lk::${eventId}`);
            if (ev && ev.processing_status === "processing") {
              ev.processing_status = "failed";
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          return { meta: { changes: 0 } };
        }
      };
    }
  };
}
