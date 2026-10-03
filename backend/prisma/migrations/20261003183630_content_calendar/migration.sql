-- CreateEnum
CREATE TYPE "CalendarEntryStatus" AS ENUM ('PLANNED', 'SCHEDULED', 'PUBLISHED', 'SKIPPED');

-- CreateTable
CREATE TABLE "calendar_entries" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "product_id" TEXT,
    "content_type" "GridSlotContentType",
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "grid_position" INTEGER,
    "strategy_id" TEXT,
    "flowchart_node_id" TEXT,
    "generated_content_id" TEXT,
    "status" "CalendarEntryStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calendar_entries_flowchart_node_id_key" ON "calendar_entries"("flowchart_node_id");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_entries_generated_content_id_key" ON "calendar_entries"("generated_content_id");

-- CreateIndex
CREATE INDEX "calendar_entries_workspace_id_idx" ON "calendar_entries"("workspace_id");

-- CreateIndex
CREATE INDEX "calendar_entries_workspace_id_date_idx" ON "calendar_entries"("workspace_id", "date");

-- CreateIndex
CREATE INDEX "calendar_entries_workspace_id_product_id_idx" ON "calendar_entries"("workspace_id", "product_id");

-- CreateIndex
CREATE INDEX "calendar_entries_workspace_id_status_idx" ON "calendar_entries"("workspace_id", "status");

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "content_strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_flowchart_node_id_fkey" FOREIGN KEY ("flowchart_node_id") REFERENCES "flowchart_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_generated_content_id_fkey" FOREIGN KEY ("generated_content_id") REFERENCES "generated_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
