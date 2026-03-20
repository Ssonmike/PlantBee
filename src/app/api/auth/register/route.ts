import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener mínimo 6 caracteres" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con este email" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create default garden for new user
    await db.garden.create({
      data: {
        userId: user.id,
        name: "Mi Jardín",
        type: "mixed",
        emoji: "🌿",
      },
    });

    return NextResponse.json(
      { message: "Cuenta creada correctamente", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
