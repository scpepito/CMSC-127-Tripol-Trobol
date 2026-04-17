import { Router } from 'express'
import {
  createDriver,
  deleteDriver,
  getDriver,
  listDrivers,
  updateDriver,
} from '../controllers/driversController.js'

const router = Router()

router.get('/', listDrivers)
router.get('/:license_number', getDriver)
router.post('/', createDriver)
router.put('/:license_number', updateDriver)
router.delete('/:license_number', deleteDriver)

export default router

