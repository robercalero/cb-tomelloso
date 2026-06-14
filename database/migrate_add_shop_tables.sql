-- ============================================================
-- MIGRACIÓN: Añadir tablas de tienda a BBDD existente
-- CB TOMELLOSO — MySQL 8 (Aiven Cloud)
--
-- Ejecutar SOLO en producción, una sola vez.
-- Todas las tablas usan IF NOT EXISTS, es seguro re-ejecutar.
-- ============================================================

USE `cbtomelloso`;

-- -----------------------------------------------------------
-- 1. product_categories
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100)    NOT NULL,
  `slug`            VARCHAR(100)    NOT NULL UNIQUE,
  `description`     TEXT            NULL,
  `image_url`       VARCHAR(500)    NULL,
  `sort_order`      SMALLINT UNSIGNED NOT NULL DEFAULT 99,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. products
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `category_id`     INT UNSIGNED    NULL,
  `name`            VARCHAR(200)    NOT NULL,
  `slug`            VARCHAR(200)    NOT NULL UNIQUE,
  `description`     TEXT            NULL,
  `price`           DECIMAL(8,2)    NOT NULL,
  `compare_price`   DECIMAL(8,2)    NULL,
  `images`          JSON            NULL,
  `sizes`           JSON            NULL,
  `colors`          JSON            NULL,
  `stock`           INT UNSIGNED    NOT NULL DEFAULT 0,
  `sku`             VARCHAR(100)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `is_featured`     TINYINT(1)      NOT NULL DEFAULT 0,
  `season`          VARCHAR(10)     NULL,
  `tags`            JSON            NULL,
  `stripe_price_id` VARCHAR(100)    NULL,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_active` (`is_active`),
  INDEX `idx_products_featured` (`is_featured`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`)
    REFERENCES `product_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. cart_items
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `session_id`      VARCHAR(100)    NOT NULL,
  `user_id`         INT UNSIGNED    NULL,
  `product_id`      INT UNSIGNED    NOT NULL,
  `quantity`        SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `size`            VARCHAR(10)     NULL,
  `color`           VARCHAR(50)     NULL,
  `added_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_item_session_product_variant` (`session_id`, `product_id`, `size`, `color`),
  INDEX `idx_cart_session` (`session_id`),
  INDEX `idx_cart_user` (`user_id`),
  INDEX `idx_cart_product` (`product_id`),
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`)
    REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. orders
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id`                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `order_number`        VARCHAR(20)     NOT NULL UNIQUE,
  `user_id`             INT UNSIGNED    NULL,
  `session_id`          VARCHAR(100)    NULL,
  `status`              ENUM('pending','paid','processing','shipped','delivered','cancelled','refunded')
                        NOT NULL DEFAULT 'pending',
  `total_amount`        DECIMAL(10,2)   NOT NULL,
  `shipping_name`       VARCHAR(100)    NOT NULL,
  `shipping_email`      VARCHAR(255)    NOT NULL,
  `shipping_phone`      VARCHAR(20)     NULL,
  `shipping_address`    VARCHAR(300)    NOT NULL,
  `shipping_city`       VARCHAR(100)    NOT NULL,
  `shipping_postal_code` VARCHAR(10)    NOT NULL,
  `shipping_country`    VARCHAR(60)     NOT NULL DEFAULT 'España',
  `notes`               TEXT            NULL,
  `stripe_session_id`   VARCHAR(200)    NULL,
  `stripe_payment_intent` VARCHAR(200)  NULL,
  `paid_at`             TIMESTAMP       NULL,
  `shipped_at`          TIMESTAMP       NULL,
  `created_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_stripe_session` (`stripe_session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. order_items
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `order_id`        INT UNSIGNED    NOT NULL,
  `product_id`      INT UNSIGNED    NULL,
  `product_name`    VARCHAR(200)    NOT NULL,
  `product_sku`     VARCHAR(100)    NULL,
  `size`            VARCHAR(10)     NULL,
  `color`           VARCHAR(50)     NULL,
  `quantity`        SMALLINT UNSIGNED NOT NULL,
  `unit_price`      DECIMAL(8,2)    NOT NULL,
  `subtotal`        DECIMAL(10,2)   NOT NULL,
  `image_url`       VARCHAR(500)    NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`)
    REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. product_reviews
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `product_id`      INT UNSIGNED    NOT NULL,
  `user_id`         INT UNSIGNED    NULL,
  `rating`          TINYINT UNSIGNED NOT NULL,
  `comment`         TEXT            NULL,
  `is_approved`     TINYINT(1)      NOT NULL DEFAULT 0,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reviews_product` (`product_id`),
  INDEX `idx_reviews_approved` (`is_approved`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`)
    REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- VERIFICACIÓN
-- -----------------------------------------------------------
SELECT '✅ Migración completada' AS resultado;
SELECT COUNT(*) AS total_tablas_shop
FROM information_schema.tables
WHERE table_schema = 'cbtomelloso'
  AND table_name IN ('product_categories','products','cart_items','orders','order_items','product_reviews');
