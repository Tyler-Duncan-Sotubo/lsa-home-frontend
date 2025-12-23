export type CustomLoginPayload = {
  email: string;
  password: string;
};

export const loginApi = {
  async customLogin(payload: CustomLoginPayload) {
    const res = await fetch("/api/custom-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { error: data?.error ?? "Login failed" };
    }

    return data;
  },
};
