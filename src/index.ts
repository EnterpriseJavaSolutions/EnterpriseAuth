import express from "express";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 3000; // bun auto handles .env

// express config
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("X-Powered-By", "EnterpriseAuth"); // ;)
  next();
});

app.listen(port, () => {
  console.log(`listening on http://0.0.0.0:${port}`);
});
