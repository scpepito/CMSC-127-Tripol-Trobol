import { Router } from 'express'
import {
  createRegistration,
  deleteRegistration,
  getRegistration,
  listRegistrations,
  updateRegistration,
} from '../controllers/registrationsController.js'

const router = Router()

router.get('/', listRegistrations)
router.get('/:registration_number', getRegistration)
router.post('/', createRegistration)
router.put('/:registration_number', updateRegistration)
router.delete('/:registration_number', deleteRegistration)

export default router

