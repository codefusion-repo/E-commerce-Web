"use client";
// product.tsx

//import "./product.css";
import { useShop } from "../../../../context/shop/shopContext";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { useAuth } from "../../../../context/auth/authContext";
import {
  FaTruck,
  FaCreditCard,
  FaWhatsapp,
  FaMinusCircle,
  FaPlusCircle,
} from "react-icons/fa";
import { verifyStockInputFromPage } from "./api/action";
import { useRouter } from "next/navigation";
import Stars from "./comment/stars";
import UserComment from "./comment/userComment";
import Pagination from "../../../../components/pagination/pagination";
import Link from "next/link";
import { useShopcart } from "../../../../context/shopcart/shopcartContext";
import {
  CommentType,
  ProductType,
} from "../../../../interfaces/shop/shopInterface";
import { useMobile } from "../../../../context/mobile/mobileContext";

export default function Product({ slugProduct }: { slugProduct: string }) {
  const { device } = useMobile();
  const { products } = useShop();

  const [product, setProduct] = useState<ProductType>();

  useEffect(() => {
    setProduct(products.find((p) => p.slug === slugProduct));
  }, [products]);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const { items, updateItemQuantity } = useShopcart();
  const { isAuthenticated, user } = useAuth();

  const [selectedPanel, setSelectedPanel] = useState<string>("content");

  const [mainImage, setMainImage] = useState<string>();

  useEffect(() => {
    const setInput = (productQuantity: number) => {
      let inputs = document.querySelectorAll(
        `#item_detailt_input_${product && product.id}`
      ) as NodeListOf<HTMLInputElement>;
      if (inputs) {
        inputs.forEach((input) => {
          input.value = productQuantity.toString();
        });
      }
    };

    setInput(productQuantity);
  }, [productQuantity]);

  const handleUpdateQuantityItem = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    try {
      if (!product) {
        return;
      }

      let quantity = parseInt(e.target.value);

      setError(null);
      setInfo(null);
      setLoading(true);

      if (quantity > 5) {
        setInfo(
          `Subtotal: ${Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(5 * product.price)}`
        );
        setProductQuantity(5);
      } else if (quantity < 0) {
        setInfo(
          `Subtotal: ${Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(5 * product.price)}`
        );
        setProductQuantity(5);
      } else if (quantity <= 0) {
        //setError("Presiona quitar para borrar el producto");
      } else if (!quantity) {
        //setError("Presiona quitar para borrar el producto");
      } else {
        setInfo(
          `Subtotal: ${Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(quantity * product.price)}`
        );
      }

      setLoading(false);
    } catch (err) {
      setError("Invalid number");
      setLoading(false);
      return;
    }
  };

  const handleAddItem = () => {
    if (!product) {
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    if (productQuantity + 1 > 5) {
      setInfo(
        `Subtotal: ${Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format(5 * product.price)}`
      );
    } else {
      setInfo(
        `Subtotal: ${Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format((productQuantity + 1) * product.price)}`
      );
      setProductQuantity(productQuantity + 1);
    }

    setLoading(false);
  };
  const handleRemoveItem = () => {
    if (!product) {
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    if (productQuantity - 1 <= 0) {
    } else {
      setInfo(
        `Subtotal: ${Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
        }).format((productQuantity - 1) * product.price)}`
      );
      setProductQuantity(productQuantity - 1);
    }

    setLoading(false);
  };
  const handleAddProductFromPage = (quantity: number) => {
    if (!product) {
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    verifyStockInputFromPage(product.id, quantity, items).then((status) => {
      if (status === "exceed") {
        setInfo(`You have ${5} in the shopping cart`);
        updateItemQuantity(product, 5);
      } else if (status === "stock") {
        setInfo(`You have ${5} in the shopping cart`);
        updateItemQuantity(product, 5);
      } else if (status === "limit") {
        //setError("Presiona quitar para borrar el producto");
      } else if (typeof status === "number") {
        setInfo(`You have ${status} in the shopping cart`);
        updateItemQuantity(product, status);
      }
      setLoading(false);
    });
  };

  const router = useRouter();

  const handleBuyProductFromPage = (quantity: number) => {
    if (!product) {
      return;
    }

    setError(null);
    setInfo(null);
    setLoading(true);

    verifyStockInputFromPage(product.id, quantity, items).then((status) => {
      if (status === "exceed") {
        setInfo(`You have ${5} in the shopping cart`);
        updateItemQuantity(product, 5);
      } else if (status === "stock") {
        setInfo(`You have ${5} in the shopping cart`);
        updateItemQuantity(product, 5);
      } else if (status === "limit") {
        //setError("Presiona quitar para borrar el producto");
      } else if (typeof status === "number") {
        setInfo(`You have ${status} in the shopping cart`);
        updateItemQuantity(product, status);
      }
      setLoading(false);
    });

    router.push("/shopcart");
  };

  const onClickPanel = (panel: string) => {
    setSelectedPanel(panel);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [data, setData] = useState<CommentType[]>(
    product && product.comments ? product.comments : []
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  useEffect(() => {
    if (product) {
      setMainImage(product.thumbnail);
      setData(product.comments);
    }
  }, [product]);

  const getPath = (product: ProductType) => {
    const pathParts = {
      special: "",
      specialId: "",
      category: "",
      categoryId: "",
      brand: "",
      brandId: "",
    };

    product &&
      product.categories.forEach((category) => {
        if (category.type === "special") {
          pathParts.special = category.name;
          pathParts.specialId = category.slug;
        }
        if (category.type === "category") {
          pathParts.category = category.name;
          pathParts.categoryId = category.slug;
        }
        if (category.type === "brand") {
          pathParts.brand = category.name;
          pathParts.brandId = category.slug;
        }
      });

    return (
      <div className="flex wrap a-center">
        {pathParts.special && (
          <>
            <h4>/</h4>
            <Link href={`/shop/${pathParts.specialId}`} className="btn-span">
              <h4>{pathParts.special}</h4>
            </Link>
          </>
        )}
        {pathParts.category && (
          <>
            <h4>/</h4>
            <Link href={`/shop/${pathParts.categoryId}`} className="btn-span">
              <h4>{pathParts.category}</h4>
            </Link>
          </>
        )}
        {pathParts.brand && (
          <>
            <h4>/</h4>
            <Link href={`/shop/${pathParts.brandId}`} className="btn-span">
              <h4>{pathParts.brand}</h4>
            </Link>
          </>
        )}
        <div className="flex a-center gap-xs">
          <h4>/</h4>
          <h4>{product && product.name}</h4>
        </div>
      </div>
    );
  };

  return (
    <>
      {products.find((p) => p.slug === slugProduct) ? (
        <>
          {product && (
            <>
              <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
                {getPath(product)}
              </div>
              <div
                className={`flex ${
                  device > 3 ? "box-xl wrap" : "box-xxl-m wrap-reverse"
                } second-border-b`}
              >
                <div
                  className={`flex column ${
                    device > 2 ? "box-ms second-border-r" : "box-xxl"
                  } j-center four-bg hidden padding-s`}
                >
                  <div className="flex box-xxl">
                    {mainImage && (
                      <img
                        className="f-width-full f-height-xxl"
                        src={`${mainImage}`}
                        alt={product.name}
                      />
                    )}
                  </div>
                  <div className="flex wrap box-xxl j-center gap-s margin-t-s">
                    <img
                      className="f-width-s f-height-s cursor-pointer border-radius-xs zoom-out-xs"
                      src={`${product.thumbnail}`}
                      alt={product.name}
                      onClick={() => setMainImage(product.thumbnail)}
                    />
                    {product.images.map((image, index) => (
                      <img
                        key={index}
                        className="f-width-s f-height-s cursor-pointer border-radius-xs zoom-out-xs"
                        src={`${image.image}`}
                        alt={product.name}
                        onClick={() => setMainImage(image.image)}
                      />
                    ))}
                  </div>
                </div>
                <div
                  className={`flex wrap ${
                    device > 2 ? "box-ml" : "box-xxl second-border-b"
                  } hidden padding-s`}
                >
                  <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
                    <h1>{product && product.name}</h1>
                  </div>

                  <div className="flex box-xxl m-height-xxs a-center j-space padding-xs second-border-b">
                    <div className="flex box-m a-center j-start padding-l-s padding-r-s">
                      <Stars
                        stars={product.stars}
                        comments_quantity={product.comments_quantity}
                        inCenter={false}
                      />
                    </div>

                    <div className="flex box-m a-center j-end padding-l-s padding-r-s">
                      {isAuthenticated ? (
                        <Link href="#product-comments" className="btn-span">
                          <h4>Write a comment</h4>
                        </Link>
                      ) : (
                        <Link href="#product-comments" className="btn-span">
                          <h4>See comments</h4>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex box-xxl m-height-s a-start second-border-b padding-ms">
                    <h4>{product.description}</h4>
                  </div>

                  <div
                    className={`flex ${
                      device > 1
                        ? "box-m second-border-r"
                        : "box-xxl second-border-b"
                    } column gap-s padding-ms`}
                  >
                    <h1>
                      Price:{" "}
                      {Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(product.price)}
                    </h1>
                    <h3>Name: {product.name}</h3>
                    <h3>Stock: {product.stock}</h3>
                    <h3>Code: {product.id.slice(4, 13)}</h3>
                  </div>
                  <div
                    className={`flex ${
                      device > 1 ? "box-m" : "box-xxl"
                    } t-center column gap-s padding-ms`}
                  >
                    <h5>Maximum 5 units per product</h5>
                    <div className="flex a-center j-center gap-xs">
                      <button
                        onClick={() => handleRemoveItem()}
                        className="btn-span"
                      >
                        <FaMinusCircle className="zoom-out-xl" />
                      </button>
                      <input
                        name="itemQuantity"
                        onChange={(e) => handleUpdateQuantityItem(e)}
                        className="input-quantity t-center second-bg"
                        type="number"
                        placeholder="0"
                        defaultValue={productQuantity}
                        id={`item_detailt_input_${product.id}`}
                      />
                      <button
                        onClick={() => handleAddItem()}
                        className="btn-span"
                      >
                        <FaPlusCircle className="zoom-out-xl" />
                      </button>
                    </div>
                    {loading && (
                      <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
                        <Image
                          className="f-height-xxs"
                          src={loadingGif}
                          alt="Loading..."
                        />
                      </div>
                    )}
                    {error && (
                      <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
                        <h4>{error}</h4>
                      </div>
                    )}
                    {info && (
                      <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
                        <h4>{info}</h4>
                      </div>
                    )}
                    <div className="flex box-xxl a-center j-center gap-ms">
                      <button
                        onClick={() =>
                          handleAddProductFromPage(productQuantity)
                        }
                        className="btn-middle btn-active"
                      >
                        Add
                      </button>
                      <button
                        onClick={() =>
                          handleBuyProductFromPage(productQuantity)
                        }
                        className="btn-middle btn-active"
                      >
                        Buy
                      </button>
                    </div>
                  </div>

                  <div className="flex box-xxl wrap a-center j-center second-border-t gap-s padding-t-ms">
                    <div className="flex f-width-ml column a-center j-center gap-xxs margin-t-xs">
                      <h1>
                        <FaTruck className="zoom-in-xxl base-color" />
                      </h1>
                      <div className="flex box-xxl column a-center j-center">
                        <h2>Home delivery</h2>
                        <h4>5 to 10 working days</h4>
                      </div>
                      <Link href={"/send-conditions"} className="btn-span">
                        <h5>Learn more...</h5>
                      </Link>
                    </div>
                    <div className="flex f-width-ml column a-center j-center gap-xxs margin-t-xs">
                      <h1>
                        <FaCreditCard className="zoom-in-xxl base-color" />
                      </h1>
                      <div className="flex box-xxl column a-center j-center">
                        <h2>Payment methods</h2>
                        <h4>Mercado Pago</h4>
                      </div>
                      <Link href={"/faqs/payment-methods"} className="btn-span">
                        <h5>Learn more...</h5>
                      </Link>
                    </div>
                    <div className="flex f-width-ml column a-center j-center gap-xxs margin-t-xs">
                      <h1>
                        <FaWhatsapp className="zoom-in-xxl base-color" />
                      </h1>
                      <div className="flex box-xxl column a-center j-center">
                        <h2>Need help?</h2>
                        <h4>WhatsApp al +569xxxxxxxx</h4>
                      </div>

                      <Link href={"/contact"} className="btn-span">
                        <h5>Learn more...</h5>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex column ${
                  device > 2 ? "box-ml" : "box-xxl-m"
                } m-height-s j-center second-bg margin-t-s border-radius-xs`}
              >
                <div className="flex box-xxl m-height-xxs column a-start j-center padding-s base-border-b">
                  <h1>Features</h1>
                </div>

                {product.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex box-xxl f-height-xs second-bg base-border-b padding-l-l padding-r-l border-radius-xs"
                  >
                    <div className="flex box-xxl a-center j-start">
                      <h3>{feature.param}</h3>
                    </div>
                    <div className="flex box-xxl a-center j-start">
                      <h3>{feature.value}</h3>
                    </div>
                  </div>
                ))}
              </div>
              <div
                id="product-comments"
                className={`flex column ${
                  device > 2 ? "box-xl" : "box-xxl-m"
                } a-center margin-t-s`}
              >
                <UserComment
                  comments={product.comments}
                  productId={product.id}
                />

                <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
                  <h1>Comments</h1>
                </div>

                {currentItems.length > 0 && (
                  <>
                    <div className="flex column box-xxl">
                      {currentItems &&
                        currentItems.map((comment, index) => (
                          <div
                            className={`flex box-xxl wrap a-center j-space ${
                              index + 1 !== currentItems.length &&
                              "second-border-b"
                            }`}
                            key={index}
                          >
                            <div
                              className={`flex ${
                                device > 0 ? "box-ml" : "box-xxl"
                              } column a-start j-center gap-xs padding-ms`}
                            >
                              <h4>User: {comment.user.first_name}</h4>
                              <h4>Comment: {comment.comment}</h4>
                            </div>

                            <div
                              className={`flex ${
                                device > 0 ? "box-xs" : "box-xxl"
                              } column gap-xs a-center j-center padding-ms`}
                            >
                              <h4>Rating:</h4>
                              <Stars
                                stars={parseFloat(comment.stars)}
                                comments_quantity={-1}
                                inCenter={true}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                    {data.length > itemsPerPage && (
                      <Pagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        data={data}
                      />
                    )}
                  </>
                )}

                {product.comments.length === 0 && (
                  <div className="flex box-xxl gap-m padding-ms">
                    <h4>There are no comments for this product.</h4>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex box-xxl f-height-xxxl a-start j-center navbar-p-xs">
          <div className="flex f-width-xxxl f-height-l column a-center j-center gap-s second-bg border-radius-xs">
            <h1>Page not found 404</h1>
            <h2>We were unable to complete the request</h2>
            <Link className="btn-middle btn-active" href="/">
              Return to home
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
