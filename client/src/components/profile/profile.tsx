"use client";
// profile.tsx

//import "./profile.css";
import { useAuth } from "../../context/auth/authContext";
import Sidebar from "./sidebar/sidebar";
import { useMobile } from "../../context/mobile/mobileContext";
import { usePathname } from "next/navigation";
import { useModal } from "../../context/modal/modalContext";

export default function Profile({ children }: { children: React.ReactNode }) {
  const { device } = useMobile();
  const { user } = useAuth();
  const { openModal } = useModal();
  const pathname = usePathname();
  return (
    <>
      {user || pathname.includes("/settings") ? (
        <div
          className={`flex ${
            device > 2 ? "box-xl" : "box-xxl-m"
          } wrap a-start margin-center second-bg padding-ms margin-t-l margin-b-l border-radius-xxs`}
        >
          <div className="flex box-xxl m-height-xxs column a-center j-center padding-xs base-border-b">
            {user && <h3>{user?.email}</h3>}
          </div>

          <Sidebar />

          <div
            className={`flex ${
              device > 2 ? "box-l base-border-l" : "box-xxl  base-border-t"
            }  m-height-xxl a-start j-start padding-s`}
          >
            {children}
          </div>
        </div>
      ) : (
        <div className="flex box-xxl f-height-xxxl a-start j-center navbar-p-xs">
          <div className="flex f-width-xxxl f-height-l column a-center j-center gap-s second-bg border-radius-xs">
            <h1>Not authenticated</h1>
            <h2>You don't have access to this page, please log in again</h2>
            <button
              onClick={() => openModal("login", null)}
              className="btn-middle btn-active"
            >
              Log in
            </button>
          </div>
        </div>
      )}
    </>
  );
}
