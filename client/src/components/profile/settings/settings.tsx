"use client";
// settings.tsx

// import "./settings.css";
import { useAuth } from "../../../context/auth/authContext";
import {
  FaEdit,
  FaLink,
  FaUnlink,
  FaExchangeAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { useState } from "react";
import { useModal } from "../../../context/modal/modalContext";
import { useSettings } from "../../../context/settings/settingsContext";
import { postLinkProvider, postUnlinkProvider } from "./api/action";
import { useFirebase } from "../../../context/firebase/firebaseContext";
import Image from "next/image";
import loadingGif from "../../../assets/cargando/loading2.gif";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function Settings() {
  const { device } = useMobile();
  const { auth } = useFirebase();
  const { user, isAuthenticated, setFirebaseUser, signOutAuthState } =
    useAuth();
  const {
    linkedProviders,
    areMessagesActive,
    activateMessages,
    deactivateMessages,
    areCookiesActive,
    activateCookies,
    deactivateCookies,
    syncProviders,
  } = useSettings();
  const { openModal } = useModal();

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const changeEmail = () => {
    setError(null);
    setInfo(null);

    let isPasswordLinked: boolean = false;

    linkedProviders?.forEach((provider) => {
      if (provider.providerId === "password" && provider.linked) {
        isPasswordLinked = true;
      }
    });

    if (isPasswordLinked) {
      openModal("changeEmail", null);
    } else {
      setError("You must set up a password to change your email address");
      return;
    }
  };

  const changePassword = () => {
    setError(null);
    setInfo(null);

    openModal("changePassword", null);
  };

  const deleteAccount = () => {
    setError(null);
    setInfo(null);

    openModal("deleteAccount", null);
  };

  const handleMessageActivation = () => {
    setError(null);
    setInfo(null);

    if (areMessagesActive === true) {
      deactivateMessages();
      setInfo("Deactivated messages");
    } else if (areMessagesActive === false) {
      activateMessages();
      setInfo("Activated messages");
    }
  };

  const handleCookieActivation = () => {
    setError(null);
    setInfo(null);

    if (areCookiesActive === true) {
      deactivateCookies();
      setInfo("Cookies disabled");
    } else if (areCookiesActive === false) {
      activateCookies();
      setInfo("Cookies enabled");
    }
  };

  const linkProvider = (providerId: string) => {
    setError(null);
    setInfo(null);
    setLoading(true);

    if (providerId === "password") {
      setLoading(false);
      openModal("setPassword", null);
    } else {
      postLinkProvider(
        providerId,
        auth,
        signOutAuthState,
        setFirebaseUser,
        syncProviders
      )
        .then((info) => {
          setError(null);
          setInfo(info);
          setLoading(false);
        })
        .catch((err) => {
          setInfo(null);
          setError(err);
          setLoading(false);
        });
    }
  };

  const unlinkProvider = (providerId: string) => {
    setError(null);
    setInfo(null);
    setLoading(true);

    let isAnyLinked: number = 0;

    linkedProviders?.forEach((provider) => {
      if (provider.linked) {
        isAnyLinked += 1;
      }
    });

    if (isAnyLinked <= 1) {
      setError("You must have at least one linked account provider");
      setLoading(false);
      return;
    }

    if (providerId === "password") {
      setLoading(false);
      openModal("changePassword", null);
    } else {
      postUnlinkProvider(
        providerId,
        auth,
        signOutAuthState,
        setFirebaseUser,
        syncProviders
      )
        .then((info) => {
          setError(null);
          setInfo(info);
          setLoading(false);
        })
        .catch((err) => {
          setInfo(null);
          setError(err);
          setLoading(false);
        });
    }
  };

  return (
    <div className="flex box-xxl wrap j-center a-start">
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs base-border-b">
        <h1>Settings</h1>
      </div>
      {loading && (
        <div className="flex box-xxl m-height-xxs column a-center j-center padding-xxs base-border-b">
          <Image className="f-height-xxs" src={loadingGif} alt="Loading..." />
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
      <div className="flex box-xxl wrap a-center j-center padding-l-xs padding-r-xs">
        {isAuthenticated && (
          <div className="flex box-xxl wrap padding-s base-border-b">
            <div
              className={`flex ${
                device > 0 ? "box-l" : "box-xxl"
              } column a-start j-center gap-xxs`}
            >
              <h4>Change email</h4>
              <h4>{user?.email}</h4>
            </div>
            <div
              className={`flex ${
                device > 0 ? "box-s" : "box-xxl padding-t-s"
              } a-end j-end gap-s`}
            >
              <button
                onClick={() => changeEmail()}
                disabled={loading}
                className="btn-small btn-active"
              >
                <FaEdit className="zoom-out-xxl" />
              </button>
            </div>
          </div>
        )}

        <div className="flex box-xxl wrap padding-s base-border-b">
          <div
            className={`flex ${
              device > 0 ? "box-l" : "box-xxl"
            } column a-start j-center gap-xxs`}
          >
            <h4>Activate/Deactivate messages</h4>
          </div>

          <div
            className={`flex ${
              device > 0 ? "box-s" : "box-xxl padding-t-s"
            } a-end j-end gap-s`}
          >
            <button
              onClick={() => handleMessageActivation()}
              className="checkbox"
            >
              {areMessagesActive ? (
                <div className={"checkbox-center-active"}></div>
              ) : (
                <div className={"checkbox-center"}></div>
              )}
            </button>
          </div>
        </div>
        <div className="flex box-xxl wrap padding-s base-border-b">
          <div
            className={`flex ${
              device > 0 ? "box-l" : "box-xxl"
            } column a-start j-center gap-xxs`}
          >
            <h4>Enable/Disable unnecessary cookies</h4>
          </div>
          <div
            className={`flex ${
              device > 0 ? "box-s" : "box-xxl padding-t-s"
            } a-end j-end gap-s`}
          >
            <button
              onClick={() => handleCookieActivation()}
              className="checkbox"
            >
              {areCookiesActive ? (
                <div className={"checkbox-center-active"}></div>
              ) : (
                <div className={"checkbox-center"}></div>
              )}
            </button>
          </div>
        </div>
        {isAuthenticated && (
          <div className="flex box-xxl wrap padding-s base-border-b">
            <div
              className={`flex ${
                device > 0 ? "box-l" : "box-xxl"
              } column a-start j-center gap-xxs`}
            >
              <h4>Delete account</h4>
              <h4>{user?.email}</h4>
            </div>
            <div
              className={`flex ${
                device > 0 ? "box-s" : "box-xxl padding-t-s"
              } a-end j-end gap-s`}
            >
              <button
                onClick={() => deleteAccount()}
                disabled={loading}
                className="btn-small btn-active"
              >
                <FaTrashAlt className="zoom-out-xxl" />
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <div className="flex box-xxl wrap padding-s base-border-b">
            <h4>Link/Unlink account provider</h4>
            <div className="flex wrap box-xxl a-center j-center">
              {linkedProviders &&
                linkedProviders.map((provider, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      device > 1 ? "box-m" : "box-xxl"
                    } f-height-xs a-center`}
                  >
                    {provider.linked ? (
                      <div className="flex gap-xs a-center">
                        <button
                          disabled={loading}
                          className="btn-small btn-active scale-xxs"
                          onClick={() => {
                            setInfo(null);
                            setError(
                              `Provider ${provider.providerName} already linked`
                            );
                          }}
                        >
                          {provider.icon}
                        </button>

                        <button
                          disabled={loading}
                          className="btn-small btn-active scale-xxs"
                          onClick={() => unlinkProvider(provider.providerId)}
                        >
                          {provider.providerId === "password" ? (
                            <FaExchangeAlt className="zoom-out-xxl" />
                          ) : (
                            <FaUnlink className="zoom-out-xxl" />
                          )}
                        </button>
                        <div>
                          <h6>{provider.email}</h6>
                          <h6>{provider.name}</h6>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-xs a-center">
                        <button
                          disabled={loading}
                          className="btn-small btn-active scale-xxs"
                          onClick={() => linkProvider(provider.providerId)}
                        >
                          {provider.icon}
                        </button>
                        <button
                          disabled={loading}
                          className="btn-small btn-active scale-xxs"
                          onClick={() => linkProvider(provider.providerId)}
                        >
                          <FaLink className="zoom-out-xxl" />
                        </button>

                        <div>
                          <h5>Not linked</h5>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
