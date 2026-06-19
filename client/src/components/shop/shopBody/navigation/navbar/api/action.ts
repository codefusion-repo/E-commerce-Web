// `components/shop/navigation/navbar/api/action.ts`

import axios from "axios";
import { clientApiUrl } from "@/utils/api";

// Función para concatenar la url de parametros de busqueda
export const chainUrlString = (
  minPrice: string | null,
  maxPrice: string | null,
  search: string | null,
  orderBy: string | null,
  pathname: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let URL = `${pathname}`;
    let initChain: boolean = false;

    if (search) {
      if (!initChain) {
        URL = URL + `?search=${search}`;
        initChain = true;
      } else {
        URL = URL + `&search=${search}`;
      }
    }
    if (minPrice) {
      if (!initChain) {
        URL = URL + `?minPrice=${minPrice}`;
        initChain = true;
      } else {
        URL = URL + `&minPrice=${minPrice}`;
      }
    }
    if (maxPrice) {
      if (!initChain) {
        URL = URL + `?maxPrice=${maxPrice}`;
        initChain = true;
      } else {
        URL = URL + `&maxPrice=${maxPrice}`;
      }
    }
    if (orderBy) {
      if (!initChain) {
        URL = URL + `?orderBy=${orderBy}`;
        initChain = true;
      } else {
        URL = URL + `&orderBy=${orderBy}`;
      }
    }
    resolve(URL);
  });
};

// Función para filtrar los productos segun algunos parametros
export const postProductsFilters = (
  slug: string | string[],
  minPrice: string | null,
  maxPrice: string | null,
  search: string | null,
  orderBy: string | null
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const filterFormData = new FormData();

    if (typeof slug === "string") {
      filterFormData.append("slug", slug);
    } else {
      filterFormData.append("slug", "");
    }
    if (minPrice) {
      filterFormData.append("minPrice", minPrice);
    }
    if (maxPrice) {
      filterFormData.append("maxPrice", maxPrice);
    }
    if (search) {
      filterFormData.append("search", search);
    }
    if (orderBy) {
      filterFormData.append("orderBy", orderBy);
    }

    const config = {
      headers: {
        "Content-Type": "application/json", // Añade esta línea
      },
    };
    axios
      .post(
        clientApiUrl(`/api/shop/on/change/filter`),
        filterFormData,
        config
      )
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err.response.data.detail);
      });
  });
};
