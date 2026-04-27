import { Router } from 'express'
import {
  createViolation,
  deleteViolation,
  getViolation,
  listViolations,
  updateViolation,
} from '../controllers/violationsController.js'

const router = Router()

router.get('/', listViolations)
router.get('/:violation_id', getViolation)
router.post('/', createViolation)
router.put('/:violation_id', updateViolation)
router.delete('/:violation_id', deleteViolation)

export default router

