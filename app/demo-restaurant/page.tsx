import { MenuClient } from "@/components/menu-client";
import Image from "next/image";

const demoCategories = [
  {
    id: "cat-burgers",
    name: "Burgers",
    position: 1,
    menu_items: [
      {
        id: "item-classic-burger",
        name: "Classic Burger",
        description: "Beef patty, lettuce, tomato, and signature sauce.",
        contents: "Beef, lettuce, tomato, sauce",
        grams: 220,
        price: 6.5,
        removable_ingredients: [{ name: "Onion" }, { name: "Pickles" }],
        add_ingredients: [{ name: "Cheese", price: 0.5 }],
        image_url: null,
        is_available: true,
      },
      {
        id: "item-chicken-burger",
        name: "Chicken Burger",
        description: "Crispy chicken, pickles, and mayo.",
        contents: "Chicken, pickles, mayo",
        grams: 200,
        price: 5.75,
        removable_ingredients: [{ name: "Pickles" }, { name: "Mayo" }],
        add_ingredients: [{ name: "Cheese", price: 0.5 }, { name: "Jalapeno", price: 0.3 }],
        image_url: null,
        is_available: true,
      },
    ],
  },
  {
    id: "cat-sides",
    name: "Sides",
    position: 2,
    menu_items: [
      {
        id: "item-fries",
        name: "Fries",
        description: "Golden crispy fries.",
        contents: "Potato, salt",
        grams: 150,
        price: 2.25,
        removable_ingredients: [{ name: "Salt" }],
        add_ingredients: [{ name: "Cheese sauce", price: 0.75 }],
        image_url: null,
        is_available: true,
      },
      {
        id: "item-coleslaw",
        name: "Coleslaw",
        description: "Fresh cabbage salad.",
        contents: "Cabbage, carrot, dressing",
        grams: 120,
        price: 1.5,
        removable_ingredients: [{ name: "Dressing" }],
        add_ingredients: [],
        image_url: null,
        is_available: true,
      },
    ],
  },
];

export default function DemoRestaurantPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-6">
      <div className="container">
        <header className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <Image
              src="/demo_restaurant_logo.svg"
              alt="Demo Restaurant logo"
              width={56}
              height={56}
              className="h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-1"
              unoptimized
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Demo Restaurant</h1>
              <p className="text-sm text-slate-600">
                This is a sample customer menu preview powered by Zboun.
              </p>
            </div>
          </div>
        </header>
        <MenuClient
          restaurantName="Demo Restaurant"
          restaurantPhone="96171212734"
          lbpRate={89500}
          categories={demoCategories}
        />
      </div>
    </main>
  );
}
