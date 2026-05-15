import { Router } from 'express'
import { getReport } from '../controllers/reportsController.js'

const router = Router()

router.get('/:type', getReport)

export default router
