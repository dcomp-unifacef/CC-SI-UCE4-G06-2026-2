import { Router } from 'express'
import * as controller from '../controllers/compromissoController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

router.use(requireAuth)

router.get('/', controller.retrieveAll)
router.get('/alertas/pendentes', controller.getPendingAlerts)
router.post('/alertas/disparar', controller.triggerAlerts)
router.get('/:id', controller.retrieveOne)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.patch('/:id/concluido', controller.toggleConcluido)
router.delete('/:id', controller.remove)

export default router
