"use client";
// purchases.tsx

// import "./purchases.css";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { useAuth } from "../../../context/auth/authContext";
import { useEffect, useState } from "react";
import { FaLink } from "react-icons/fa";
import Pagination from "../../../components/pagination/pagination";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useModal } from "../../../context/modal/modalContext";
import { PurchaseType } from "../../../interfaces/auth/authInterface";

export default function Purchases() {
  const { user, isAuthenticated } = useAuth();
  const { openModal } = useModal();

  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      openModal("login", "Debes ingresar a tu cuenta para continuar");
    }
  }, [isAuthenticated, openModal, router]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [data, setData] = useState<PurchaseType[]>(user?.purchases || []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data?.slice(startIndex, endIndex);

  useEffect(() => {
    const initShop = (puchases: PurchaseType[]) => {
      if (puchases.length === 0) {
        setError("Aún no realizas tu primera compra de prueba");
      } else {
        setData(puchases);
      }
    };

    initShop(user?.purchases || []);
  }, [user?.purchases]);

  return (
    <div className="flex box-xxl wrap j-center a-start">
      {isAuthenticated && user?.purchases && (
        <>
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
            <h1>Compras</h1>
          </div>

          <div className="flex box-xxl column a-center j-center padding-l-xs padding-r-xs">
            {currentItems && currentItems.length > 0 && (
              <div className="flex box-xxl f-height-xs base-border-b">
                <div className="flex box-xxl a-center j-center">
                  <h3>Código</h3>
                </div>
                <div className="flex box-xxl a-center j-center">
                  <h3>Estado</h3>
                </div>
                <div className="flex box-xxl a-center j-center">
                  <h3>Total</h3>
                </div>
                <div className="flex box-xxl a-center j-center">
                  <h3>Detalle</h3>
                </div>
              </div>
            )}
            {currentItems &&
              currentItems.map((purchase) => (
                <div
                  className="flex box-xxl f-height-xs base-border-b"
                  key={purchase.code}
                >
                  <div className="flex box-xxl a-center j-center">
                    <h4>{purchase.code.slice(3, 10)}</h4>
                  </div>
                  <div className="flex box-xxl a-center j-center">
                    {purchase.delivery && (
                      <h5>
                        {purchase.status === "uncompleted" &&
                          purchase.delivery.status === "created" &&
                          "Esperando pago"}

                        {purchase.status === "created" &&
                          purchase.delivery.status === "created" &&
                          "Esperando pago"}

                        {purchase.status === "payed" &&
                          purchase.delivery.status === "created" &&
                          "Preparando envío"}

                        {purchase.status === "payed" &&
                          purchase.delivery.status === "receivedForCourier" &&
                          "Recibido por courier"}

                        {purchase.status === "payed" &&
                          purchase.delivery.status === "inRoute" &&
                          "En tránsito"}
                        {purchase.status === "delivered" &&
                          purchase.delivery.status === "delivered" &&
                          "Entregado"}
                      </h5>
                    )}
                  </div>
                  <div className="flex box-xxl a-center j-center">
                    <h4>
                      {Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(purchase.total)}
                    </h4>
                  </div>
                  <div className="flex box-xxl a-center j-center">
                    <Link
                      href={`/profile/purchases/purchase/${purchase.code}`}
                      className="btn-small btn-active scale-xxs"
                    >
                      <FaLink className="zoom-out-xxl" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
          {loading && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <Image
                className="f-height-xxs"
                src={loadingGif}
                alt="Cargando..."
              />
            </div>
          )}
          {error && (
            <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
              <h4>{error}</h4>
            </div>
          )}
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
    </div>
  );
}
