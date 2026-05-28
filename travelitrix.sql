-- ============================================================
--  travelitrix.sql — TRAVELITRIX Database Schema
--  Web Development Fundamentals | A.Y. 2025-2026
--
--  HOW TO USE (XAMPP):
--  1. Open phpMyAdmin → http://localhost/phpmyadmin
--  2. Click "Import" tab → Choose this file → Click "Go"
--
--  If you already imported the old version, run this instead
--  in phpMyAdmin's SQL tab:
--    DROP DATABASE IF EXISTS travelitrix;
--  Then re-import this file.
-- ============================================================

CREATE DATABASE IF NOT EXISTS travelitrix
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE travelitrix;

DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name           VARCHAR(150)     NOT NULL,
  email          VARCHAR(254)     NOT NULL,
  address        VARCHAR(300)     NOT NULL,
  quantity       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price     DECIMAL(10,2)    NOT NULL DEFAULT 9999.00,
  total_price    DECIMAL(12,2)    NOT NULL,
  payment_method VARCHAR(80)      NOT NULL,
  notes          TEXT,
  status         ENUM('pending','confirmed','shipped','delivered','cancelled')
                                  NOT NULL DEFAULT 'pending',
  created_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email  (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional sample rows
INSERT INTO orders (name, email, address, quantity, unit_price, total_price, payment_method, notes)
VALUES
  ('Juan dela Cruz', 'juan@example.com', '123 Rizal Ave, Manila, PH',    1, 9999.00,  9999.00, 'Credit Card',    'Engrave OPERATIVE #001 on bezel.'),
  ('Maria Santos',   'maria@example.com','456 Mabini St, Cebu City, PH', 2, 9999.00, 19998.00, 'Cryptocurrency', NULL);
