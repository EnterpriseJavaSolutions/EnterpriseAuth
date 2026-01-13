import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import db from "./db/db";
import { usersTable } from "./db/schema";
import { count, eq } from "drizzle-orm";
import argon2 from "argon2";
import jsonwebtoken from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 3000; // bun auto handles .env

// express config
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("X-Powered-By", "EnterpriseAuth"); // ;)
  next();
});
app.use(express.static("static"));
app.use(express.json());
app.set("view engine", "ejs");

async function checkAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.enterprise_auth;

  if (!token) {
    return res.redirect("/");
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET!) as {
      id: number;
    };
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id));
    const user = users[0];
    if (!user) {
      return res.redirect("/unauthorized.html");
    }
    if (!user.admin) {
      return res.redirect("/unauthorized.html");
    }
    next();
  } catch (err) {
    return res.redirect("/unauthorized.html");
  }
}

app.get("/", (req, res) => {
  // TODO: if already signed in, redirect to /dash
  return res.render("signin");
});

app.post("/api/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      status: 400,
      message: "You must provide both username and password!",
      extra: {},
    });
  }
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  const user = users[0];
  if (!user) {
    return res
      .status(404)
      .json({ status: 404, message: "User not found!", extra: {} });
  }
  const passwordIsGood = argon2.verify(user.password, password);
  if (!passwordIsGood) {
    return res.status(401).json({
      status: 401,
      message: "Incorrect credentials!",
      extra: { yousuck: "you suck" },
    });
  }
  const token = jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET!);
  return res
    .status(200)
    .json({ status: 200, message: "Signed in!", extra: { token } });
});

app.post("/api/newuser", checkAdmin, (req, res) => {});

app.get("/dash", async (req, res) => {
  if (!req.cookies.enterprise_auth) {
    return res.redirect("/");
  }
  const token = req.cookies.enterprise_auth;
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET!) as {
      id: number;
    };
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id));
    const user = users[0];
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "Invalid token!", extra: {} });
    }
    if (!user.admin) {
      return res.redirect("/unauthorized.html");
    }
    const users1 = await db.select().from(usersTable);
    return res.render("dash", { users: users1 });
  } catch (err) {
    return res.redirect("/unauthorized.html");
  }
});

const fshhgsgh = await db.select().from(usersTable);
if (fshhgsgh.length == 0) {
  const passwordHash = await argon2.hash("root");
  await db.insert(usersTable).values({
    username: "admin",
    password: passwordHash,
    admin: true,
  });
}

app.listen(port, () => {
  console.log(`listening on http://0.0.0.0:${port}`);
});
