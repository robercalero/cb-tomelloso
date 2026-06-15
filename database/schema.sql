-- ============================================================
-- ESQUEMA COMPLETO — CB TOMELLOSO
-- MariaDB / MySQL
-- Ejecutar en HeidiSQL o por CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS `cbtomelloso`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'cbtomelloso_user'@'localhost'
  IDENTIFIED BY 'CbTom2025!Secure';

GRANT ALL PRIVILEGES ON `cbtomelloso`.* TO 'cbtomelloso_user'@'localhost';
FLUSH PRIVILEGES;

USE cbtomelloso;

-- -----------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `email`           VARCHAR(255)    NOT NULL UNIQUE,
  `password_hash`   VARCHAR(255)    NOT NULL,
  `name`            VARCHAR(100)    NOT NULL,
  `role`            ENUM('admin','editor','socio','visitante') NOT NULL DEFAULT 'visitante',
  `avatar_url`      VARCHAR(500)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `refresh_token`   VARCHAR(500)    NULL,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. teams
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teams` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100)    NOT NULL,
        `category`        ENUM(
                      'Senior Autonómica',
                      'Senior Zonal',
                      'Júnior',
                      'Junior U19',
                      'Cadete',
                      'Infantil',
                      'Alevín',
                      'Benjamín',
                      'Minibasket'
                    ) NOT NULL,
  `season`          VARCHAR(10)     NOT NULL,
  `coach`           VARCHAR(100)    NULL,
  `assistant_coach` VARCHAR(100)    NULL,
  `photo_url`       VARCHAR(500)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_teams_category` (`category`),
  INDEX `idx_teams_season` (`season`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. players
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `players` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `team_id`         INT UNSIGNED    NOT NULL,
  `name`            VARCHAR(100)    NOT NULL,
  `surname`         VARCHAR(100)    NOT NULL,
  `dorsal`          TINYINT UNSIGNED NULL,
  `position`        ENUM('Base','Escolta','Alero','Ala-Pívot','Pívot') NULL,
  `nationality`     VARCHAR(60)     NOT NULL DEFAULT 'España',
  `birth_year`      YEAR            NULL,
  `height_cm`       SMALLINT UNSIGNED NULL,
  `photo_url`       VARCHAR(500)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_player_dorsal_team` (`team_id`, `dorsal`),
  INDEX `idx_players_team` (`team_id`),
  CONSTRAINT `fk_players_team` FOREIGN KEY (`team_id`)
    REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. matches
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `matches` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `team_id`         INT UNSIGNED    NOT NULL,
  `home_team`       VARCHAR(100)    NOT NULL,
  `away_team`       VARCHAR(100)    NOT NULL,
  `home_team_logo`  VARCHAR(500)    NULL,
  `away_team_logo`  VARCHAR(500)    NULL,
  `match_date`      DATE            NOT NULL,
  `match_time`      TIME            NOT NULL,
  `competition`     VARCHAR(100)    NOT NULL,
  `venue`           VARCHAR(200)    NOT NULL,
  `is_home`         TINYINT(1)      NOT NULL DEFAULT 1,
  `score_home`      TINYINT UNSIGNED NULL,
  `score_away`      TINYINT UNSIGNED NULL,
  `status`          ENUM('scheduled','live','finished','postponed','cancelled')
                    NOT NULL DEFAULT 'scheduled',
  `notes`           TEXT            NULL,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_matches_team` (`team_id`),
  INDEX `idx_matches_date` (`match_date`),
  INDEX `idx_matches_status` (`status`),
  CONSTRAINT `fk_matches_team` FOREIGN KEY (`team_id`)
    REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. news
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `author_id`       INT UNSIGNED    NULL,
  `title`           VARCHAR(255)    NOT NULL,
  `slug`            VARCHAR(255)    NOT NULL UNIQUE,
  `excerpt`         VARCHAR(500)    NOT NULL,
  `content`         LONGTEXT        NOT NULL,
  `category`        ENUM('resultado','club','cantera','evento','general')
                    NOT NULL DEFAULT 'general',
  `image_url`       TEXT            NULL,
  `is_published`    TINYINT(1)      NOT NULL DEFAULT 0,
  `published_at`    TIMESTAMP       NULL,
  `views`           INT UNSIGNED    NOT NULL DEFAULT 0,
  `source`          ENUM('instagram','twitter','facebook','youtube','web') NULL,
  `source_url`      VARCHAR(500)    NULL,
  `media`           JSON            NULL,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_news_slug` (`slug`),
  INDEX `idx_news_category` (`category`),
  INDEX `idx_news_published` (`is_published`, `published_at`),
  FULLTEXT INDEX `ft_news_search` (`title`, `excerpt`, `content`),
  CONSTRAINT `fk_news_author` FOREIGN KEY (`author_id`)
    REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. sponsors
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sponsors` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100)    NOT NULL,
  `logo_url`        VARCHAR(500)    NOT NULL,
  `website_url`     VARCHAR(500)    NULL,
  `tier`            ENUM('principal','oro','plata','bronce')
                    NOT NULL DEFAULT 'bronce',
  `description`     TEXT            NULL,
  `contact_name`    VARCHAR(100)    NULL,
  `contact_email`   VARCHAR(255)    NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `sort_order`      TINYINT UNSIGNED NOT NULL DEFAULT 99,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sponsors_tier` (`tier`),
  INDEX `idx_sponsors_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 7. gallery
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `team_id`         INT UNSIGNED    NULL,
  `title`           VARCHAR(255)    NULL,
  `media_type`      ENUM('image','video') NOT NULL DEFAULT 'image',
  `url`             VARCHAR(500)    NOT NULL,
  `thumbnail_url`   VARCHAR(500)    NULL,
  `season`          VARCHAR(10)     NULL,
  `event_name`      VARCHAR(100)    NULL,
  `taken_at`        DATE            NULL,
  `is_published`    TINYINT(1)      NOT NULL DEFAULT 1,
  `sort_order`      SMALLINT UNSIGNED NOT NULL DEFAULT 99,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_gallery_team` (`team_id`),
  INDEX `idx_gallery_season` (`season`),
  INDEX `idx_gallery_type` (`media_type`),
  CONSTRAINT `fk_gallery_team` FOREIGN KEY (`team_id`)
    REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 8. activities
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `title`           VARCHAR(255)    NOT NULL,
  `description`     TEXT            NULL,
  `activity_type`   ENUM('torneo','escuela','evento','copa','amistoso','otro')
                    NOT NULL DEFAULT 'otro',
  `start_date`      DATE            NOT NULL,
  `end_date`        DATE            NULL,
  `venue`           VARCHAR(200)    NULL,
  `image_url`       VARCHAR(500)    NULL,
  `is_published`    TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_activities_type` (`activity_type`),
  INDEX `idx_activities_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 9. contact_messages
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100)    NOT NULL,
  `email`           VARCHAR(255)    NOT NULL,
  `subject`         ENUM('general','socio','patrocinio','prensa','otro')
                    NOT NULL DEFAULT 'general',
  `message`         TEXT            NOT NULL,
  `ip_address`      VARCHAR(45)     NULL,
  `is_read`         TINYINT(1)      NOT NULL DEFAULT 0,
  `replied_at`      TIMESTAMP       NULL,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_contact_read` (`is_read`),
  INDEX `idx_contact_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 10. members
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `members` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED    NULL,
  `name`            VARCHAR(100)    NOT NULL,
  `email`           VARCHAR(255)    NOT NULL,
  `phone`           VARCHAR(20)     NULL,
  `member_type`     ENUM('adulto','juvenil','familia','honorario')
                    NOT NULL DEFAULT 'adulto',
  `member_number`   VARCHAR(20)     NULL UNIQUE,
  `joined_at`       DATE            NOT NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_members_email` (`email`),
  INDEX `idx_members_active` (`is_active`),
  CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 11. product_categories
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
-- 12. products
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
-- 13. cart_items
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
-- 14. orders
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
-- 15. order_items
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
-- 16. product_reviews
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
-- Migraciones para BD existentes (ejecutar solo una vez)
-- -----------------------------------------------------------

-- 2026-06-13: Evitar duplicados en carrito por variante
-- ALTER TABLE `cart_items`
--   ADD UNIQUE KEY `uq_cart_item_session_product_variant` (`session_id`, `product_id`, `size`(10), `color`(50));

-- -----------------------------------------------------------
-- FUTURO: Stock por variante (talla/color)
-- Cuando se necesite trackear stock individual por variante,
-- descomentar y ejecutar:
--
-- CREATE TABLE IF NOT EXISTS `product_variants` (
--   `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
--   `product_id`      INT UNSIGNED    NOT NULL,
--   `size`            VARCHAR(10)     NULL,
--   `color_name`      VARCHAR(50)     NULL,
--   `color_hex`       VARCHAR(7)      NULL,
--   `sku`             VARCHAR(100)    NULL,
--   `stock`           INT UNSIGNED    NOT NULL DEFAULT 0,
--   `price_override`  DECIMAL(8,2)    NULL,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `uq_product_variant` (`product_id`, `size`, `color_name`),
--   CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`)
--     REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--
-- Luego añadir `variant_id` nullable en `cart_items` y `order_items`,
-- y migrar el stock del producto a la suma de variantes.
