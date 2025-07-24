// `components/profile/purchases/api/action.ts`

import { generarNumeroOrden } from "../../../../components/checkout/payment/api/action";
import { postJWTAccessTokenInPage } from "../../../../context/auth/api/action";
import { ProductType } from "../../../../interfaces/shop/shopInterface";
import axios from "axios";

export const postCreatePurchaseOrder = (
  cartId: string | undefined,
  items: ProductType[] | undefined,
  selectedCourier: any | undefined,
  addressId: string | undefined,
  couponCode: string | undefined,
  discount: number,

  signOutAuthState: (
    message?: string,
    needRedirection?: boolean,
    needRefresh?: boolean
  ) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!items) {
      return reject("There are no products in your shopping cart");
    }
    if (!selectedCourier) {
      return reject("Delivery method not selected");
    }
    if (!addressId) {
      return reject("Address not selected");
    }
    postJWTAccessTokenInPage()
      .then((token) => {
        let commerceOrder = cartId?.slice(0, 3) + generarNumeroOrden();

        const config = {
          headers: {
            Authorization: `JWT ${token}`,
            Accept: "application/json",
          },
        };

        const purchaseFormData = new FormData();
        purchaseFormData.append("commerceOrder", commerceOrder);
        purchaseFormData.append("items", JSON.stringify(items));
        purchaseFormData.append("deliveryCost", String(selectedCourier.price));
        purchaseFormData.append(
          "serviceDescription",
          selectedCourier.original_courier
        );
        purchaseFormData.append("addressId", addressId);
        if (couponCode !== undefined) {
          purchaseFormData.append("couponCode", couponCode);
          purchaseFormData.append("discount", String(discount));
        }

        axios
          .post(
            `${process.env.NEXT_PUBLIC_URL_PRO}/api/purchase/create`,
            purchaseFormData,
            config
          )
          .then(() => {
            return resolve(commerceOrder);
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

    // OLD CODE VERSION
    /*if (Cookies.get("access")) {
      let commerceOrder = cartId?.slice(0, 3) + generarNumeroOrden();
      const config = {
        headers: {
          Authorization: `JWT ${Cookies.get("access")}`,
          Accept: "application/json",
        },
      };

      if (!selectedCourier) {
        return reject("Tipo de entrega no seleccionado");
      }
      if (!addressId) {
        return reject("Dirección no seleccionada");
      }

      const purchaseFormData = new FormData();
      purchaseFormData.append("commerceOrder", commerceOrder);
      purchaseFormData.append("items", JSON.stringify(items));
      purchaseFormData.append("deliveryCost", selectedCourier.price);
      purchaseFormData.append(
        "serviceDescription",
        selectedCourier.original_courier
      );
      purchaseFormData.append("addressId", addressId);
      if (couponCode !== undefined) {
        purchaseFormData.append("couponCode", couponCode);
        purchaseFormData.append("discount", String(discount));
      }

      axios
        .post(
          `${process.env.NEXT_PUBLIC_URL_PRO}/api/purchase/create`,
          purchaseFormData,
          config
        )
        .then(() => {
          return resolve(commerceOrder);
        })
        .catch((err) => {
          console.log("err3: ", err);
          return reject(err.response.data.detail);
        });
    } else {
      return reject("notAuthenticated");
    }*/
  });
};
