import {Router} from "express"
import generatePDF from "../controller/downloadPDF.controller.ts";

const router =Router()

router.get('/pdf',generatePDF)

export default router;