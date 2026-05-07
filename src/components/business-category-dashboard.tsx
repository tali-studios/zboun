import { CloudKitchenDashboard } from "@/components/category-dashboards/cloud-kitchen-dashboard";
import { GymDashboard } from "@/components/category-dashboards/gym-dashboard";
import { HotelDashboard } from "@/components/category-dashboards/hotel-dashboard";
import { RetailDashboard } from "@/components/category-dashboards/retail-dashboard";
import type { CategoryDashboardSharedProps } from "@/components/category-dashboards/types";
import type { BusinessTypeKey } from "@/lib/business-types";

type Props = {
  businessType: BusinessTypeKey;
  clubActiveMembers: number;
  crmTotalCustomers: number;
  pmsActiveRooms: number;
  pmsOccupancyRate: number;
  ecommerceActiveOrders: number;
  ecommercePendingOrders: number;
  posOpenOrders: number;
  fleetActiveDeliveries: number;
  accountingMonthExpenses: number;
} & CategoryDashboardSharedProps;

export function BusinessCategoryDashboard(props: Props) {
  if (props.businessType === "fitness_club") {
    return <GymDashboard {...props} />;
  }
  if (props.businessType === "hotel_resort") {
    return <HotelDashboard {...props} />;
  }
  if (props.businessType === "retail_store") {
    return <RetailDashboard {...props} />;
  }
  return <CloudKitchenDashboard {...props} />;
}
