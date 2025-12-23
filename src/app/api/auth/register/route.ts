import { registerCore } from "@/lib/auth/register";
import { z } from "zod";

const RegisterSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  marketingOptIn: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = RegisterSchema.safeParse(payload);

    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const result = await registerCore(parsed.data);

    if (!result.ok) {
      const status = /exists|registered/i.test(result.error)
        ? 409
        : /api key|unauthorized|forbidden/i.test(result.error)
        ? 401
        : 400;

      return Response.json(result, { status });
    }

    return Response.json(result, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
