import { Router } from 'express'
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from '../controllers/vehiclesController.js'

const router = Router()

router.get('/', listVehicles)
router.get('/:plate_number', getVehicle)
router.post('/', createVehicle)
router.put('/:plate_number', updateVehicle)
router.delete('/:plate_number', deleteVehicle)

export default router

