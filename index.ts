import express from "express"
import router from './router/index.ts'

const app=express()

const PORT=9000

app.use(express.json())

app.use("/api/v1", router);

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})