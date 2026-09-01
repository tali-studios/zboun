import {
  applySoleOptionDefaults,
  isVariantComboOffered,
  optionHasRemainingStock,
  resolveVariantListPrice,
  type MenuOptionGroup,
} from "../src/lib/menu-item-options";

const groups: MenuOptionGroup[] = [
  {
    label: "Storage",
    values: [
      { name: "256GB", price: 0 },
      { name: "512GB", price: 0 },
      { name: "2TB", price: 0 },
    ],
  },
  { label: "RAM", values: [{ name: "12GB", price: 0 }] },
  {
    label: "Color",
    values: [
      { name: "Black", price: 0 },
      { name: "White", price: 0 },
    ],
  },
];

const prices = {
  "256GB||12GB||Black": 990,
  "256GB||12GB||White": 990,
  "512GB||12GB||Black": 1150,
  "512GB||12GB||White": 1150,
};

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const defaults = applySoleOptionDefaults(groups, { Color: "Black" }, prices);
assert(defaults.RAM === "12GB", "Single RAM was not selected automatically");
assert(
  isVariantComboOffered(prices, groups, { Color: "Black" }),
  "A valid partial color selection was rejected",
);
assert(
  isVariantComboOffered(prices, groups, {
    Storage: "256GB",
    RAM: "12GB",
    Color: "Black",
  }),
  "A valid complete combination was rejected",
);
assert(
  !isVariantComboOffered(prices, groups, {
    Storage: "1TB",
    RAM: "12GB",
    Color: "Black",
  }),
  "An invalid complete combination was accepted",
);
assert(
  !isVariantComboOffered(prices, groups, { Storage: "2TB" }),
  "A storage with no entered prices was offered",
);

const stocks = {
  "256GB||12GB||Black": 2,
  "256GB||12GB||White": 0,
  "512GB||12GB||Black": 0,
  "512GB||12GB||White": 3,
};
assert(
  optionHasRemainingStock(groups, stocks, true, "Storage", "256GB", {
    Color: "Black",
  }),
  "A stocked 256GB Black option was hidden",
);
assert(
  !optionHasRemainingStock(groups, stocks, true, "Storage", "512GB", {
    Color: "Black",
  }),
  "An out-of-stock 512GB Black option was offered",
);

const price256 = resolveVariantListPrice(prices, groups, { Storage: "256GB" });
const price512 = resolveVariantListPrice(prices, groups, { Storage: "512GB" });
assert(price256.price === 990 && price256.exact, "256GB price is wrong");
assert(price512.price === 1150 && price512.exact, "512GB price is wrong");

const mixedColorPrices = { ...prices, "256GB||12GB||White": 1000 };
const fromPrice = resolveVariantListPrice(mixedColorPrices, groups, { Storage: "256GB" });
assert(fromPrice.price === 990 && !fromPrice.exact, "The partial From price is wrong");

console.log("Variant pricing checks passed");
