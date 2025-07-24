// `components/checkout/payment/mercadopago/api/action.ts`

import { stringify } from "querystring";
import { postCreatePurchaseOrder } from "../../../../../components/profile/purchases/api/action";
import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import {
  AddressType,
  PurchaseItemType,
} from "../../../../../interfaces/auth/authInterface";
import { ProductType } from "../../../../../interfaces/shop/shopInterface";
import axios from "axios";

export const postCreateMercadopago = (
  cartId: string | undefined,
  items: ProductType[] | undefined,
  selectedCourier: any | undefined,
  selectedAddress: AddressType | undefined,
  couponCode: string | undefined,
  discount: number,
  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    postCreatePurchaseOrder(
      cartId,
      items,
      selectedCourier,
      selectedAddress?.id,
      couponCode,
      discount,

      signOutAuthState
    )
      .then((commerceOrder) => {
        postJWTAccessTokenInPage()
          .then((token) => {
            const config = {
              headers: {
                Authorization: `JWT ${token}`,
                Accept: "application/json",
              },
            };

            let products: any[] = [];
            let total_amount: number = 0;

            if (couponCode) {
              let discountItem = {
                id: "discount",
                title: "discount",
                description: "",
                picture_url: "",
                category_id: "",
                quantity: 1,
                currency_id: "CLP",
                unit_price: -discount,
              };

              products.push(discountItem);
            }

            items &&
              items.forEach((product) => {
                let item = {
                  id: product.id,
                  title: product.name,
                  description: "",
                  picture_url: product.thumbnail,
                  category_id: "",
                  quantity: product.quantity,
                  currency_id: "CLP",
                  unit_price: product.price,
                };
                total_amount += product.quantity * product.price;
                products.push(item);
              });

            total_amount += parseFloat(selectedCourier.price);
            total_amount -= discount;

            const paymentFormData = new FormData();
            paymentFormData.append("commerceOrder", commerceOrder);
            paymentFormData.append("items", JSON.stringify(products));
            paymentFormData.append("deliveryCost", selectedCourier.price);
            paymentFormData.append("total_amount", total_amount.toString());

            axios
              .post(
                `${process.env.NEXT_PUBLIC_URL_PRO}/api/payment/create/mercadopago`,
                paymentFormData,
                config
              )
              .then((res) => {
                return resolve(res.data.url);
              })
              .catch((err) => {
                return reject(
                  err?.response?.data?.detail ||
                    "Unexpected error, please try again"
                );
              });
          })
          .catch((err) => {
            signOutAuthState(err, true, false);
            return reject(err);
          });
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

export const postResendMercadopago = (
  commerceOrder: string,
  items: PurchaseItemType[],
  deliveryCost: number,
  discount: number,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    postJWTAccessTokenInPage()
      .then((token) => {
        const config = {
          headers: {
            Authorization: `JWT ${token}`,
            Accept: "application/json",
          },
        };

        let products: any[] = [];
        let total_amount: number = 0;

        if (discount > 0) {
          let discountItem = {
            id: "discount",
            title: "discount",
            description: "",
            picture_url: "",
            category_id: "",
            quantity: 1,
            currency_id: "CLP",
            unit_price: -discount,
          };

          products.push(discountItem);
        }

        items &&
          items.forEach((product) => {
            let item = {
              id: product.id,
              title: product.product.name,
              description: "",
              picture_url: product.product.thumbnail,
              category_id: "",
              quantity: product.quantity,
              currency_id: "CLP",
              unit_price: product.product.price,
            };
            total_amount += product.quantity * product.product.price;
            products.push(item);
          });

        total_amount += deliveryCost;
        total_amount -= discount;

        const paymentFormData = new FormData();
        paymentFormData.append("commerceOrder", commerceOrder);
        paymentFormData.append("items", JSON.stringify(products));
        paymentFormData.append("deliveryCost", deliveryCost.toString());
        paymentFormData.append("total_amount", total_amount.toString());

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/payment/create/mercadopago`,
            paymentFormData,
            config
          )
          .then((res) => {
            return resolve(res.data.url);
          })
          .catch((err) => {
            return reject(
              err?.response?.data?.detail ||
                "Unexpected error, please try again"
            );
          });
      })
      .catch((err) => {
        signOutAuthState(err, true, false);
        return reject(err);
      });
  });
};
