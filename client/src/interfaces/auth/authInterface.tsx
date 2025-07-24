// authInterface.tsx

import { CouponType, ProductType } from "../shop/shopInterface";

// Interface para direcciones del usuario
export interface AddressType {
  id: string;
  regionName: string;
  regionCode: string;
  countyName: string;
  countyCode: string;
  streetName: string;
  streetNumber: string;

  postalCode: string;
  lat: number;
  lng: number;

  phoneNumber: string;
  comment: string;
  isDefault: boolean;
}

// Interface para los items de una compra
export interface PurchaseItemType {
  id: string;
  product: ProductType;
  quantity: number;
}

// Interface para la dirección de envio de una compra
export interface PurchaseDeliveryType {
  id: string;
  shipmentNumber: string;
  region: string;
  commune: string;
  street: string;
  streetNumber: string;
  courier: string;
  status: string;
}

// Interface para la informcación de pago de una compra
export interface PaymentType {
  id: string;
  method: string;
  media: string;
  payerEmail: string;
  currency: string;
  amount: number;
  creationDate: Date;
}

// Interface para un cupón del usuario
export interface UserCouponType {
  id: string;
  coupon: CouponType;
  isUsed: boolean;
}

// Interface para una compra del usuario
export interface PurchaseType {
  id: string;
  code: string;
  items: PurchaseItemType[];
  delivery: PurchaseDeliveryType;
  payment: PaymentType;
  coupon: UserCouponType;
  discount: number;
  subtotal: number;
  deliveryCost: number;
  total: number;
  status: string;
  creationDate: Date;
}

// Interface para el usuario en un comentario
export interface UserCommentType {
  id: string;
  email: string;
  first_name: string;
}

// Interface para el usuario
export interface UserType {
  uid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rut: string;
  phone: string;
  addresses: AddressType[];
  purchases: PurchaseType[];
}
