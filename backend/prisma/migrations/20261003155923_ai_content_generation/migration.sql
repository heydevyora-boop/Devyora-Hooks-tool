-- CreateEnum
CREATE TYPE "ApprovalStage" AS ENUM ('DRAFT', 'GENERATED', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RegenerationReasonOrigin" AS ENUM ('TEXT', 'SPEECH');

-- CreateTable
CREATE TABLE "generated_content" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "flowchart_node_id" TEXT,
    "strategy_id" TEXT,
    "product_id" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "topic" TEXT NOT NULL,
    "grid_position" INTEGER,
    "date_label" TEXT,
    "user_instructions" TEXT,
    "context_sources_used" JSONB NOT NULL DEFAULT '[]',
    "stage" "ApprovalStage" NOT NULL DEFAULT 'GENERATED',
    "rejection_reason" TEXT,
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "published_by" TEXT,
    "published_at" TIMESTAMP(3),
    "content_history_id" TEXT,
    "generated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_content_versions" (
    "id" TEXT NOT NULL,
    "generated_content_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "parent_version_id" TEXT,
    "hook" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "hooks" JSONB NOT NULL DEFAULT '[]',
    "scenes" JSONB NOT NULL DEFAULT '[]',
    "visual_direction" JSONB NOT NULL DEFAULT '[]',
    "broll_plan" JSONB NOT NULL DEFAULT '[]',
    "on_screen_text" JSONB NOT NULL DEFAULT '[]',
    "cta" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "similarity_warnings" JSONB NOT NULL DEFAULT '[]',
    "regeneration_reason" TEXT,
    "regeneration_reason_origin" "RegenerationReasonOrigin",
    "regeneration_target" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_blueprint_scores" (
    "id" TEXT NOT NULL,
    "generated_content_version_id" TEXT NOT NULL,
    "virality_potential" INTEGER NOT NULL,
    "tier_label" TEXT NOT NULL,
    "tier_badge" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "hook_strength" INTEGER NOT NULL,
    "retention_potential" INTEGER NOT NULL,
    "specificity" INTEGER NOT NULL,
    "authority" INTEGER NOT NULL,
    "brand_fit" INTEGER NOT NULL,
    "natural_speech" INTEGER NOT NULL,
    "cta_clarity" INTEGER NOT NULL,
    "visual_potential" INTEGER NOT NULL,
    "generic_ai_score" INTEGER NOT NULL,
    "virality_metric_label" TEXT NOT NULL,
    "virality_threshold" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_blueprint_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virality_configs" (
    "workspace_id" TEXT NOT NULL,
    "metric_label" TEXT NOT NULL DEFAULT 'Organic Views',
    "threshold" INTEGER NOT NULL DEFAULT 50000,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virality_configs_pkey" PRIMARY KEY ("workspace_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generated_content_flowchart_node_id_key" ON "generated_content"("flowchart_node_id");

-- CreateIndex
CREATE UNIQUE INDEX "generated_content_content_history_id_key" ON "generated_content"("content_history_id");

-- CreateIndex
CREATE INDEX "generated_content_workspace_id_idx" ON "generated_content"("workspace_id");

-- CreateIndex
CREATE INDEX "generated_content_workspace_id_stage_idx" ON "generated_content"("workspace_id", "stage");

-- CreateIndex
CREATE INDEX "generated_content_versions_generated_content_id_idx" ON "generated_content_versions"("generated_content_id");

-- CreateIndex
CREATE UNIQUE INDEX "generated_content_versions_generated_content_id_version_key" ON "generated_content_versions"("generated_content_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "video_blueprint_scores_generated_content_version_id_key" ON "video_blueprint_scores"("generated_content_version_id");

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_flowchart_node_id_fkey" FOREIGN KEY ("flowchart_node_id") REFERENCES "flowchart_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "content_strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_content_history_id_fkey" FOREIGN KEY ("content_history_id") REFERENCES "content_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content_versions" ADD CONSTRAINT "generated_content_versions_generated_content_id_fkey" FOREIGN KEY ("generated_content_id") REFERENCES "generated_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content_versions" ADD CONSTRAINT "generated_content_versions_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "generated_content_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_content_versions" ADD CONSTRAINT "generated_content_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_blueprint_scores" ADD CONSTRAINT "video_blueprint_scores_generated_content_version_id_fkey" FOREIGN KEY ("generated_content_version_id") REFERENCES "generated_content_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virality_configs" ADD CONSTRAINT "virality_configs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virality_configs" ADD CONSTRAINT "virality_configs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
