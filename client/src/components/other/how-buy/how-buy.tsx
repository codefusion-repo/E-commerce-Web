"use client";
// how-buy.tsx

// import "./how-buy.css";
import Order from "../../../assets/how-buy/order.png";
import CouponCode from "../../../assets/how-buy/coupon-code.png";
import ShopcartPage from "../../../assets/how-buy/shopcart-page.png";
import ShopcartEmpty from "../../../assets/how-buy/shopcart-empty.png";
import ShopcartNoEmpty from "../../../assets/how-buy/shopcart-no-empty.png";
import ExampleProduct from "../../../assets/how-buy/exampleProduct.png";
import PaymentMethods from "../../../assets/how-buy/paymentMethods.png";
import Image from "next/image";
import { useMobile } from "../../../context/mobile/mobileContext";

export default function HowBuy() {
  const { device } = useMobile();
  return (
    <div
      className={`flex wrap ${
        device > 2 ? "box-xl" : "box-xxl-m"
      } a-center j-center margin-t-l margin-b-l`}
    >
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>How to buy on our website?</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h4>
          Before you start shopping, look at the top right hand side of the site
          where the basket is at 0. right where the cart is at 0. That is your
          cart waiting to be filled. If this is the first time you are going to
          make your purchase, we recommend opening this step-by-step in another
          browser tab, so we can help you through the process.
        </h4>
        <Image
          className={`${
            device > 0 ? "f-width-xxxl" : "f-width-xxxxl"
          } padding-l-s`}
          src={ShopcartEmpty}
          alt="ShopcartEmpty"
        />

        <h4>
          We are going to place an example order with the &quot;1-Sample product&quot;
        </h4>
        <Image
          className={`${device > 2 ? "f-width-l" : "box-xxl"} padding-l-s`}
          src={ExampleProduct}
          alt="exampleProduct"
        />
        <h4>
          Click on the button with the basket icon, you will see that in the top
          of the website on the right, the basket has been updated and now 1
          added article appears.
        </h4>

        <Image
          className={`${
            device > 0 ? "f-width-xxxl" : "f-width-xxxxl"
          } padding-l-s`}
          src={ShopcartNoEmpty}
          alt="ShopcartNoEmpty"
        />
        <h4>
          If everything is correct, click &quot;Buy&quot;. Next, we explain the steps to
          carry out the ordered correctly.
        </h4>

        <h2>1. Customer data</h2>
        <h4>
          It can be requested when registering or logging in to fill in your
          details personal.
        </h4>
        <h2>2. Addresses</h2>
        <h4>
          Next, it will ask for the shipping address, it is important that this
          data is completed correctly so that there is no error in the delivery
          time. Once the information is complete and reviewed, click click
          “continue”
        </h4>
        <h2>3. Shipping method</h2>
        <h4>Select the shipping method.</h4>
        <h2>4. Payment</h2>
        <h4>
          We use Mercado Pago and Flow so you can pay securely by card.
        </h4>
        <h4>- Mercado Pago</h4>
        <h4>- Flow</h4>
        <Image
          className={`${device > 2 ? "box-xxl" : "box-xxl"} padding-l-xxs`}
          src={PaymentMethods}
          alt="PaymentMethods"
        />
        <h2>5. Order modification</h2>
        <h4>
          Before placing the order, you have the option to modify the order
          either by adding more of the same product or eliminating. Or yes If
          you have left something unadded to your basket, you can go back and
          continue shopping.
        </h4>
        <Image
          className={`${device > 2 ? "box-xxl" : "box-xxl"} padding-l-s`}
          src={ShopcartPage}
          alt="ShopcartPage"
        />

        <h3>6. Promotional code</h3>
        <h4>
          If you have a promotional code, you can add it in the box that We
          teach you below.
        </h4>
        <Image
          className={`${device > 2 ? "f-width-xxxl" : "box-xxl"} padding-l-m`}
          src={CouponCode}
          alt="CouponCode"
        />

        <h2>7. Total amount</h2>
        <h4>
          Check the order total and if any codes have been inserted discount,
          verify that it is reflected in the total amount.
        </h4>
        <h2>8. Leave us a message or comment</h2>
        <h4>
          Clicking on &apos;Shipping Method&apos; at the bottom will bring up a box in
          which you can leave us any type of information relevant to your order
          so that we take it into account when its preparation or shipment. As
          well as any communication that helps us to improve our service.
        </h4>
        <h2>9. How to pay</h2>
        <h4>
          By clicking select one of the shipping methods you will be redirected
          to the corresponding payment page, once completed the payment process,
          you will be redirected back to our website, in where you can find out
          the status of your order.
        </h4>

        <Image
          className={`${device > 2 ? "f-width-xxxxl" : "box-xxl"}`}
          src={Order}
          alt="Order"
        />
        <h4>
          Remember that whatever payment method you choose, you will always
          receive confirmation emails from us, one confirmation from order and a
          purchase confirmation. Once the order leaves the store, we will send
          you an email with the tracking number so that You can see the status
          of your purchase and when it will arrive to your destination. If you
          have any questions about this, you can contact We will be happy to
          help you.
        </h4>
      </div>
    </div>
  );
}
