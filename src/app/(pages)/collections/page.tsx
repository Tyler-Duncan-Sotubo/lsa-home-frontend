import { redirect } from "next/navigation";

export default function PagesIndexRedirect() {
  redirect("/"); // /pages → /
}
