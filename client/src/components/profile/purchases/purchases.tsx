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
      openModal("login", "You must be authenticated to continue");
    }
  }, [isAuthenticated]);

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
        setError("You haven't made your first purchase yet");
      } else {
        setData(puchases);
      }
    };

    initShop(user?.purchases || []);

    //console.log("user: ", user);
  }, [user?.purchases]);

  return (
    <div className="flex box-xxl wrap j-center a-start">
      {isAuthenticated && user?.purchases && (
        <>
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
            <h1>Purchases</h1>
          </div>

          <div className="flex box-xxl column a-center j-center padding-l-xs padding-r-xs">
            {currentItems && currentItems.length > 0 && (
              <div className="flex box-xxl f-height-xs base-border-b">
                <div className="flex box-xxl a-center j-center">
                  <h3>Code</h3>
                </div>
                <div className="flex box-xxl a-center j-center">
                  <h3>Status</h3>
                </div>
                <div className="flex box-xxl a-center j-center">
                  <h3>Total</h3>
                </div>
                <div className="flex box-xxl a-center j-center">
                  <h3>Details</h3>
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
                          "Waiting for payment"}

                        {purchase.status === "created" &&
                          purchase.delivery.status === "created" &&
                          "Waiting for payment"}

                        {purchase.status === "payed" &&
                          purchase.delivery.status === "created" &&
                          "Preparing shipment"}

                        {purchase.status === "payed" &&
                          purchase.delivery.status === "receivedForCourier" &&
                          "Received by carrier"}

                        {purchase.status === "payed" &&
                          purchase.delivery.status === "inRoute" &&
                          "In transit"}
                        {purchase.status === "delivered" &&
                          purchase.delivery.status === "delivered" &&
                          "Delivered"}
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
                alt="Loading..."
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
