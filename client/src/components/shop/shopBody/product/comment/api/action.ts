import { ProductType } from "../../../../../../interfaces/shop/shopInterface";
import axios from "axios";

export const getProducts = (): Promise<ProductType[]> => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    axios
      .get(`${process.env.NEXT_PUBLIC_URL_PRO}/api/shop/get/products`, config)
      .then((res) => {
        return resolve(res.data.products);
      });
  });
};
