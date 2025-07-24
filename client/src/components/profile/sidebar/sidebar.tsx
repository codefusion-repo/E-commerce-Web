"use client";
// sidebar.tsx

import { useAuth } from "../../../context/auth/authContext";
//import "./sidebar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function Sidebar() {
  const { device } = useMobile();
  const { isAuthenticated } = useAuth();

  const pathname = usePathname();
  return (
    <div
      className={`flex ${
        device > 2 ? "box-s m-height-l margin-t-l" : "box-xxl m-height-xxs"
      } wrap a-center j-center`}
    >
      {isAuthenticated && (
        <>
          <div
            className={`flex ${
              device > 2 ? "f-width-ml" : "f-width-m"
            } padding-s j-center`}
          >
            <Link
              href={"/profile"}
              className={`btn-middle ${
                pathname === "/profile" && "btn-active"
              }`}
            >
              <h4>Personal data</h4>
            </Link>
          </div>
          <div
            className={`flex ${
              device > 2 ? "f-width-ml" : "f-width-m"
            } padding-s j-center`}
          >
            <Link
              href={"/profile/purchases"}
              className={`btn-middle ${
                pathname.includes("/profile/purchases") && "btn-active"
              }`}
            >
              <h4>Purchases</h4>
            </Link>
          </div>
          <div
            className={`flex ${
              device > 2 ? "f-width-ml" : "f-width-m"
            } padding-s j-center`}
          >
            <Link
              href={"/profile/addresses"}
              className={`btn-middle ${
                pathname === "/profile/addresses" && "btn-active"
              }`}
            >
              <h4>Addresses</h4>
            </Link>
          </div>
        </>
      )}
      {/*!isAuthenticated && (
        <>
          <div className="profile-sidebar-item">
            <Link href={"/auth/register"} className="btn-large">
              <h4>Registro</h4>
            </Link>
          </div>
          <div className="profile-sidebar-item">
            <Link href={"/auth/login"} className="btn-large">
              <h4>Iniciar sesión</h4>
            </Link>
          </div>
        </>
      )*/}
      <div
        className={`flex ${
          device > 2 ? "f-width-ml" : "f-width-m"
        } padding-s j-center`}
      >
        <Link
          href={"/settings"}
          className={`btn-middle ${pathname === "/settings" && "btn-active"}`}
        >
          <h4>Settings</h4>
        </Link>
      </div>
    </div>
  );
}
