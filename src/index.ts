import { connectToMongoDB } from "./BDClase";
import express from "express";
import rutillas from "./routes"


connectToMongoDB(); 
const app = express();
app.use(express.json());

app.use("/api/Clase1", rutillas)


app.listen(3000, ()=>console.log("El API comenzó en el puerto: 3000"));