// `components/checkout/payment/mercadopago/api/action.ts`

import {
  postCreatePurchaseOrder,
  postResendPurchaseOrder,
} from "../../../../../components/profile/purchases/api/action";
import {
  AddressType,
  PurchaseItemType,
} from "../../../../../interfaces/auth/authInterface";
import { ProductType } from "../../../../../interfaces/shop/shopInterface";

export const postCreateMercadopago = (
  items: ProductType[] | undefined,
  selectedCourier: any | undefined,
  selectedAddress: AddressType | undefined,
  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void,
  couponCode?: string
): Promise<string> => {
  return postCreatePurchaseOrder(
    items,
    selectedCourier,
    selectedAddress?.id,
    "mp",
    signOutAuthState,
    couponCode
  );
};

export const postResendMercadopago = (
  commerceOrder: string,
  _items: PurchaseItemType[],
  _deliveryCost: number,
  _discount: number,
  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<string> => {
  return postResendPurchaseOrder(commerceOrder, "mp", signOutAuthState);
};
