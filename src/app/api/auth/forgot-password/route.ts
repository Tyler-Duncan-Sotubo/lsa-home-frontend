// app/api/forgot-password/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userLogin } = await req.json();

    if (!userLogin) {
      return NextResponse.json(
        { error: "Please provide your email or username." },
        { status: 400 }
      );
    }

    const authUser = process.env.WORDPRESS_ADMIN_USER;
    const authPass = process.env.WORDPRESS_ADMIN_APP_PASSWORD;
    const wpUrl = process.env.WORDPRESS_URL;

    if (!authUser || !authPass || !wpUrl) {
      return NextResponse.json(
        { error: "Server is not configured for password reset." },
        { status: 500 }
      );
    }

    const basicAuth = Buffer.from(`${authUser}:${authPass}`).toString("base64");

    const wpRes = await fetch(`${wpUrl}/wp-json/custom/v1/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ user_login: userLogin }),
    });

    const data = await wpRes.json();

    if (!wpRes.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            "Unable to start password reset. Please try again later.",
        },
        { status: data?.data?.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          data?.message ||
          "If an account exists with that email, a reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
