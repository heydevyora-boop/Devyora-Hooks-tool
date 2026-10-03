-- CreateEnum
CREATE TYPE "InstagramConnectionStatus" AS ENUM ('NOT_CONNECTED', 'CONNECTING', 'CONNECTED', 'SYNCING', 'ERROR');

-- CreateEnum
CREATE TYPE "InstagramMediaType" AS ENUM ('REEL', 'CAROUSEL', 'STATIC', 'STORY');

-- CreateEnum
CREATE TYPE "GridSlotContentType" AS ENUM ('REEL', 'CAROUSEL', 'STATIC', 'STORY', 'EMPTY');

-- CreateEnum
CREATE TYPE "ApprovalTargetType" AS ENUM ('PRODUCT', 'GRID_TEMPLATE', 'INSPIRATION');

-- CreateEnum
CREATE TYPE "ApprovalResolution" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StrategyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FlowNodeType" AS ENUM ('START', 'ANALYSIS', 'GAP', 'CONTENT', 'DECISION', 'END');

-- CreateEnum
CREATE TYPE "FlowNodeStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "FlowNodePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FlowNodeEffort" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FlowNodeBranch" AS ENUM ('YES', 'NO');

-- CreateTable
CREATE TABLE "instagram_connections" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "status" "InstagramConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "handle" TEXT,
    "external_account_id" TEXT,
    "access_token_cipher" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "oauth_state" TEXT,
    "followers_count" INTEGER,
    "posts_count" INTEGER,
    "reels_count" INTEGER,
    "posting_frequency" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "last_sync_error" TEXT,
    "connected_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_posts" (
    "id" TEXT NOT NULL,
    "instagram_connection_id" TEXT NOT NULL,
    "external_post_id" TEXT NOT NULL,
    "media_type" "InstagramMediaType" NOT NULL,
    "media_url" TEXT,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "permalink" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content_history_id" TEXT,

    CONSTRAINT "instagram_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspiration_items" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "content_source_id" TEXT NOT NULL,
    "pattern" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "saved_by" TEXT,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspiration_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grid_templates" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_preset" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grid_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grid_slots" (
    "id" TEXT NOT NULL,
    "grid_template_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "content_type" "GridSlotContentType" NOT NULL DEFAULT 'EMPTY',
    "product_id" TEXT,
    "label" TEXT,

    CONSTRAINT "grid_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_active_grid" (
    "workspace_id" TEXT NOT NULL,
    "grid_template_id" TEXT NOT NULL,
    "set_by" TEXT,
    "set_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_active_grid_pkey" PRIMARY KEY ("workspace_id")
);

-- CreateTable
CREATE TABLE "content_rules" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_approvals" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "target_type" "ApprovalTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_label" TEXT NOT NULL,
    "requested_by" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution" "ApprovalResolution" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "pending_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_strategies" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "objective" TEXT,
    "duration_weeks" INTEGER NOT NULL,
    "posting_frequency" TEXT NOT NULL,
    "audience" TEXT,
    "content_types" JSONB NOT NULL DEFAULT '[]',
    "grid_template_id" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "StrategyStatus" NOT NULL DEFAULT 'DRAFT',
    "content_gaps" JSONB NOT NULL DEFAULT '[]',
    "opportunities_summary" JSONB NOT NULL DEFAULT '[]',
    "generated_by" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_products" (
    "strategy_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "strategy_products_pkey" PRIMARY KEY ("strategy_id","product_id")
);

