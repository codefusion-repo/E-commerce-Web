"use client";
// navbar.tsx

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import "./navbar.css";
import { FaArrowsAltH } from "react-icons/fa";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { chainUrlString, postProductsFilters } from "./api/action";
import banner1 from "../../../../assets/banner1.png";
import { IoIosCloseCircle } from "react-icons/io";
import { useShop } from "../../../../../context/shop/shopContext";
import FilteredProductCard from "../../product/filteredProductCard/filteredProductCard";
import Pagination from "../../../../../components/pagination/pagination";
import { ProductType } from "../../../../../interfaces/shop/shopInterface";

export default function ShopNavbar() {
  const { availableOrderBy } = useShop();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const [data, setData] = useState<ProductType[]>(products);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [refreshProducts, setRefreshProducts] = useState<boolean>(false);
  const [categorySlug, setCategorySlug] = useState<
    string | string[] | undefined
  >(undefined);
  const [minPrice, setMinPrice] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<string | null>(null);
  const [search, setSearch] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const slugCategory = params.slugCategory;
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const searchParam = searchParams.get("search");
  const orderByParam = searchParams.get("orderBy");

  useEffect(() => {
    const getProducts = (slug: string | string[]) => {
      setError(null);
      setInfo(null);
      setLoading(true);

      setCategorySlug(slug);
      let minPrice: string | null = minPriceParam;
      let maxPrice: string | null = maxPriceParam;
      let search: string | null = searchParam;
      let orderBy: string | null = orderByParam;

      setMinPrice(minPrice);
      setMaxPrice(maxPrice);
      setSearch(search);
      setOrderBy(orderBy);

      const elemento = document.getElementById("orderBy") as HTMLSelectElement;
      if (elemento && orderBy) {
        elemento.value = orderBy;
      }

      postProductsFilters(slug, minPrice, maxPrice, search, orderBy)
        .then((res) => {
          setCurrentPage(1);
          setProducts(res.data.products);
          setData(res.data.products);
          setInfo(`Resultados: ${res.data.products.length}`);
          setLoading(false);
          setRefreshProducts(true);
        })
        .catch((err) => {
          setError(err);
          setCurrentPage(1);
          setProducts([]);
          setData([]);
          setLoading(false);
          setRefreshProducts(true);
        });
      if (minPrice || maxPrice || search || orderBy) {
        setIsOpen(true);
      }
    };

    if (
      (!refreshProducts &&
        slugCategory !== categorySlug &&
        minPriceParam) ||
      maxPriceParam ||
      searchParam ||
      orderByParam
    ) {
      getProducts(slugCategory);
    }
  }, [
    categorySlug,
    maxPriceParam,
    minPriceParam,
    orderByParam,
    refreshProducts,
    searchParam,
    slugCategory,
  ]);

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const onChangeMinPrice = (e: ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };
  const onChangeMaxPrice = (e: ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };
  const onChangeOrder = (e: ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value);

    setError(null);
    setInfo(null);
    setLoading(true);

    chainUrlString(minPrice, maxPrice, search, e.target.value, pathname).then(
      (url) => {
        router.push(url);
      }
    );

    postProductsFilters(
      slugCategory,
      minPrice,
      maxPrice,
      search,
      e.target.value
    )
      .then((res) => {
        setCurrentPage(1);
        setProducts(res.data.products);
        setData(res.data.products);
        setInfo(`Resultados: ${res.data.products.length}`);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setCurrentPage(1);
        setProducts([]);
        setData([]);
        setLoading(false);
      });
    setIsOpen(true);
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setInfo(null);
    setLoading(true);

    chainUrlString(minPrice, maxPrice, search, orderBy, pathname).then(
      (url) => {
        router.push(url);
      }
    );

    postProductsFilters(slugCategory, minPrice, maxPrice, search, orderBy)
      .then((res) => {
        setCurrentPage(1);
        setProducts(res.data.products);
        setData(res.data.products);
        setInfo(`Resultados: ${res.data.products.length}`);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setCurrentPage(1);
        setProducts([]);
        setData([]);
        setLoading(false);
      });
    setIsOpen(true);
  };
  const handleCloseFilters = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setOrderBy("df");
    setSearch(null);

    const elemento = document.getElementById("orderBy") as HTMLSelectElement;
    if (elemento) {
      elemento.value = "df";
    }
    setProducts([]);
    setData([]);
    setIsOpen(false);

    let URL = `${pathname}`;

    router.push(URL);
  };
  const getOrderByLabel = (currentOrderBy: string) => {
    let currentLabel: string = "";

    availableOrderBy.forEach((order) => {
      if (order.type === currentOrderBy) {
        currentLabel = order.name;
      }
    });
    return currentLabel;
  };
  const removeFilter = (filterRemoved: string) => {
    setError(null);
    setLoading(true);

    let URL = `${pathname}`;
    let initChain: boolean = false;

    if (filterRemoved === "minPrice") {
      setMinPrice(null);
    } else if (minPrice) {
      if (!initChain) {
        URL = URL + `?minPrice=${minPrice}`;
        initChain = true;
      } else {
        URL = URL + `&minPrice=${minPrice}`;
      }
    }
    if (filterRemoved === "maxPrice") {
      setMaxPrice(null);
    } else if (maxPrice) {
      if (!initChain) {
        URL = URL + `?maxPrice=${maxPrice}`;
        initChain = true;
      } else {
        URL = URL + `&maxPrice=${maxPrice}`;
      }
    }
    if (filterRemoved === "orderBy") {
      setOrderBy(null);
      const elemento = document.getElementById("orderBy") as HTMLSelectElement;
      if (elemento) {
        elemento.value = "df";
      }
    } else if (orderBy) {
      if (!initChain) {
        URL = URL + `?orderBy=${orderBy}`;
        initChain = true;
      } else {
        URL = URL + `&orderBy=${orderBy}`;
      }
    }
    if (filterRemoved === "search") {
      setSearch(null);
    } else if (search) {
      if (!initChain) {
        URL = URL + `?search=${search}`;
        initChain = true;
      } else {
        URL = URL + `&search=${search}`;
      }
    }
    router.push(URL);

    setError(null);
    setInfo(null);
    setCurrentPage(1);
    setProducts([]);
    setData([]);
    setLoading(true);

    if (!initChain) {
      setIsOpen(false);
      setLoading(false);
      return;
    }

    postProductsFilters(
      slugCategory,
      filterRemoved === "minPrice" ? "" : minPrice,
      filterRemoved === "maxPrice" ? "" : maxPrice,
      filterRemoved === "search" ? "" : search,
      filterRemoved === "orderBy" ? "df" : orderBy
    )
      .then((res) => {
        setCurrentPage(1);
        setProducts(res.data.products);
        setData(res.data.products);
        setInfo(`Resultados: ${res.data.products.length}`);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setCurrentPage(1);
        setProducts([]);
        setData([]);
        setLoading(false);
      });
  };
  const formatSlugToText = (slug: string) => {
    return slug
      .split("-") // Divide el slug por los guiones
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitaliza la primera letra de cada palabra
      .join(" ");
  };

  return (
    <div className="filters-layer">
      <div className="filters-header">
        <form
          id="filters-form"
          encType="multipart/form-data"
          onSubmit={(e) => onSubmit(e)}
          className="filters-form"
        >
          <div className="filters-form-item">
            <label>Buscar</label>
            <input
              className="large"
              onChange={(e) => onChangeSearch(e)}
              type="text"
              id="search"
              name="search"
              value={search ? search : ""}
              placeholder="Buscar productos"
              readOnly={loading}
            />
          </div>

          <div className="filters-form-minmax">
            <div className="filters-form-minmax-item">
              <label>Precio mínimo</label>
              <input
                onChange={(e) => onChangeMinPrice(e)}
                className="no-spinners large"
                type="text"
                id="minPrice"
                name="minPrice"
                value={minPrice ? minPrice : ""}
                placeholder="$0"
                readOnly={loading}
              />
            </div>
            <FaArrowsAltH className="icon" />

            <div className="filters-form-minmax-item">
              <label>Precio máximo</label>
              <input
                onChange={(e) => onChangeMaxPrice(e)}
                className="no-spinners large"
                type="text"
                id="maxPrice"
                name="maxPrice"
                value={maxPrice ? maxPrice : ""}
                placeholder="$0"
                readOnly={loading}
              />
            </div>
          </div>

          <div className="filters-form-item">
            <label>Ordenar por</label>
            <select
              className="large"
              onChange={(e) => onChangeOrder(e)}
              defaultValue={orderBy ? orderBy : ""}
              id="orderBy"
              name="orderBy"
              disabled={loading}
            >
              {availableOrderBy &&
                availableOrderBy.map((orderBy, index) => (
                  <option key={index} value={orderBy.type}>
                    {orderBy.name}
                  </option>
                ))}
            </select>
          </div>
          <button
            form="filters-form"
            type="submit"
            className="large"
            disabled={loading}
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="filters-tags">
        {search && search && searchParams.get("search") && isOpen && (
          <div className="tag">
            <h4>{`Búsqueda: ${search}`} </h4>
            <h4>
              <IoIosCloseCircle
                onClick={() => removeFilter("search")}
                className="icon"
              />
            </h4>
          </div>
        )}
        {minPrice && minPrice && searchParams.get("minPrice") && isOpen && (
          <div className="tag">
            <h4>
              {`Mínimo: ${Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(parseFloat(minPrice))}`}{" "}
            </h4>
            <h4>
              <IoIosCloseCircle
                onClick={() => removeFilter("minPrice")}
                className="icon"
              />
            </h4>
          </div>
        )}
        {maxPrice && maxPrice && searchParams.get("maxPrice") && isOpen && (
          <div className="tag">
            <h4>
              {`Máximo: ${Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(parseFloat(maxPrice))}`}{" "}
            </h4>
            <h4>
              <IoIosCloseCircle
                onClick={() => removeFilter("maxPrice")}
                className="icon"
              />
            </h4>
          </div>
        )}
        {orderBy &&
          orderBy &&
          orderBy !== "df" &&
          searchParams.get("orderBy") &&
          isOpen && (
            <div className="tag">
              <h4>{`Ordenado: ${getOrderByLabel(orderBy)}`} </h4>
              <h4>
                <IoIosCloseCircle
                  onClick={() => removeFilter("orderBy")}
                  className="icon"
                />
              </h4>
            </div>
          )}
      </div>

      {isOpen && (
        <div className="filters">
          <div className="filter-exit-button">
            <IoIosCloseCircle
              className="icon"
              onClick={() => handleCloseFilters()}
            />
          </div>
          <div className="banner-filters">
            <h1>
              {categorySlug && typeof categorySlug === "string"
                ? `Búsqueda: ${formatSlugToText(categorySlug)}`
                : "Búsqueda"}{" "}
            </h1>
            <Image
              src={banner1}
              alt="Banner de búsqueda"
              sizes="(max-width: 767px) 100vw, 720px"
            />
          </div>
          <div className="filters-footer">
            <div className="filters-error">{error && <h3>{error}</h3>}</div>
            <div className="filters-info">{info && <h3>{info}</h3>}</div>
            <div className="filters-info">
              {loading && <Image src={loadingGif} alt="Cargando..." />}
            </div>
          </div>

          <div className="filters-content">
            {!loading ? (
              <div className="products">
                {currentItems &&
                  currentItems.map((product, index) => (
                    <FilteredProductCard
                      key={product.id}
                      product={product}
                      entryOrder={index}
                    />
                  ))}
              </div>
            ) : (
              <div className="products"></div>
            )}

            {data.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                data={data}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
