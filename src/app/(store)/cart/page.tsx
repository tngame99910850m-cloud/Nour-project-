import { getBusinessSettings } from "@/lib/settings";
import { CartView } from "@/components/store/cart-view";

export const metadata = { title: "Shopping Cart" };

export default async function CartPage() {
  const business = await getBusinessSettings();
  return <CartView currencySymbol={business.currencySymbol} freeDeliveryText={business.freeDeliveryText} />;
}
