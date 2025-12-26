import {Router} from "express"
import {downloadPYQs, fetchHTML, fetchPYQ} from '../controller/scarpping.controller.ts'

const router =Router()

router.get('/html',fetchHTML)
router.get('/pyq',fetchPYQ)
router.get('/download',downloadPYQs)


export default router;