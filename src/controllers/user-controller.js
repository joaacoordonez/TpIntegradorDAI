import { createUser, findUserByUsername } from "../services/user-service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const JWT_SECRET = process.env.JWT_SECRET || "miClaveSuperSecreta";

export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, username, password } = req.body;

    // Validaciones básicas
    if (!first_name || first_name.length < 3) {
      return res.status(400).json({ success: false, message: "El nombre debe tener al menos 3 caracteres." });
    }
    if (!last_name || last_name.length < 3) {
      return res.status(400).json({ success: false, message: "El apellido debe tener al menos 3 caracteres." });
    }
    if (!username || !validator.isEmail(username)) {
      return res.status(400).json({ success: false, message: "El email es invalido.", token: "" });
    }
    if (!password || password.length < 3) {
      return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 3 caracteres.", token: "" });
    }

    // Verificar si ya existe el usuario
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "El usuario ya existe.", token: "" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    await createUser({ first_name, last_name, username, password: hashedPassword });

    return res.status(201).json({ success: true, message: "Usuario creado correctamente." });
  } catch (err) {
    console.error("Error en registerUser:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor.", token: "" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !validator.isEmail(username)) {
      return res.status(400).json({ success: false, message: "El email es invalido.", token: "" });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario o clave inválida.", token: "" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Usuario o clave inválida.", token: "" });
    }

    // Generar token JWT
    const token = jwt.sign({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username
    }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({ success: true, message: "", token });
  } catch (err) {
    console.error("Error en loginUser:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor.", token: "" });
  }
};
