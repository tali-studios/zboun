export type CategoryDashboardSharedProps = {
  businessTypeLabel: string;
  restaurantName: string;
  profileCompleteness: number;
  enabledModuleCount: number;
  inventoryEnabled: boolean;
  accountingEnabled: boolean;
  posEnabled: boolean;
  crmEnabled: boolean;
  loyaltyEnabled: boolean;
  eventsEnabled: boolean;
  pmsEnabled: boolean;
  ecommerceEnabled: boolean;
  fleetEnabled: boolean;
  clubEnabled: boolean;
};

export type GymDashboardProps = CategoryDashboardSharedProps & {
  clubActiveMembers: number;
  crmTotalCustomers: number;
  accountingMonthExpenses: number;
};

export type HotelDashboardProps = CategoryDashboardSharedProps & {
  pmsActiveRooms: number;
  pmsOccupancyRate: number;
  crmTotalCustomers: number;
};

export type RetailDashboardProps = CategoryDashboardSharedProps & {
  posOpenOrders: number;
  ecommerceActiveOrders: number;
  crmTotalCustomers: number;
};

export type CloudKitchenDashboardProps = CategoryDashboardSharedProps & {
  ecommerceActiveOrders: number;
  ecommercePendingOrders: number;
  fleetActiveDeliveries: number;
};
