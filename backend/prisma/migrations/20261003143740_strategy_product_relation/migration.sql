-- AddForeignKey
ALTER TABLE "strategy_products" ADD CONSTRAINT "strategy_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
