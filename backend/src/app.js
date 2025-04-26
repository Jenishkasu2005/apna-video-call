import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import { connect } from "node:http2";
import { connectToSocket } from "./controllers/socketmanager.js";

import userroutes from "./routes/userroutes.js"
import meetingRoutes from "./routes/meetingroutes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));


app.use("/api/v1/users", userroutes);
app.use("/api/meetings", meetingRoutes);

app.get("/home", (req, res) => {
    return res.json({ message: "hello world" });
});




const start = async () => {
    const connecttionDB = await mongoose.connect("mongodb+srv://jenishkasodariya2244:jenishjod@cluster0.ko4qh.mongodb.net/")

    console.log(`mongo connected db host:${connecttionDB.connection.host}`);

    server.listen(app.get("port"), () => {
        console.log("LISTENING ON PORT 8000");
    });
};

start();
