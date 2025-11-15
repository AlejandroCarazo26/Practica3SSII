import { connectToMongoDB } from "./BDClase";
import express, { Request, Response, NextFunction } from "express";
import rutasAuth from "./routes/auth";
import rutasProducts from "./routes/products";
import rutasCart from "./routes/carts";
import dotenv from "dotenv";

dotenv.config();

connectToMongoDB();

const app = express();

app.use(express.json());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: "Invalid JSON body" });
    }
    next();
});

app.use("/api/auth", rutasAuth);
app.use("/api/products", rutasProducts);
app.use("/api/cart", rutasCart);

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error interno:", err);
    res.status(500).json({ message: "Error interno" });
});

const PORT = process.env.PORT;
app.listen(PORT, ()=>console.log(`El API comenzó en el puerto: ${PORT}`));
