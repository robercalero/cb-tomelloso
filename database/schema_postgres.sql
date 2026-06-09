-- ============================================================
-- ESQUEMA COMPLETO — CB TOMELLOSO
-- PostgreSQL
-- ============================================================

-- Limpieza previa de tablas y tipos
DROP TABLE IF EXISTS "members" CASCADE;
DROP TABLE IF EXISTS "contact_messages" CASCADE;
DROP TABLE IF EXISTS "activities" CASCADE;
DROP TABLE IF EXISTS "gallery" CASCADE;
DROP TABLE IF EXISTS "sponsors" CASCADE;
DROP TABLE IF EXISTS "news" CASCADE;
DROP TABLE IF EXISTS "matches" CASCADE;
DROP TABLE IF EXISTS "players" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

DROP TYPE IF EXISTS member_type CASCADE;
DROP TYPE IF EXISTS contact_subject CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS media_type CASCADE;
DROP TYPE IF EXISTS sponsor_tier CASCADE;
DROP TYPE IF EXISTS news_source CASCADE;
DROP TYPE IF EXISTS news_category CASCADE;
DROP TYPE IF EXISTS match_status CASCADE;
DROP TYPE IF EXISTS player_position CASCADE;
DROP TYPE IF EXISTS team_category CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Creación de Tipos ENUM para PostgreSQL
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'socio', 'visitante');
CREATE TYPE team_category AS ENUM ('Senior Autonómica', 'Senior Zonal', 'Júnior', 'Cadete', 'Infantil', 'Alevín', 'Benjamín', 'Minibasket');
CREATE TYPE player_position AS ENUM ('Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled');
CREATE TYPE news_category AS ENUM ('resultado', 'club', 'cantera', 'evento', 'general');
CREATE TYPE news_source AS ENUM ('instagram', 'twitter', 'facebook', 'youtube', 'web');
CREATE TYPE sponsor_tier AS ENUM ('principal', 'oro', 'plata', 'bronce');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE activity_type AS ENUM ('torneo', 'escuela', 'evento', 'copa', 'amistoso', 'otro');
CREATE TYPE contact_subject AS ENUM ('general', 'socio', 'patrocinio', 'prensa', 'otro');
CREATE TYPE member_type AS ENUM ('adulto', 'juvenil', 'familia', 'honorario');

