import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as productController from '../controllers/product.controller.js'

/**
 * "Search products" (Chunk 3 scope) is the `?q=` param on the list route,
 * not a separate endpoint — same resource, same auth/validation, so a
 * dedicated /products/search route would just be this with extra steps.
 */
export async function productRoutes(app: FastifyInstance) {
  app.get('/products', { preHandler: requireAuth }, productController.listProducts)
  app.get('/products/:id', { preHandler: requireAuth }, productController.getProduct)
  app.post('/products', { preHandler: requireAuth }, productController.createProduct)
  app.patch('/products/:id', { preHandler: requireAuth }, productController.updateProduct)
}
