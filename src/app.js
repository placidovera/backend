import express from "express";
import fs from "fs";
import crypto from "crypto";

class UserCarritos {
  static products = [];

  static getInstance() {
    if (fs.existsSync("./src/products.json")) {
      this.products = JSON.parse(fs.readFileSync("./src/products.json", "utf-8"));
    } else {
      this.products = [];
      fs.writeFileSync("./src/products.json", JSON.stringify(this.products, null, 2));
    }
  }

  static createProduct({ title, description, code, price, status, stock, category, thumbnails = [] }) {
    const id = crypto.randomUUID();
    const newProduct = { id, title, description, code, price, status, stock, category, thumbnails };
    this.products.push(newProduct);
    fs.writeFileSync("./src/products.json", JSON.stringify(this.products, null, 2));
    return newProduct;
  }

  static mostrarProductos() {
    return this.products;
  }

  static getProductById(id) {
    return this.products.find(p => p.id === id) || null;
  }

  static changeProduct({ id,title, description, code, price, status, stock, category }) {
    const productChanged = this.products.find((prod) => prod.id === id);
    if (!productChanged) return "Producto no encontrado";
    productChanged.title = title;
    productChanged.description = description;
    productChanged.code = code;
    productChanged.price = price;
    productChanged.status = status;
    productChanged.stock = stock;
    productChanged.category = category;
    fs.writeFileSync("./src/products.json", JSON.stringify(this.products,null, 2));
    return `Producto ${id} actualizado correctamente`;
  }

  static eliminarProducto(id) {
    const productDelete = this.products.find((prod) => prod.id === id);
    if (!productDelete) return "Producto no encontrado";
    this.products = this.products.filter((prod) => prod.id !== id);
    fs.writeFileSync("./src/products.json", JSON.stringify(this.products,null, 2));
    return `Producto ${id} eliminado correctamente`;
  }
}

class Cart {
  static carritos = [];

  static instCarts() {
    if (fs.existsSync("./src/carts.json")) {
      this.carritos = JSON.parse(fs.readFileSync("./src/carts.json", "utf-8"));
    } else {
      this.carritos = [];
      fs.writeFileSync("./src/carts.json", JSON.stringify(this.carritos, null, 2));
    }
  }

  static createCart() {
    const id = crypto.randomUUID();
    const newCart = { id, products: [] };
    this.carritos.push(newCart);
    fs.writeFileSync("./src/carts.json", JSON.stringify(this.carritos, null, 2));
    return newCart;
  }

  static getCartById(cid) {
    return this.carritos.find(c => c.id === cid) || null;
  }

  static addProductToCart(cid, pid) {
    const cart = this.carritos.find(c => c.id === cid);
    if (!cart) return null;

    const productInCart = cart.products.find(p => p.product === pid);
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    fs.writeFileSync("./src/carts.json", JSON.stringify(this.carritos, null, 2));
    return cart;
  }
}

UserCarritos.getInstance();
Cart.instCarts();

const app = express();
app.use(express.json());


app.get("/", (req, res) => res.send("API de productos funcionando correctamente"));

app.get("/productos", (req, res) => res.json(UserCarritos.mostrarProductos()));

app.get("/productos/:id", (req, res) => {
  const product = UserCarritos.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

app.post("/productos", (req, res) => {
  const producto = UserCarritos.createProduct(req.body);
  res.status(201).json({ mensaje: "Producto creado correctamente", producto });
});

app.put("/productos/:id", (req, res) => {
  const mensaje = UserCarritos.changeProduct({ ...req.body, id: req.params.id });
  if (mensaje === "Producto no encontrado") return res.status(404).json({ error: mensaje });
  res.json({ mensaje });
});

app.delete("/productos/:id", (req, res) => {
  const mensaje = UserCarritos.eliminarProducto(req.params.id);
  if (mensaje === "Producto no encontrado") return res.status(404).json({ error: mensaje });
  res.json({ mensaje });
});


app.get("/api/carts", (req,res) => res.json(Cart.carritos));

app.post("/api/carts", (req, res) => {
  const newCart = Cart.createCart();
  res.status(201).json(newCart);
});

app.get("/api/carts/:cid", (req, res) => {
  const cart = Cart.getCartById(req.params.cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(cart.products);
});

app.post("/api/carts/:cid/product/:pid", (req, res) => {
  const updatedCart = Cart.addProductToCart(req.params.cid, req.params.pid);
  if (!updatedCart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(updatedCart);
});

app.listen(8080, () => console.log("Servidor escuchando en el puerto 8080"));
