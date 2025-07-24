"use client";
// modal.tsx

//import "./modal.css";
import { useModal } from "../../context/modal/modalContext";
import { IoIosCloseCircle } from "react-icons/io";
import Register from "../auth/register/register";
import VerifyEmail from "../auth/verifyEmail/verifyEmail";
import Login from "../auth/login/login";
import ChangePassword from "../profile/settings/changePassword/changePassword";
import ChangeEmail from "../profile/settings/changeEmail/changeEmail";
import DeleteAccount from "../profile/settings/deleteAccount/deleteAccount";
import ForgotPassword from "../auth/forgotPassword/forgotPassword";
import { useAuth } from "../../context/auth/authContext";
import SetPassword from "../profile/settings/setPassword/setPassword";
import { useMobile } from "../../context/mobile/mobileContext";

export default function Modal() {
  const { device } = useMobile();

  const { isOpen, type, message, closeModal } = useModal();

  const { isAuthenticated } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="flex fade-in-xxs box-xxl m-height-full a-center j-center column fixed f-top f-left four-bg z-index-xxl">
          <div
            className={`flex ${
              device < 4 ? "box-xxl-m" : "box-ml"
            } m-height-s a-center j-center column relative padding-ms second-bg border-radius-xxs`}
          >
            {message && (
              <div className="flex box-xxl a-start j-start padding-l-ms padding-r-ms padding-b-ms">
                <h3>{message}</h3>
              </div>
            )}

            {type === "register" && <Register />}
            {type === "login" && <Login />}
            {type === "verifyEmail" && <VerifyEmail />}
            {type === "forgotPassword" && <ForgotPassword />}

            {isAuthenticated && type === "changeEmail" && <ChangeEmail />}
            {isAuthenticated && type === "setPassword" && <SetPassword />}
            {isAuthenticated && type === "changePassword" && <ChangePassword />}
            {isAuthenticated && type === "deleteAccount" && <DeleteAccount />}

            <div className="absolute f-top f-right padding-ms cursor-pointer scale-xxl base-color">
              <IoIosCloseCircle className="icon" onClick={() => closeModal()} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
