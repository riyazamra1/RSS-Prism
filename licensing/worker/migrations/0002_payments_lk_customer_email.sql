-- Required by the Payments.lk webhook to email the licence to the purchaser.
-- Existing orders remain NULL; only new checkout orders are eligible for payment fulfilment.
ALTER TABLE orders ADD COLUMN customer_email TEXT;
