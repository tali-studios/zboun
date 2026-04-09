"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";

async function requireSuperAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "superadmin") {
    redirect("/dashboard/login");
  }
}

async function getUniqueSlug(baseName: string) {
  const supabase = await createServerSupabaseClient();
  const baseSlug = toSlug(baseName);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const { data } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${baseSlug}-${count++}`;
  }
}

export async function createRestaurantAction(formData: FormData) {
  await requireSuperAdmin();
  const name = String(formData.get("name"));
  const phone = String(formData.get("phone"));
  const slug = await getUniqueSlug(name);
  const supabase = await createServerSupabaseClient();
  await supabase.from("restaurants").insert({ name, phone, slug, is_active: true });
  revalidatePath("/dashboard/super-admin");
}

export async function toggleRestaurantActiveAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  const isActive = String(formData.get("is_active")) === "true";
  const supabase = await createServerSupabaseClient();
  await supabase.from("restaurants").update({ is_active: !isActive }).eq("id", id);
  revalidatePath("/dashboard/super-admin");
}