-- -----------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------
CREATE TABLE "users" (
  "id"              SERIAL          PRIMARY KEY,
  "email"           VARCHAR(255)    NOT NULL UNIQUE,
  "password_hash"   VARCHAR(255)    NOT NULL,
  "name"            VARCHAR(100)    NOT NULL,
  "role"            user_role       NOT NULL DEFAULT 'visitante',
  "avatar_url"      VARCHAR(500)    NULL,
  "is_active"       BOOLEAN         NOT NULL DEFAULT TRUE,
  "refresh_token"   VARCHAR(500)    NULL,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 2. teams
-- -----------------------------------------------------------
CREATE TABLE "teams" (
  "id"              SERIAL          PRIMARY KEY,
  "name"            VARCHAR(100)    NOT NULL,
  "category"        team_category   NOT NULL,
  "season"          VARCHAR(10)     NOT NULL,
  "coach"           VARCHAR(100)    NULL,
  "assistant_coach" VARCHAR(100)    NULL,
  "photo_url"       VARCHAR(500)    NULL,
  "is_active"       BOOLEAN         NOT NULL DEFAULT TRUE,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 3. players
-- -----------------------------------------------------------
CREATE TABLE "players" (
  "id"              SERIAL          PRIMARY KEY,
  "team_id"         INTEGER         NOT NULL,
  "name"            VARCHAR(100)    NOT NULL,
  "surname"         VARCHAR(100)    NOT NULL,
  "dorsal"          SMALLINT        NULL,
  "position"        player_position NULL,
  "nationality"     VARCHAR(60)     NOT NULL DEFAULT 'España',
  "birth_year"      SMALLINT        NULL,
  "height_cm"       SMALLINT        NULL,
  "photo_url"       VARCHAR(500)    NULL,
  "is_active"       BOOLEAN         NOT NULL DEFAULT TRUE,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "uq_player_dorsal_team" UNIQUE ("team_id", "dorsal"),
  CONSTRAINT "fk_players_team" FOREIGN KEY ("team_id")
    REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------------
-- 4. matches
-- -----------------------------------------------------------
CREATE TABLE "matches" (
  "id"              SERIAL          PRIMARY KEY,
  "team_id"         INTEGER         NOT NULL,
  "home_team"       VARCHAR(100)    NOT NULL,
  "away_team"       VARCHAR(100)    NOT NULL,
  "home_team_logo"  VARCHAR(500)    NULL,
  "away_team_logo"  VARCHAR(500)    NULL,
  "match_date"      DATE            NOT NULL,
  "match_time"      TIME            NOT NULL,
  "competition"     VARCHAR(100)    NOT NULL,
  "venue"           VARCHAR(200)    NOT NULL,
  "is_home"         BOOLEAN         NOT NULL DEFAULT TRUE,
  "score_home"      SMALLINT        NULL,
  "score_away"      SMALLINT        NULL,
  "status"          match_status    NOT NULL DEFAULT 'scheduled',
  "notes"           TEXT            NULL,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_matches_team" FOREIGN KEY ("team_id")
    REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------------
-- 5. news
-- -----------------------------------------------------------
CREATE TABLE "news" (
  "id"              SERIAL          PRIMARY KEY,
  "author_id"       INTEGER         NULL,
  "title"           VARCHAR(255)    NOT NULL,
  "slug"            VARCHAR(255)    NOT NULL UNIQUE,
  "excerpt"         VARCHAR(500)    NOT NULL,
  "content"         TEXT            NOT NULL,
  "category"        news_category   NOT NULL DEFAULT 'general',
  "image_url"       VARCHAR(500)    NULL,
  "is_published"    BOOLEAN         NOT NULL DEFAULT FALSE,
  "published_at"    TIMESTAMP       NULL,
  "views"           INTEGER         NOT NULL DEFAULT 0,
  "source"          news_source     NULL,
  "source_url"      VARCHAR(500)    NULL,
  "media"           JSONB           NULL,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_news_author" FOREIGN KEY ("author_id")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- -----------------------------------------------------------
-- 6. sponsors
-- -----------------------------------------------------------
CREATE TABLE "sponsors" (
  "id"              SERIAL          PRIMARY KEY,
  "name"            VARCHAR(100)    NOT NULL,
  "logo_url"        VARCHAR(500)    NOT NULL,
  "website_url"     VARCHAR(500)    NULL,
  "tier"            sponsor_tier    NOT NULL DEFAULT 'bronce',
  "description"     TEXT            NULL,
  "contact_name"    VARCHAR(100)    NULL,
  "contact_email"   VARCHAR(255)    NULL,
  "is_active"       BOOLEAN         NOT NULL DEFAULT TRUE,
  "sort_order"      SMALLINT        NOT NULL DEFAULT 99,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 7. gallery
-- -----------------------------------------------------------
CREATE TABLE "gallery" (
  "id"              SERIAL          PRIMARY KEY,
  "team_id"         INTEGER         NULL,
  "title"           VARCHAR(255)    NULL,
  "media_type"      media_type      NOT NULL DEFAULT 'image',
  "url"             VARCHAR(500)    NOT NULL,
  "thumbnail_url"   VARCHAR(500)    NULL,
  "season"          VARCHAR(10)     NULL,
  "event_name"      VARCHAR(100)    NULL,
  "taken_at"        DATE            NULL,
  "is_published"    BOOLEAN         NOT NULL DEFAULT TRUE,
  "sort_order"      SMALLINT        NOT NULL DEFAULT 99,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_gallery_team" FOREIGN KEY ("team_id")
    REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- -----------------------------------------------------------
-- 8. activities
-- -----------------------------------------------------------
CREATE TABLE "activities" (
  "id"              SERIAL          PRIMARY KEY,
  "title"           VARCHAR(255)    NOT NULL,
  "description"     TEXT            NULL,
  "activity_type"   activity_type   NOT NULL DEFAULT 'otro',
  "start_date"      DATE            NOT NULL,
  "end_date"        DATE            NULL,
  "venue"           VARCHAR(200)    NULL,
  "image_url"       VARCHAR(500)    NULL,
  "is_published"    BOOLEAN         NOT NULL DEFAULT TRUE,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 9. contact_messages
-- -----------------------------------------------------------
CREATE TABLE "contact_messages" (
  "id"              SERIAL          PRIMARY KEY,
  "name"            VARCHAR(100)    NOT NULL,
  "email"           VARCHAR(255)    NOT NULL,
  "subject"         contact_subject NOT NULL DEFAULT 'general',
  "message"         TEXT            NOT NULL,
  "ip_address"      VARCHAR(45)     NULL,
  "is_read"         BOOLEAN         NOT NULL DEFAULT FALSE,
  "replied_at"      TIMESTAMP       NULL,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 10. members
-- -----------------------------------------------------------
CREATE TABLE "members" (
  "id"              SERIAL          PRIMARY KEY,
  "user_id"         INTEGER         NULL,
  "name"            VARCHAR(100)    NOT NULL,
  "email"           VARCHAR(255)    NOT NULL,
  "phone"           VARCHAR(20)     NULL,
  "member_type"     member_type     NOT NULL DEFAULT 'adulto',
  "member_number"   VARCHAR(20)     NULL UNIQUE,
  "joined_at"       DATE            NOT NULL,
  "is_active"       BOOLEAN         NOT NULL DEFAULT TRUE,
  "created_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_members_user" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- -----------------------------------------------------------
-- Índices para optimización de consultas
-- -----------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_teams_category ON teams(category);
CREATE INDEX idx_teams_season ON teams(season);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_matches_team ON matches(team_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_sponsors_tier ON sponsors(tier);
CREATE INDEX idx_sponsors_active ON sponsors(is_active);
CREATE INDEX idx_gallery_team ON gallery(team_id);
CREATE INDEX idx_gallery_season ON gallery(season);
CREATE INDEX idx_gallery_type ON gallery(media_type);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_date ON activities(start_date);
CREATE INDEX idx_contact_read ON contact_messages(is_read);
CREATE INDEX idx_contact_subject ON contact_messages(subject);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_active ON members(is_active);
