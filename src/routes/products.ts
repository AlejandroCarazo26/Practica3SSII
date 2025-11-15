import { Router } from "express";
import { getDB } from "../BDClase";
import { ObjectId } from "mongodb";
import { AuthRequest, verifyToken } from "../middlewares/verifyToken";

const router = Router();

type Product = {
    _id?: ObjectId,
    name: string,
    description?: string,
    price: number,
    stock: number,
    createdAt?: Date
};

const coleccion = () => getDB().collection<Product>("products");

router.get("/", async (req, res) => {
    try{
        const products = await coleccion().find().toArray();
        res.status(200).json(products);
    }catch(err){
        console.error("GET /api/products error:", err);
        res.status(500).json({message: "Error interno"});
    }
});


router.post("/", verifyToken, async (req: AuthRequest, res) => {
    try{
        const { name, description, price, stock } = req.body as Product;

        if(!name || typeof name !== "string" || name.trim().length === 0){
            return res.status(400).json({message: "Campo 'name' es obligatorio"});
        }

        if(price === undefined || typeof price !== "number"){
            return res.status(400).json({message: "Campo 'price' es obligatorio y debe ser número"});
        }

        if(price <= 0){
            return res.status(400).json({message: "El 'price' debe ser mayor que 0"});
        }

        if(stock === undefined || typeof stock !== "number"){
            return res.status(400).json({message: "Campo 'stock' es obligatorio y debe ser número"});
        }

        if(stock < 0){
            return res.status(400).json({message: "El 'stock' debe ser >= 0"});
        }

        const productToInsert: Product = {
            name,
            description: description && typeof description === "string" ? description.trim() : "",
            price,
            stock,
            createdAt: new Date()
        };

        const result = await coleccion().insertOne(productToInsert);
        const created = await coleccion().findOne({_id: result.insertedId});
        res.status(201).json(created);
    }catch(err){
        console.error("POST /api/products error:", err);
        res.status(500).json({message: "Error interno"});
    }
});

export default router;
