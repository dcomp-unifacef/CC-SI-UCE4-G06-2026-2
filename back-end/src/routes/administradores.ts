import { Router } from 'express'
import * as controller from '../controllers/administradorController'
import * as pushNotificationController from '../controllers/pushNotificationController'
import { requireAuth } from '../middlewares/authMiddleware'
import { loginRateLimiter } from '../middlewares/rateLimiter'

const router = Router()

router.post('/autenticar', loginRateLimiter, controller.authenticate)
router.post('/logout', requireAuth, controller.logout)
router.get('/sessao', requireAuth, controller.getCurrentSession)
router.get(
  '/notificacoes/chave-publica',
  requireAuth,
  pushNotificationController.getPublicKey,
)
router.post(
  '/notificacoes/assinaturas',
  requireAuth,
  pushNotificationController.registerSubscription,
)
router.delete(
  '/notificacoes/assinaturas',
  requireAuth,
  pushNotificationController.removeSubscription,
)

router.post('/', requireAuth, controller.create)
router.get('/', requireAuth, controller.retrieveAll)
router.get('/:id', requireAuth, controller.retrieveOne)
router.put('/:id', requireAuth, controller.update)
router.put('/:id/senha', requireAuth, controller.changePassword)
router.delete('/:id', requireAuth, controller.remove)

export default router
