"use client";
// navbar.tsx

//import "./navbar.css";
import { usePathname, useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import ProfileMenu from "./profileMenu/profileMenu";
import ShoppingCart from "./shoppingCart/shoppingCart";
import SearchBar from "./searchBar/searchBar";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { chainUrlStringWithSlug, getSearchedElements } from "./api/actions";
import { useShop } from "../../../context/shop/shopContext";
import SearchSidebar from "./searchSidebar/searchSidebar";
import Image from "next/image";
import Link from "next/link";
import { IoIosCloseCircle } from "react-icons/io";
import logo from "../../../assets/sampleBusinessImage.jpeg";
import {
  CategoryType,
  ProductType,
} from "../../../interfaces/shop/shopInterface";
import { SearchFormDataType } from "../../../interfaces/utils/utilsInterface";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function Navbar() {
  const { device } = useMobile();
  const router = useRouter();
  const pathname = usePathname();

  const { isOpen, setIsOpen, categories, brands, products } = useShop();

  const [searchedProducts, setSearchedProducts] = useState<ProductType[]>([]);
  const [searchedCategories, setSearchedCategories] = useState<CategoryType[]>(
    []
  );
  const [searchedBrands, setSearchedBrands] = useState<CategoryType[]>([]);

  const [searchFormData, setSearchFormData] = useState<SearchFormDataType>({
    slug: null,
    minPrice: null,
    maxPrice: null,
    orderBy: null,
    search: null,
  });

  const { slug, minPrice, maxPrice, orderBy, search } = searchFormData;

  const [refresh, setRefresh] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const refreshSearch = (
      slug: string | null,
      minPrice: string | null,
      maxPrice: string | null,
      search: string | null,
      orderBy: string | null
    ) => {
      if (!slug) {
        setSearchedCategories([]);
        setSearchedBrands([]);
      }
      setSearchedProducts([]);
      setError(null);
      setInfo(null);
      setLoading(true);

      chainUrlStringWithSlug(
        slug,
        minPrice,
        maxPrice,
        search,
        orderBy,
        pathname
      ).then((url) => {
        router.push(url);
      });

      getSearchedElements(
        slug,
        minPrice,
        maxPrice,
        search,
        orderBy,

        categories,
        brands,
        products
      ).then((res) => {
        if (!slug) {
          setSearchedCategories(res.categories);
          setSearchedBrands(res.brands);
        }
        setSearchedProducts(res.products);
        setInfo(`Productos encontrados: ${res.products.length}`);
        setLoading(false);
        setRefresh(false);
      });
    };

    if (slug || minPrice || maxPrice || search || orderBy || refresh) {
      refreshSearch(slug, minPrice, maxPrice, search, orderBy);
    }
  }, [
    brands,
    categories,
    maxPrice,
    minPrice,
    orderBy,
    pathname,
    products,
    refresh,
    router,
    search,
    slug,
  ]);

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchFormData({ ...searchFormData, [e.target.name]: e.target.value });

    if (e.target.value.length < 1) {
      setRefresh(true);
    }
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  /*const ref = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const detectOutClick = (e: MouseEvent) => {
    // Asegúrate de que el evento es del tipo MouseEvent
    const target = e.target as Node; // Cast e.target a Node para usar el método contains

    if (
      navbarRef.current &&
      !navbarRef.current.contains(target) &&
      ref.current &&
      !ref.current.contains(target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", detectOutClick);
    return () => {
      document.removeEventListener("click", detectOutClick);
    };
  }, []);*/

  return (
    <>
      <header
        className="flex box-xxl f-height-ms a-center j-start gap-m fixed f-top f-left z-index-xl second-bg base-border-b"
        //ref={navbarRef}
      >
        <div className="flex box-ms a-center j-start padding-l-ms">
          <Link href={"/"}>
            <Image
              className="f-height-s fit-contain border-radius-xxs zoom-out-xs"
              src={logo}
              alt="CodeFusion E-commerce Demo"
            />
          </Link>
        </div>

        <div className={`flex box-xxl a-center j-center gap-m`}>
          <div className="flex box-xxl relative base-bg border-radius-xxs">
            <input
              className="input-search border-radius-xxs third-shadow padding-l-xs padding-r-xl"
              onChange={(e) => onChangeSearch(e)}
              type="text"
              id="search"
              name="search"
              value={search ? search : ""}
              placeholder="Buscar categorias y productos"
              //readOnly={loading}
            />
            <FaSearch className="absolute base-color zoom-out-xl f-top f-right cursor-pointer margin-t-xs margin-r-s" />
          </div>

          {device > 1 && (
            <>
              <Link
                href={"/blog"}
                className={`btn-middle ${
                  pathname.includes("/blog") && "btn-active"
                }`}
              >
                Blog
              </Link>
              <Link
                href={"/contact"}
                className={`btn-middle ${
                  pathname.includes("/contact") && "btn-active"
                }`}
              >
                Contacto
              </Link>
            </>
          )}
        </div>

        <div className="flex box-ms a-center j-end gap-ms padding-r-ms">
          <ShoppingCart initState={false} />

          <ProfileMenu initState={false} />
        </div>
      </header>

      {isOpen && !refresh && (
        <div
          className={`flex ${
            device > 2 ? "wrap" : "column"
          } box-xxl f-height-full base-bg fixed f-top f-left z-index-l navbar-p-xs`}
          //ref={ref}
        >
          <SearchSidebar
            categories={searchedCategories}
            brands={searchedBrands}
            searchFormData={searchFormData}
            setSearchFormData={setSearchFormData}
          />
          <SearchBar
            products={searchedProducts}
            searchFormData={searchFormData}
            setSearchFormData={setSearchFormData}
            refresh={refresh}
            setRefresh={setRefresh}
            loading={loading}
            error={error}
            info={info}
          />

          {/*<IoIosCloseCircle
            className="absolute f-top f-left zoom-in-xxl base-color navbar-p-xs cursor-pointer"
            onClick={() => handleCloseFilters()}
          />*/}
        </div>
      )}

      {/*isOpen && (
        <>
          {device > 1 && (
            <SearchSidebar
              categories={searchedCategories}
              brands={searchedBrands}
              searchFormData={searchFormData}
              setSearchFormData={setSearchFormData}
            />
          )}

          <SearchBar
            products={searchedProducts}
            searchFormData={searchFormData}
            setSearchFormData={setSearchFormData}
            setRefresh={setRefresh}
            loading={loading}
            error={error}
            info={info}
          />
        </>
      )*/}
    </>
  );
}
