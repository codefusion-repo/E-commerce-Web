"use client";
// delivery.tsx

import "./delivery.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useModal } from "../../../context/modal/modalContext";
import Selected from "./selected/selected";
import Add from "./add/add";
import Default from "./default/default";
import Editor from "./editor/editor";
import Delete from "./delete/delete";
import regions from "./coverageRegions.json";
import { useAuth } from "../../../context/auth/authContext";
import { AddressType, UserType } from "../../../interfaces/auth/authInterface";
import { useCheckout } from "../../../context/checkout/checkoutContext";

export default function Delivery() {
  const { isAuthenticated, user } = useAuth();
  const { openModal } = useModal();
  const { setCheckoutStatus } = useCheckout();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      if (!pathname.includes("checkout")) {
        router.push("/");
      } else {
        router.push("/shopcart");
      }
      openModal("login", "Debes ingresar a tu cuenta para continuar");
    }
  }, [isAuthenticated, openModal, pathname, router]);

  const [address, setAddress] = useState<AddressType | undefined>(undefined);

  const [status, setStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initDelivery = (user: UserType) => {
      let isDefault: string = "default";
      let isCheckoutStatus: number = 0;

      if (user.addresses) {
        user.addresses.forEach((address) => {
          if (address.isDefault) {
            isDefault = "selected";
            isCheckoutStatus = 1;
          }
        });
      }
      if (user.addresses.length === 0) {
        isDefault = "add";
        isCheckoutStatus = 0;
      }
      setCheckoutStatus(isCheckoutStatus);
      setStatus(isDefault);
    };
    const initAddress = (user: UserType) => {
      let isDefault: string = "default";

      if (user.addresses.length === 0) {
        isDefault = "add";
      }
      setStatus(isDefault);
    };
    if (!status && user && !pathname.includes("checkout")) {
      initAddress(user);
    }
    if (!status && user && pathname.includes("checkout")) {
      initDelivery(user);
    }
  }, [pathname, setCheckoutStatus, status, user]);

  return (
    <>
      {isAuthenticated && (
        <div className="delivery-panel flex box-xxl column a-start j-start">
          {status === "selected" && <Selected setStatus={setStatus} />}
          {status === "default" && (
            <Default setStatus={setStatus} setAddress={setAddress} />
          )}
          {status === "add" && <Add setStatus={setStatus} regions={regions} />}
          {status === "edit" && address && (
            <Editor setStatus={setStatus} regions={regions} address={address} />
          )}
          {status === "delete" && address && (
            <Delete setStatus={setStatus} address={address} />
          )}
        </div>
      )}
    </>
  );
}
