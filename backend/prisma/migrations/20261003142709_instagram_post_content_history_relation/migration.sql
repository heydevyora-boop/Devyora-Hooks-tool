-- AddForeignKey
ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_content_history_id_fkey" FOREIGN KEY ("content_history_id") REFERENCES "content_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;
