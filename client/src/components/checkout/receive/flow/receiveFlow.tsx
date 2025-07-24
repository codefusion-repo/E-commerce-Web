"use client";
// receiveFlow.tsx

//import "./receiveFlow.css";
import { useRouter } from "next/navigation";
import { useMessages } from "../../../../context/messages/messagesContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import loadingGif from "../../../../assets/cargando/loading2.gif";
import { getProfile } from "../../../../components/profile/profileEditor/api/action";
import { useAuth } from "../../../../context/auth/authContext";
import { useShopcart } from "../../../../context/shopcart/shopcartContext";

export default function ReceiveFlow({
  receive,
  detail,
}: {
  receive: string;
  detail: string;
}) {
  const { setUser, signOutAuthState } = useAuth();
  const { addMessage } = useMessages();

  const { clearShop } = useShopcart();

  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>("Receiving payment");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getProfile(signOutAuthState)
      .then((res) => {
        setUser(res.data.user);

        clearShop();

        if (detail && receive) {
          setError(detail);
          setInfo("Redirecting...");
          addMessage(detail);
          router.push(receive);
        }
      })
      .catch((err) => {
        setInfo("Redirecting...");
        setError(err);
      });
  }, [detail, receive]);

  return (
    <>
      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Loading..." />
        </div>
      )}
      {error && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <h3>{error}</h3>
        </div>
      )}
      {info && (
        <div className="flex box-xxl m-height-xxs column a-end j-end">
          <h3>{info}</h3>
        </div>
      )}
    </>
  );
}
