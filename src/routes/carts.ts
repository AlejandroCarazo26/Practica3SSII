import { Router } from "express";
import { getDB } from "../BDClase";
import { ObjectId } from "mongodb";
import { AuthRequest, verifyToken } from "../middlewares/verifyToken";

const router = Router();

type CartItem = {
    productId: ObjectId,
    quantity: number
};

type Cart = {
    _id: ObjectId,
    userId: ObjectId,
    items: CartItem[]
};

type Product = {
    _id?: ObjectId,
    name: string,
    price: number,
    stock: number
};

const cartsCollection = () => getDB().collection<Cart>("carts");
const productsCollection = () => getDB().collection<Product>("products");

router.put("/add", verifyToken, async (req: AuthRequest, res) => {
    try{
        const body = req.body as { productId: string, quantity: number };

        if(!body || typeof body !== "object"){
            return res.status(400).json({message: "Body inválido"});
        }

        const { productId, quantity } = body;

        if(!productId || typeof productId !== "string"){
            return res.status(400).json({message: "Campo 'productId' es obligatorio y debe ser string"});
        }

        const qty = Number(quantity);
        if(typeof qty !== "number"|| qty <= 0){
            return res.status(400).json({message: "Campo 'quantity' debe ser entero positivo"});
        }

        const prodObjectId = new ObjectId(productId);
        const product = await productsCollection().findOne({_id: prodObjectId});
        if(!product){
            return res.status(404).json({message: "Product not found"});
        }

        const userIdStr = (req.user as any)?.id;
        if(!userIdStr) return res.status(401).json({message: "Token inválido"});

        const userObjectId = new ObjectId(userIdStr);
        let cart = await cartsCollection().findOne({ userId: userObjectId });

        if(!cart){
            if(qty > product.stock){
                return res.status(400).json({message: "Insufficient stock"});
            }

            const newCart: Cart = {
                _id: new ObjectId,
                userId: userObjectId,
                items: [{ productId: prodObjectId, quantity: qty }]
            };

            const insertRes = await cartsCollection().insertOne(newCart);
            const created = await cartsCollection().findOne({_id: insertRes.insertedId});
            return res.status(200).json(created);
        }
        
        await cartsCollection().updateOne({ _id: cart._id }, { $set: { items: cart.items } });
        const updated = await cartsCollection().findOne({ _id: cart._id });
        return res.status(200).json(updated);
    }
    catch(err){
        console.error("PUT /api/cart/add error:", err);
        return res.status(500).json({message: "Error interno"});
    }
});

router.get("/", verifyToken, async (req: AuthRequest, res) => {
    try{
        const userIdStr = (req.user as any)?.id;
        if(!userIdStr) return res.status(401).json({message: "Token inválido"});

        const userObjectId = new ObjectId(userIdStr);
        const cart = await cartsCollection().findOne({ userId: userObjectId });

        if(!cart){
            return res.status(200).json({ userId: userObjectId.toString(), items: [] });
        }

        res.status(200).json(cart);
    }
    catch(err){
        console.error("GET /api/cart error:", err);
        res.status(500).json({message: "Error interno"});
    }
});

export default router;
