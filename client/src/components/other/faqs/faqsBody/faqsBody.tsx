"use client";
import { useMobile } from "../../../../context/mobile/mobileContext";
// faqsBody.tsx

import Link from "next/link";

export default function FaqsBody() {
  const { device } = useMobile();
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Faqs</h1>
      </div>
      <div className="flex wrap box-xxl a-start j-center padding-s gap-xxl">
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Contact</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="mailto:contacto@esgrow.com" className="btn-span">
              hellocodefusion@gmail.com
            </Link>
            <Link href="tel:+569xxxxxxxx" className="btn-span">
              +569 xxxx xxxx
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>My account</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/faqs/my-account" className="btn-span">
              Create account
            </Link>
            <Link href="/faqs/my-account" className="btn-span">
              Recover password
            </Link>
            <Link href="/faqs/my-account" className="btn-span">
              Modify personal data
            </Link>
            <Link href="/faqs/my-account" className="btn-span">
              Purchase history
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Online information</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/faqs/payment-methods" className="btn-span">
              Payment methods
            </Link>
            <Link href="/faqs/info-online" className="btn-span">
              Online order info
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl ">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>My order online</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/faqs/my-order-online" className="btn-span">
              Order tracking
            </Link>
            <Link href="/faqs/my-order-online" className="btn-span">
              Order online
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>E-commerce web Services</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/blog" className="btn-span">
              Blog
            </Link>
          </div>
        </div>
        <div className="flex column f-width-xl">
          <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
            <h1>Returns and exchanges</h1>
          </div>
          <div className="flex column box-xxl padding-xs">
            <Link href="/faqs/returns-exchanges" className="btn-span">
              Returns and exchanges
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
