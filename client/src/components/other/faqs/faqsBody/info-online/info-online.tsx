"use client";
// info-online.tsx

import Link from "next/link";
// import "../faqsBody.css";

export default function InfoOnline() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Faqs Online information</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>What are the shipping methods for online orders?</h2>
        <h4>
          Shipping will have a shipping rate that will vary depending on the
          weight and volume of the products chosen, and the distance of the
          destination.
        </h4>
        <h2>
          What payment options do I have and what currencies do you accept when
          making an online purchase?
        </h2>
        <h4>
          Here you have all the information about the different
          <Link
            href={"/faqs/payment-methods"}
            className="second-color cursor-pointer"
          >
            payment methods
          </Link>
          you can use.
        </h4>
        <h2>¿Cómo puedo realizar una compra o pedido online?</h2>
        <h4>
          Here you have all the information with the
          <Link href={"/how-buy"} className="second-color cursor-pointer">
            step-by-step instructions to make a successful purchase.
          </Link>
        </h4>
        <h2>I have a discount coupon. How do I use it?</h2>
        <h4>
          When you click on ‘Place Order’, right in the lower right corner, you
          will find a box that says ‘Do you have a promotional code?’ Fill in
          this field with your discount coupon and then click on ‘Apply coupon’
          so that your discount is applied correctly.
        </h4>
        <h2>What cards are accepted for online purchases?</h2>
        <h4>Visa and MasterCard</h4>
        <h2>Can I pay cash on delivery?</h2>
        <h4>We do not have this option at the moment.</h4>
        <h2>Can I pay with PayPal?</h2>
        <h4>
          PayPal does not allow the use of its service for companies in this
          sector, so we do not currently offer payment through this platform.
        </h4>
        <h2>What is the safest way to pay on the website?</h2>
        <h4>
          The safest way to pay on our website is by paying with a credit or
          debit card, since payment is confirmed instantly and we can proceed
          with the processing and preparation of your order.
        </h4>
        <h2>Why do I get 'payment rejected'?</h2>
        <h4>
          Normally this situation is due to various problems with the bank. If
          you receive this message, please contact us immediately by phone or
          email, hellocodefusion@gmail.com.
        </h4>
        <h2>Can I buy by phone or WhatsApp?</h2>
        <h4>
          We do not recommend making purchases by phone or WhatsApp as problems
          may arise. You can contact us to receive information about different
          products, but to place orders, please do so from the website.
        </h4>
        <h2>My discount coupon does not work. How can I get another one?</h2>
        <h4>
          If you had one of our coupons and for any reason it has failed, do not
          worry. Contact us and explain your problem so that we can create a new
          coupon. Contact email hellocodefusion@gmail.com.
        </h4>
        <h2>
          What is the warranty for products purchased on ecommerce-demo.codefusion.cl?
        </h2>
        <h4>
          All products we offer on our website have a commercial guarantee from
          the supplier. e-commerce-web has an after-sales service while the
          guarantee is valid, the customer may contact the after-sales service
          at the email address hellocodefusion@gmail.com. In case of any other
          type of doubts or queries, you may contact the customer service
          telephone number.
        </h4>
      </div>
    </>
  );
}
