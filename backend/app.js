const express = require("express");
const path = require("path");
const cors = require("cors");

const port = 5000;

const app = express()

//config respostas em JSON e form data 
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.listen(port, ()=>{
  console.log(`App rodando na porta ${port}`)
})