-- CreateTable
CREATE TABLE "strategy_sequence_slots" (
    "id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "week_label" TEXT NOT NULL,
    "product_id" TEXT,
    "content_type" "GridSlotContentType" NOT NULL,
    "reason" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "strategy_sequence_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_flowcharts" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,

    CONSTRAINT "content_flowcharts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flowchart_nodes" (
    "id" TEXT NOT NULL,
    "flowchart_id" TEXT NOT NULL,
    "type" "FlowNodeType" NOT NULL,
    "label" TEXT NOT NULL,
    "product_id" TEXT,
    "date_label" TEXT,
    "content_type" "GridSlotContentType",
    "goal" TEXT,
    "status" "FlowNodeStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "FlowNodePriority",
    "effort" "FlowNodeEffort",
    "reason" TEXT,
    "grid_position" INTEGER,
    "branch" "FlowNodeBranch",
    "strategy_sequence_slot_id" TEXT,

    CONSTRAINT "flowchart_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flowchart_edges" (
    "id" TEXT NOT NULL,
    "flowchart_id" TEXT NOT NULL,
    "from_node_id" TEXT NOT NULL,
    "to_node_id" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "flowchart_edges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instagram_connections_workspace_id_key" ON "instagram_connections"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_posts_content_history_id_key" ON "instagram_posts"("content_history_id");

-- CreateIndex
CREATE INDEX "instagram_posts_instagram_connection_id_published_at_idx" ON "instagram_posts"("instagram_connection_id", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_posts_instagram_connection_id_external_post_id_key" ON "instagram_posts"("instagram_connection_id", "external_post_id");

-- CreateIndex
CREATE INDEX "inspiration_items_workspace_id_idx" ON "inspiration_items"("workspace_id");

-- CreateIndex
CREATE INDEX "grid_templates_workspace_id_idx" ON "grid_templates"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "grid_slots_grid_template_id_position_key" ON "grid_slots"("grid_template_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_active_grid_grid_template_id_key" ON "workspace_active_grid"("grid_template_id");

-- CreateIndex
CREATE INDEX "content_rules_workspace_id_idx" ON "content_rules"("workspace_id");

-- CreateIndex
CREATE INDEX "pending_approvals_workspace_id_idx" ON "pending_approvals"("workspace_id");

-- CreateIndex
CREATE INDEX "pending_approvals_workspace_id_resolution_idx" ON "pending_approvals"("workspace_id", "resolution");

-- CreateIndex
CREATE INDEX "content_strategies_workspace_id_idx" ON "content_strategies"("workspace_id");

-- CreateIndex
CREATE INDEX "content_strategies_workspace_id_status_idx" ON "content_strategies"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "strategy_sequence_slots_strategy_id_idx" ON "strategy_sequence_slots"("strategy_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_flowcharts_strategy_id_key" ON "content_flowcharts"("strategy_id");

-- CreateIndex
CREATE UNIQUE INDEX "flowchart_nodes_strategy_sequence_slot_id_key" ON "flowchart_nodes"("strategy_sequence_slot_id");

-- CreateIndex
CREATE INDEX "flowchart_nodes_flowchart_id_idx" ON "flowchart_nodes"("flowchart_id");

-- CreateIndex
CREATE INDEX "flowchart_edges_flowchart_id_idx" ON "flowchart_edges"("flowchart_id");

-- AddForeignKey
ALTER TABLE "instagram_connections" ADD CONSTRAINT "instagram_connections_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_connections" ADD CONSTRAINT "instagram_connections_connected_by_fkey" FOREIGN KEY ("connected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_instagram_connection_id_fkey" FOREIGN KEY ("instagram_connection_id") REFERENCES "instagram_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_items" ADD CONSTRAINT "inspiration_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_items" ADD CONSTRAINT "inspiration_items_content_source_id_fkey" FOREIGN KEY ("content_source_id") REFERENCES "content_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_items" ADD CONSTRAINT "inspiration_items_saved_by_fkey" FOREIGN KEY ("saved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grid_templates" ADD CONSTRAINT "grid_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grid_templates" ADD CONSTRAINT "grid_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grid_slots" ADD CONSTRAINT "grid_slots_grid_template_id_fkey" FOREIGN KEY ("grid_template_id") REFERENCES "grid_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grid_slots" ADD CONSTRAINT "grid_slots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_active_grid" ADD CONSTRAINT "workspace_active_grid_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_active_grid" ADD CONSTRAINT "workspace_active_grid_grid_template_id_fkey" FOREIGN KEY ("grid_template_id") REFERENCES "grid_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_active_grid" ADD CONSTRAINT "workspace_active_grid_set_by_fkey" FOREIGN KEY ("set_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_rules" ADD CONSTRAINT "content_rules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_rules" ADD CONSTRAINT "content_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_approvals" ADD CONSTRAINT "pending_approvals_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_approvals" ADD CONSTRAINT "pending_approvals_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_approvals" ADD CONSTRAINT "pending_approvals_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_strategies" ADD CONSTRAINT "content_strategies_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_strategies" ADD CONSTRAINT "content_strategies_grid_template_id_fkey" FOREIGN KEY ("grid_template_id") REFERENCES "grid_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_strategies" ADD CONSTRAINT "content_strategies_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_products" ADD CONSTRAINT "strategy_products_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "content_strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_sequence_slots" ADD CONSTRAINT "strategy_sequence_slots_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "content_strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_sequence_slots" ADD CONSTRAINT "strategy_sequence_slots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_flowcharts" ADD CONSTRAINT "content_flowcharts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_flowcharts" ADD CONSTRAINT "content_flowcharts_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "content_strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_flowcharts" ADD CONSTRAINT "content_flowcharts_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowchart_nodes" ADD CONSTRAINT "flowchart_nodes_flowchart_id_fkey" FOREIGN KEY ("flowchart_id") REFERENCES "content_flowcharts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowchart_nodes" ADD CONSTRAINT "flowchart_nodes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowchart_nodes" ADD CONSTRAINT "flowchart_nodes_strategy_sequence_slot_id_fkey" FOREIGN KEY ("strategy_sequence_slot_id") REFERENCES "strategy_sequence_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowchart_edges" ADD CONSTRAINT "flowchart_edges_flowchart_id_fkey" FOREIGN KEY ("flowchart_id") REFERENCES "content_flowcharts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowchart_edges" ADD CONSTRAINT "flowchart_edges_from_node_id_fkey" FOREIGN KEY ("from_node_id") REFERENCES "flowchart_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowchart_edges" ADD CONSTRAINT "flowchart_edges_to_node_id_fkey" FOREIGN KEY ("to_node_id") REFERENCES "flowchart_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
