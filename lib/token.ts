import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("JWT_SECRET is required");
  }

  return new TextEncoder().encode(value);
}

export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function signEmailVerificationToken(payload: { userId: number; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getSecret());
}

export async function verifyEmailVerificationToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());

  return {
    userId: Number(payload.userId),
    email: String(payload.email)
  };
}
