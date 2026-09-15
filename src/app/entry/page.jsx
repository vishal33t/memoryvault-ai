import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function EntryPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  redirect("/login");
}