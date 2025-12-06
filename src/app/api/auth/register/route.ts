// app/api/register/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      username,
      email,
      password,
      firstName,
      lastName,
    }: {
      username: string;
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email and password are required." },
        { status: 400 }
      );
    }

    const authUser = process.env.WORDPRESS_ADMIN_USER;
    const authPass = process.env.WORDPRESS_ADMIN_APP_PASSWORD;

    if (!authUser || !authPass || !process.env.WORDPRESS_URL) {
      return NextResponse.json(
        { error: "Server is not configured for registration." },
        { status: 500 }
      );
    }

    const basicAuth = Buffer.from(`${authUser}:${authPass}`).toString("base64");

    const wpRes = await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/wp/v2/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: firstName ?? "",
          last_name: lastName ?? "",
        }),
      }
    );

    const data = await wpRes.json();

    if (!wpRes.ok) {
      // WordPress error shape: { code, message, data: { status } }
      return NextResponse.json(
        {
          error:
            data?.message ||
            "Unable to create your account. Please try again later.",
        },
        { status: data?.data?.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        userId: data.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
