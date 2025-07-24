// `components/navigation/navbar/api/action.ts`

import { orderProducts } from "../../../../components/shop/api/action";
import {
  CategoryType,
  ProductType,
} from "../../../../interfaces/shop/shopInterface";
import axios from "axios";

// Función para concatenar la url de parametros de busqueda
export const chainUrlStringWithSlug = (
  slug: string | null,
  minPrice: string | null,
  maxPrice: string | null,
  search: string | null,
  orderBy: string | null,
  pathname: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let URL = `${pathname}`;
    let initChain: boolean = false;
    if (slug) {
      if (!initChain) {
        URL = URL + `?category=${slug}`;
        initChain = true;
      } else {
        URL = URL + `&category=${slug}`;
      }
    }
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

export const getSearchedElements = (
  slug: string | null,
  minPrice: string | null,
  maxPrice: string | null,
  search: string | null,
  orderBy: string | null,

  categories: CategoryType[],
  brands: CategoryType[],
  products: ProductType[]
): Promise<{
  categories: CategoryType[];
  brands: CategoryType[];
  products: ProductType[];
}> => {
  return new Promise((resolve, reject) => {
    let filteredCategories: CategoryType[] = categories;
    let filteredBrands: CategoryType[] = brands;
    let filteredProducts: ProductType[] = products;

    if (slug) {
      filteredProducts = products.filter((product) =>
        product.categories.some((category) => category.slug === slug)
      );
    }
    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.slug.toLowerCase().includes(search.toLowerCase())
      );
      if (!slug) {
        filteredCategories = filteredCategories.filter(
          (category) =>
            category.name.toLowerCase().includes(search.toLowerCase()) ||
            category.slug.toLowerCase().includes(search.toLowerCase())
        );
        filteredBrands = filteredBrands.filter(
          (brand) =>
            brand.name.toLowerCase().includes(search.toLowerCase()) ||
            brand.slug.toLowerCase().includes(search.toLowerCase())
        );
      }
    }
    if (minPrice) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price <= parseFloat(maxPrice)
      );
    }
    orderProducts(orderBy, filteredProducts).then((fp) => {
      filteredProducts = fp;
    });

    return resolve({
      categories: filteredCategories,
      brands: filteredBrands,
      products: filteredProducts,
    });
  });
};

export const postProductsCategoriesSearch = (
  slug: string | null,
  minPrice: string | null,
  maxPrice: string | null,
  search: string | null,
  orderBy: string | null
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const filterFormData = new FormData();

    if (slug) {
      filterFormData.append("slug", slug);
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
        `${process.env.NEXT_PUBLIC_URL_PRO}/api/home/post/search`,
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
