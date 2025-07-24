"use client";
// profileMenu.tsx

import "./profileMenu.css";
import { useEffect, useRef, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { BiPackage, BiLogOut, BiLogInCircle } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { useAuth } from "../../../../context/auth/authContext";
import { useModal } from "../../../../context/modal/modalContext";
import Link from "next/link";
import { BsFileRichtextFill } from "react-icons/bs";
import { GrContact, GrMenu } from "react-icons/gr";
import logo from "../../../../assets/logo1.jpg";
import { useMobile } from "../../../../context/mobile/mobileContext";

export default function ProfileMenu({ initState }: { initState: boolean }) {
  const { device } = useMobile();
  const { isAuthenticated, signOutAuthState } = useAuth();
  const { openModal } = useModal();

  const [isOpen, setIsOpen] = useState(initState);

  const profileMenuBoxRef = useRef<HTMLDivElement>(null);
  const profileMenuButtonRef = useRef<HTMLDivElement>(null);

  const handleProfileMenu = () => {
    setIsOpen(!isOpen);
  };

  const detectOutClick = (e: MouseEvent) => {
    // Asegúrate de que el evento es del tipo MouseEvent
    const target = e.target as Node; // Cast e.target a Node para usar el método contains

    if (
      profileMenuBoxRef.current &&
      !profileMenuBoxRef.current.contains(target) &&
      profileMenuButtonRef.current &&
      !profileMenuButtonRef.current.contains(target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", detectOutClick);
    return () => {
      document.removeEventListener("click", detectOutClick);
    };
  }, []);

  return (
    <div className="flex relative">
      <div ref={profileMenuButtonRef}>
        <button
          className={`btn-small ${isOpen && "btn-active"}`}
          onClick={() => handleProfileMenu()}
        >
          <FaRegUserCircle className="zoom-in-xxl" />
          {/*!navbarMobileStyle ? (
            <FaRegUserCircle className="icon" />
          ) : (
            <GrMenu className="icon" />
          )*/}
        </button>
      </div>
      {isOpen && (
        <div
          className="flex f-width-ml gap-xs column fixed f-top f-right navbar-m-s margin-r-s padding-s second-bg base-border border-radius-xxs"
          ref={profileMenuBoxRef}
        >
          {device <= 1 && (
            <>
              <Link href={"/blog"} className="flex btn-span j-space">
                <h3>Blog</h3>
                <BsFileRichtextFill className="zoom-out-xxl" />
              </Link>
              <Link href={"/contact"} className="flex btn-span j-space">
                <h3>Contact</h3>
                <GrContact className="zoom-out-xxl" />
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <>
              <Link href={"/profile"} className="flex btn-span j-space">
                <h3>Account</h3>
                <FaRegUserCircle className="zoom-out-xxl" />
              </Link>
              <Link
                href={"/profile/purchases"}
                className="flex btn-span j-space"
              >
                <h3>Purchases</h3>
                <BiPackage className="zoom-out-xxl" />
              </Link>
              <Link href={"/settings"} className="flex btn-span j-space">
                <h3>Settings</h3>
                <IoMdSettings className="zoom-out-xxl" />
              </Link>

              <button
                onClick={() => signOutAuthState()}
                className="flex btn-span j-space"
              >
                <h3>Log out</h3>
                <BiLogOut className="zoom-out-xxl" />
              </button>
            </>
          ) : (
            <>
              <Link href={"/settings"} className="flex btn-span j-space">
                <h3>Settings</h3>
                <IoMdSettings className="zoom-out-xxl" />
              </Link>
              <button
                className="flex btn-span j-space"
                onClick={() => openModal("register", null)}
              >
                <h3>Register</h3>
                <FaRegUserCircle className="zoom-in-xxl" />
              </button>
              <button
                className="flex btn-span j-space"
                onClick={() => openModal("login", null)}
              >
                <h3>Login</h3>
                <BiLogInCircle className="zoom-in-xxl" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
