import express from "express";
import mongoose from "mongoose";
import connectDB from "./db.js";
import model from "./model.js";

const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/getdata", async (req, res) => {
  const data = await model.find();
  res.send(data);
});

app.listen(5000, () => {
  console.log("server is listening on port 5000");
});
