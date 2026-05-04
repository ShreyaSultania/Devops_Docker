import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to homepage");
});
app.listen(80, () => {
  console.log("server is listening on port 80");
});
