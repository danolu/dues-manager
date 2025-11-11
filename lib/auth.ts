import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/types";

const COOKIE_NAME = "dues_session";

function getJwtSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("JWT_SECRET is required");
  }

  return new TextEncoder().encode(value);
}

export async function authenticateUser(login: string, password: string): Promise<SessionUser | null> {
  const parsedUserId = Number(login);
  const user = Number.isInteger(parsedUserId)
    ? await prisma.user.findFirst({
        where: {
          OR: [{ email: login }, { userId: parsedUserId }]
        }
      })
    : await prisma.user.findUnique({ where: { email: login } });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }

  return { id: user.id, email: user.email, isAdmin: user.isAdmin };
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    return {
      id: Number(payload.id),
      email: String(payload.email),
      isAdmin: Boolean(payload.isAdmin)
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) {
    return null;
  }

  return user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
