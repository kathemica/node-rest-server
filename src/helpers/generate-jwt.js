import jwt from "jsonwebtoken";
import { SECRETJWT } from "../config/config.js";

const generateJWT = (uuid = "") => {
  return new Promise((resolve, reject) => {
    const payload = { uuid };    

    jwt.sign(payload, SECRETJWT, {expiresIn: "4h"},
      (err, token) => {
        if (err) {
          console.log(err);
          reject(`Couldn't generate jwt token`);
        } else {
          resolve(token);
        }
      }
    );
  });
};

export { generateJWT };

//TODO: se debe validar que los usuarios posean solo un token activo a la vez
//TODO: se debe sumar tiempo de sesión a cada usuario cuando el token lo está usando
