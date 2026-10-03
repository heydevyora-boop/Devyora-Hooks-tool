-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO', 'PDF', 'DOCUMENT', 'SCREENSHOT', 'AUDIO');

-- CreateEnum
CREATE TYPE "ContentSourceType" AS ENUM ('INSTAGRAM_URL', 'YOUTUBE_URL', 'WEBSITE_URL', 'OTHER_URL', 'IMAGE', 'VIDEO', 'SCREENSHOT', 'PDF', 'TEXT', 'SPEECH');

-- CreateEnum
CREATE TYPE "ContentSourceStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'ERROR');

-- CreateEnum
CREATE TYPE "ContentHistoryFormat" AS ENUM ('REEL', 'CAROUSEL', 'STATIC', 'STORY', 'VIDEO');

-- CreateEnum
CREATE TYPE "ContentHistoryStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "ContentHistorySource" AS ENUM ('MANUAL', 'INSTAGRAM_SYNC', 'GENERATED');

-- CreateEnum
CREATE TYPE "PerformanceSource" AS ENUM ('INSTAGRAM_SYNC', 'MANUAL');

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "seat_limit" INTEGER NOT NULL DEFAULT 5,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "ip_address" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_profiles" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "brand_name" TEXT,
    "voice_description" TEXT,
    "tone_notes" TEXT,
    "banned_phrases" JSONB NOT NULL DEFAULT '[]',
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "features" JSONB NOT NULL DEFAULT '[]',
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "applications" JSONB NOT NULL DEFAULT '[]',
    "selling_points" JSONB NOT NULL DEFAULT '[]',
    "target_audience" TEXT NOT NULL DEFAULT '',
    "limitations" JSONB NOT NULL DEFAULT '[]',
    "content_angles" JSONB NOT NULL DEFAULT '[]',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "uploaded_by" TEXT,
    "storage_key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "original_filename" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_sources" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "type" "ContentSourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "media_asset_id" TEXT,
    "status" "ContentSourceStatus" NOT NULL DEFAULT 'PENDING',
    "extracted_content" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "processing_error" TEXT,
    "added_by" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_history" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "product_id" TEXT,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT '',
    "format" "ContentHistoryFormat" NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "published_date" TIMESTAMP(3) NOT NULL,
    "hook" TEXT,
    "status" "ContentHistoryStatus" NOT NULL DEFAULT 'DRAFT',
    "source" "ContentHistorySource" NOT NULL DEFAULT 'MANUAL',
    "performance_label" TEXT,
    "engagement_summary" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_performance" (
    "id" TEXT NOT NULL,
    "content_history_id" TEXT NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER,
    "likes" INTEGER,
    "shares" INTEGER,
    "comments" INTEGER,
    "saves" INTEGER,
    "engagement_rate" DOUBLE PRECISION,
    "hold_rate_3s" DOUBLE PRECISION,
    "source" "PerformanceSource" NOT NULL DEFAULT 'MANUAL',

    CONSTRAINT "content_performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_workspace_id_idx" ON "users"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_workspace_id_username_key" ON "users"("workspace_id", "username");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "brand_profiles_workspace_id_key" ON "brand_profiles"("workspace_id");

-- CreateIndex
CREATE INDEX "products_workspace_id_idx" ON "products"("workspace_id");

-- CreateIndex
CREATE INDEX "products_workspace_id_name_idx" ON "products"("workspace_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_key_key" ON "media_assets"("storage_key");

-- CreateIndex
CREATE INDEX "media_assets_workspace_id_idx" ON "media_assets"("workspace_id");

-- CreateIndex
CREATE INDEX "content_sources_workspace_id_idx" ON "content_sources"("workspace_id");

-- CreateIndex
CREATE INDEX "content_sources_workspace_id_type_idx" ON "content_sources"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "content_sources_workspace_id_status_idx" ON "content_sources"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "content_history_workspace_id_idx" ON "content_history"("workspace_id");

-- CreateIndex
CREATE INDEX "content_history_workspace_id_product_id_idx" ON "content_history"("workspace_id", "product_id");

-- CreateIndex
CREATE INDEX "content_history_workspace_id_published_date_idx" ON "content_history"("workspace_id", "published_date");

-- CreateIndex
CREATE INDEX "content_history_workspace_id_status_idx" ON "content_history"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "content_performance_content_history_id_captured_at_idx" ON "content_performance"("content_history_id", "captured_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_history" ADD CONSTRAINT "content_history_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_history" ADD CONSTRAINT "content_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_history" ADD CONSTRAINT "content_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_performance" ADD CONSTRAINT "content_performance_content_history_id_fkey" FOREIGN KEY ("content_history_id") REFERENCES "content_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;
