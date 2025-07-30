// `components/checkout/payment/flow/api/action.ts`

import { postCreatePurchaseOrder } from "../../../../../components/profile/purchases/api/action";
import { postJWTAccessTokenInPage } from "../../../../../context/auth/api/action";
import {
  AddressType,
  PurchaseItemType,
} from "../../../../../interfaces/auth/authInterface";
import { ProductType } from "../../../../../interfaces/shop/shopInterface";
import axios from "axios";

export const postCreateFlow = (
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
  return new Promise((resolve, reject) => {
    postCreatePurchaseOrder(
      items,
      selectedCourier,
      selectedAddress?.id,
      "f",
      signOutAuthState,
      couponCode
    )
      .then((url) => {
        console.log("url: ", url);
        /*postJWTAccessTokenInPage()
          .then((token) => {
            const config = {
              headers: {
                Authorization: `JWT ${token}`,
                Accept: "application/json",
              },
            };

            let optional: any = {};

            purchase.items &&
              purchase.items.forEach((item) => {
                optional[`${item.product.name}`] = `${item.quantity}`;
              });

            const params = {
              commerceOrder: purchase.code,
              subject: "Order payment",
              currency: "CLP",
              amount: purchase.total,
              urlConfirmation: `${process.env.NEXT_PUBLIC_URL_PRO}/api/payment/receive/flow/webwook`,
              urlReturn: `${process.env.NEXT_PUBLIC_URL_PRO}/api/payment/receive/flow/redirect`,
              optional: JSON.stringify(optional),
            };

            axios
              .post(
                `${process.env.NEXT_PUBLIC_URL_PRO}/api/payment/create/flow`,
                params,
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
          });*/
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

export const postResendFlow = (
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

        let amount: number = 0;
        let optional: any = {};

        items &&
          items.forEach((item) => {
            optional[`${item.product.name}`] = `${item.quantity}`;
            amount += item.product.price * item.quantity;
          });

        amount = amount + deliveryCost - discount;

        const params = {
          commerceOrder: commerceOrder,
          subject: "Order payment",
          currency: "CLP",
          amount: amount,
          urlConfirmation: `${process.env.NEXT_PUBLIC_URL_PRO}/api/payment/receive/flow/webwook`,
          urlReturn: `${process.env.NEXT_PUBLIC_URL_PRO}/api/payment/receive/flow/redirect`,
          optional: JSON.stringify(optional),
        };

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/payment/create/flow`,
            params,
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
