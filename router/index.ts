import { Router } from "express";
import downloadPDF from "./downloadPDF.route.ts";

const router = Router();


router.use('/generate',downloadPDF)

export default router;
;
