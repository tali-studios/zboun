import { redirect } from "next/navigation";
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  toggleVipAction,
  addCustomerNoteAction,
  deleteCustomerNoteAction,
  createTagAction,
  deleteTagAction,
  assignTagAction,
  removeTagAssignmentAction,
  linkOrderToCustomerAction,
} from "@/app-actions/crm";
import { CrmPanel } from "@/components/crm-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id)
    .eq("addon_key", "crm")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/restaurant");
  }

  const [
    { data: restaurant },
    { data: customers },
    { data: notes },
    { data: tags },
    { data: tagAssignments },
    { data: posOrders },
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select("name, logo_url, phone, location")
      .eq("id", appUser.restaurant_id)
      .single(),
    supabase
      .from("crm_customers")
      .select("id, full_name, phone, email, birthday, is_vip, total_spend, visit_count, first_visit_at, last_visit_at, notes, created_at, updated_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("full_name"),
    supabase
      .from("crm_customer_notes")
      .select("id, customer_id, content, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_tags")
      .select("id, name, color, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name"),
    supabase
      .from("crm_customer_tag_assignments")
      .select("id, customer_id, tag_id, assigned_at"),
    supabase
      .from("pos_orders")
      .select("id, receipt_number, total_amount, status, order_type, created_at, customer_id")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  return (
    <CrmPanel
      restaurantName={restaurant?.name ?? ""}
      customers={customers ?? []}
      notes={notes ?? []}
      tags={tags ?? []}
      tagAssignments={tagAssignments ?? []}
      posOrders={posOrders ?? []}
      createCustomerAction={createCustomerAction}
      updateCustomerAction={updateCustomerAction}
      deleteCustomerAction={deleteCustomerAction}
      toggleVipAction={toggleVipAction}
      addCustomerNoteAction={addCustomerNoteAction}
      deleteCustomerNoteAction={deleteCustomerNoteAction}
      createTagAction={createTagAction}
      deleteTagAction={deleteTagAction}
      assignTagAction={assignTagAction}
      removeTagAssignmentAction={removeTagAssignmentAction}
      linkOrderToCustomerAction={linkOrderToCustomerAction}
    />
  );
}
