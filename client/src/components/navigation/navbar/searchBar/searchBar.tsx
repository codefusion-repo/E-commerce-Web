"use client";
// searchBar.tsx

import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { FaArrowsAltH } from "react-icons/fa";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { usePathname, useRouter } from "next/navigation";
import { IoIosCloseCircle } from "react-icons/io";
import { useShop } from "../../../../context/shop/shopContext";
import Slider from "react-slider";
import Products from "../../../../components/home/products/products";
import { ProductType } from "../../../../interfaces/shop/shopInterface";
import { SearchFormDataType } from "../../../../interfaces/utils/utilsInterface";
import { useMobile } from "../../../../context/mobile/mobileContext";

export default function SearchBar({
  products,
  searchFormData,
  setSearchFormData,
  refresh,
  setRefresh,
  loading,
  error,
  info,
}: {
  products: ProductType[];
  searchFormData: SearchFormDataType;
  setSearchFormData: Dispatch<SetStateAction<SearchFormDataType>>;
  refresh: boolean;
  setRefresh: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  error: string | null;
  info: string | null;
}) {
  const { device } = useMobile();
  const { availableOrderBy, isOpen, setIsOpen } = useShop();

  type PriceRange = [number, number];

  const [MIN, SETMIN] = useState<number>(0);
  const [MAX, SETMAX] = useState<number>(100000);
  const initialState: PriceRange = [MIN, MAX];
  const [values, setValues] = useState<PriceRange>(initialState);

  const pathname = usePathname();
  const router = useRouter();

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchFormData({ ...searchFormData, [e.target.name]: e.target.value });

    if (e.target.name === "minPrice" || e.target.name === "maxPrice") {
      if (e.target.name === "minPrice") {
        if (parseFloat(e.target.value) < values[1]) {
          setValues([parseFloat(e.target.value), values[1]]);
        }
      }
      if (e.target.name === "maxPrice") {
        if (parseFloat(e.target.value) > values[0]) {
          setValues([values[0], parseFloat(e.target.value)]);
        }
      }
    } else {
      setRefresh(true);
    }
  };

  useEffect(() => {
    const setPrices = () => {
      const preciosExtremos = products.reduce(
        (acumulador, producto) => {
          return {
            maximo: Math.max(acumulador.maximo, producto.price),
            minimo: Math.min(acumulador.minimo, producto.price),
          };
        },
        { maximo: -Infinity, minimo: Infinity }
      );

      if (preciosExtremos.minimo - 50000 > 0) {
        SETMIN(preciosExtremos.minimo - 50000);
      } else {
        SETMIN(0);
      }
      SETMAX(preciosExtremos.maximo + 50000);
    };

    if (products.length > 0) {
      setPrices();
    }
  }, [products]);

  const setNewPrice = () => {
    setSearchFormData({
      ...searchFormData,
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    //SETMIN(parseFloat(searchFormData.minPrice ? searchFormData.minPrice : ""));
    //SETMAX(parseFloat(searchFormData.maxPrice ? searchFormData.maxPrice : ""));
    setRefresh(true);
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
    setSearchFormData({ ...searchFormData, [filterRemoved]: null });
    if (filterRemoved === "minPrice") {
      setValues([MIN, values[1]]);
    }
    if (filterRemoved === "maxPrice") {
      setValues([values[0], MAX]);
    }
    if (filterRemoved === "orderBy") {
      const elemento = document.getElementById("orderBy") as HTMLSelectElement;
      if (elemento) {
        elemento.value = "df";
      }
    }
    setRefresh(true);
  };
  const handleCloseFilters = () => {
    const elemento = document.getElementById("orderBy") as HTMLSelectElement;
    if (elemento) {
      elemento.value = "df";
    }

    setSearchFormData({
      ...searchFormData,
      slug: null,
      minPrice: null,
      maxPrice: null,
      search: null,
      orderBy: null,
    });

    let URL = `${pathname}`;
    router.push(URL);

    setIsOpen(false);
  };

  const getCategoryName = (slug: string) => {
    const name = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return name;
  };
  return (
    <div
      className={`flex ${
        device > 2 ? "box-xl column" : "box-xxl column-reverse"
      } f-height-full relative base-bg auto`} /*{`flex box-xxl f-height-xxxxl fixed column navbar-m-m ${
        device > 1 ? "sidebar-p-l" : ""
      } f-top f-right f-left base-bg z-index-l padding-b-xxl auto second-border-b`}*/
    >
      <form
        className={`flex box-xxl wrap a-center j-center second-bg`}
        id="filters-form"
        encType="multipart/form-data"
        onSubmit={(e) => onSubmit(e)}
      >
        <div className="flex j-start column">
          {searchFormData.slug && isOpen && (
            <div className="flex f-width-ml gap-xs padding-s">
              <h4>{`Categoría: ${getCategoryName(searchFormData.slug)}`} </h4>
              <div className="flex">
                <IoIosCloseCircle
                  className="zoom-out-xxl base-color cursor-pointer"
                  onClick={() => removeFilter("slug")}
                />
              </div>
            </div>
          )}
          {searchFormData.search && isOpen && (
            <div className="flex f-width-ml gap-xs padding-s">
              <h4>{`Búsqueda: ${searchFormData.search}`} </h4>
              <div className="flex">
                <IoIosCloseCircle
                  className="zoom-out-xxl base-color cursor-pointer"
                  onClick={() => removeFilter("search")}
                />
              </div>
            </div>
          )}
        </div>

        <div className={`flex a-center j-around gap-ms padding-s`}>
          <div className="flex a-center j-center gap-xs">
            <div className="flex column gap-xxs a-center">
              <label>Precio mínimo</label>
              <input
                onChange={(e) => onChange(e)}
                className="input-small"
                type="text"
                id="minPrice"
                name="minPrice"
                value={searchFormData.minPrice ? searchFormData.minPrice : ""}
                placeholder="$0"
                readOnly={loading}
              />
            </div>
            {searchFormData.minPrice && (
              <div className="flex">
                <IoIosCloseCircle
                  onClick={() => removeFilter("minPrice")}
                  className="zoom-out-xxl base-color cursor-pointer"
                />
              </div>
            )}
          </div>
          <FaArrowsAltH className="base-color zoom-out-xxl" />
          <div className="flex a-center j-center gap-xs">
            <div className="flex column gap-xxs a-center">
              <label>Precio máximo</label>
              <input
                onChange={(e) => onChange(e)}
                className="no-spinners input-small"
                type="text"
                id="maxPrice"
                name="maxPrice"
                value={searchFormData.maxPrice ? searchFormData.maxPrice : ""}
                placeholder="$0"
                readOnly={loading}
              />
            </div>
            {searchFormData.maxPrice && (
              <div className="flex">
                <IoIosCloseCircle
                  onClick={() => removeFilter("maxPrice")}
                  className="zoom-out-xxl base-color cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        <div
          className={`flex f-width-l f-height-xs a-center j-around gap-ms padding-s`}
        >
          <Slider
            className={`flex box-xxl f-height-xxs base-bg border-radius-xxl`}
            onChange={setValues}
            onAfterChange={setNewPrice}
            value={values}
            min={MIN}
            max={MAX}
            minDistance={5000}
            thumbClassName="f-width-xxs f-height-xxs third-bg border-radius-xxl cursor-grab"
            renderThumb={(props, state) => (
              <div {...props} key={state.index}>
                <h4 className={`thumb-value-${state.index}`}>
                  {Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(state.valueNow)}
                </h4>
              </div>
            )}
          />
        </div>
        <div className="flex a-center j-center gap-xs padding-s">
          <div className={`flex column gap-xxs`}>
            <label>Ordenar por</label>
            <select
              className="select-middle"
              onChange={(e) => onChange(e)}
              defaultValue={
                searchFormData.orderBy ? searchFormData.orderBy : ""
              }
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
          {searchFormData.orderBy && searchFormData.orderBy != "df" && (
            <div className="flex">
              <IoIosCloseCircle
                onClick={() => removeFilter("orderBy")}
                className="zoom-out-xxl base-color cursor-pointer"
              />
            </div>
          )}
        </div>
        <div
          className={`flex f-width-ml f-height-s a-start j-center gap-xs padding-s`}
        >
          <button
            onClick={() => handleCloseFilters()}
            form="none"
            className="btn-span btn-active"
          >
            Cerrar
          </button>
          <button form="filters-form" className="btn-span btn-active">
            Buscar
          </button>
        </div>
      </form>

      {/*<div className="flex column a-center fixed f-bottom f-left gap-s padding-xs z-index-xl">
        {searchFormData.slug && isOpen && (
          <div className="flex f-width-xl f-height-xxs a-center j-space third-bg padding-l-s padding-r-s border-radius-xxs">
            <h4>
              {`Categoría: ${searchFormData.slug
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}`}{" "}
            </h4>

            <IoIosCloseCircle
              className="zoom-out-xxl base-color cursor-pointer"
              onClick={() => removeFilter("slug")}
            />
          </div>
        )}
        {searchFormData.search && isOpen && (
          <div className="flex f-width-xl f-height-xxs a-center j-space third-bg padding-l-s padding-r-s border-radius-xxs">
            <h4>{`Búsqueda: ${searchFormData.search}`} </h4>
            <IoIosCloseCircle
              className="zoom-out-xxl base-color cursor-pointer"
              onClick={() => removeFilter("search")}
            />
          </div>
        )}
        {searchFormData.minPrice && isOpen && (
          <div className="flex f-width-xl f-height-xxs a-center j-space third-bg padding-l-s padding-r-s border-radius-xxs">
            <h4>
              {`Mínimo: ${Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(parseFloat(searchFormData.minPrice))}`}{" "}
            </h4>
            <IoIosCloseCircle
              className="zoom-out-xxl base-color cursor-pointer"
              onClick={() => removeFilter("minPrice")}
            />
          </div>
        )}
        {searchFormData.maxPrice && isOpen && (
          <div className="flex f-width-xl f-height-xxs a-center j-space third-bg padding-l-s padding-r-s border-radius-xxs">
            <h4>
              {`Máximo: ${Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(parseFloat(searchFormData.maxPrice))}`}
            </h4>
            <IoIosCloseCircle
              className="zoom-out-xxl base-color cursor-pointer"
              onClick={() => removeFilter("maxPrice")}
            />
          </div>
        )}
        {searchFormData.orderBy &&
          searchFormData.orderBy !== "df" &&
          isOpen && (
            <div className="flex f-width-xl f-height-xxs a-center j-space third-bg padding-l-s padding-r-s border-radius-xxs">
              <h4>{`Ordenado: ${getOrderByLabel(searchFormData.orderBy)}`} </h4>
              <IoIosCloseCircle
                className="zoom-out-xxl base-color cursor-pointer"
                onClick={() => removeFilter("orderBy")}
              />
            </div>
          )}
      </div>*/}

      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Cargando..." />
        </div>
      )}
      {error && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <h4>{error}</h4>
        </div>
      )}
      {info && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs second-border-t second-border-b">
          <h4>{info}</h4>
        </div>
      )}

      <div
        className={`flex box-xxl f-height-full base-bg column auto padding-b-m padding-t-m`}
      >
        <Products header="" products={products} isSearch={true} />
      </div>
    </div>
  );
}
