import express from "express";
import { UserRepository } from "../../persistence/user.repository";
import bcrypt from "bcrypt";

export const authRouter = express.Router();

authRouter.post("/register", (req, res, next) => {
  (async () => {
    const { nickname, names, lastnames, email, password, city, phone } =
      req.body;
    if (
      !nickname ||
      !names ||
      !lastnames ||
      !email ||
      !password ||
      !city ||
      !phone
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }
    const existing = await UserRepository.findByEmail(email);
    if (existing)
      return res.status(400).json({ message: "Email ya registrado." });
    const hashed = await bcrypt.hash(password, 10);
    await UserRepository.create({
      nickname,
      names,
      lastnames,
      email,
      password: hashed,
      city,
      phone,
    });
    res.status(201).json({ message: "Usuario registrado correctamente." });
  })().catch(next);
});
