import { ProductType } from "../../../../../../interfaces/shop/shopInterface";
import axios from "axios";
import { clientApiUrl } from "@/utils/api";

export const getProducts = (): Promise<ProductType[]> => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    axios
      .get(clientApiUrl(`/api/shop/get/products`), config)
      .then((res) => {
        return resolve(res.data.products);
      });
  });
};
