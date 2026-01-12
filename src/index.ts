import express from "express";

const app = express();
const port = process.env.PORT || 3000; // bun auto handles .env

app.listen(port, () => {
  console.log(`listening on http://0.0.0.0:${port}`);
});
