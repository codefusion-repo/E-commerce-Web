"use client";
import { useMobile } from "../../../context/mobile/mobileContext";
import Link from "next/link";
// send-conditions.tsx

// import "./send-conditions.css";

export default function SendConditions() {
  const { device } = useMobile();
  return (
    <div
      className={`flex wrap ${
        device > 2 ? "box-xl" : "box-xxl-m"
      } a-center j-center margin-t-l margin-b-l`}
    >
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Discreet and secure shipping with E-commerce-web</h1>
      </div>

      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>Terms and Conditions of Sale</h2>
        <h4>
          In E-commerce-web we make sales through the web page
          ecommerce-demo.codefusion.cl, where we ship to all Chile. Our Our packages
          are sent through Shipit, being these companies chosen for their
          responsibility, punctuality and the best service they offer to our
          customers. offer to our customers.
        </h4>
        <h2>Discreet shipments</h2>
        <h4>
          Our shipments are totally discreet, because we make sure that the
          products are wrapped and stored in boxes products are wrapped and
          stored in boxes where there are no marks or names that may or names of
          items that may be uncomfortable on reception. The shipment will be
          safe from prying eyes for the total peace of mind of our customers.
          tranquility of our clientele.
        </h4>
        <h2>Delivery times</h2>
        <h4>
          The order will be shipped to the address registered at the time of
          purchase within 24 hrs from the payment confirmation. The delivery
          time delivery by the carrier will be from 36 to 72 working hours, from
          Monday to Friday, except Monday to Friday, except holidays.
        </h4>
        <h4>
          Our fulfillment rate for this service is around 90% and we do not
          provide any type of no compensation is payable for late deliveries.
        </h4>
        <h4>Exceptions to established delivery deadlines.</h4>.
        <h4>Strikes in the transportation sector and road closures.</h4>
        <h4>Difficult to access areas or with low population density.</h4>
        <h4>
          High demand on special dates (Christmas, cyber monday, black friday,
          among others).
        </h4>
        <h4>Adverse weather conditions.</h4>.
        <h4>Lack of information in the dispatch data </h4>.
        <h2>Payment methods</h2>.
        <h4>
          Payment is made through our website using Mercado Pago, by credit or
          debit card. Card payments are confirmed immediately.
        </h4>
        <h2>Warranty</h2>
        <h4>
          The products purchased in E-commerce-web, of own brand, count with 6
          months of warranty, as long as the problems of operation or
          malfunction, correspond to or malfunction, correspond to factory
          errors and not to an incorrect use of it. incorrect use. Regarding
          other brands, the warranty period will be 3 months and under the
          warranty will be 3 months and under the same conditions already
          specified. specified.
        </h4>
        <h2>Product returns and exchanges</h2>
        <h4>
          In case of return or exchange of product, the customer will have 14
          calendar days from receipt of the order to 14 calendar days from
          receipt of the order to process this request. this request. In these
          cases, as far as the cost of return and/or reshipment of the cost of
          return and/or reshipment of the product will be borne exclusively by
          the customer. exclusively by the customer.
        </h4>
        <h2>Product status</h2>
        <h4>
          The product must be properly packaged and in perfect condition when
          received at the store. condition when received at the store, if the
          product or its original packaging is broken or damaged, we will not be
          able to proceed with the exchange and/or return.
        </h4>
        <h2>Non-exchangeable and non-returnable products</h2>
        <h4>
          As published by SERNAC, there are products that are excluded from the
          possibility of return or withdrawal. Within these products, there are
          those that are perishable or that have special conditions such as:
          mushroom growing kit, seeds, vials, items unsealed with packaging
          opened, items that can be reproduced or copied (boxes closed, seeds,
          books, CDs, etc.). Products will not be exchanged either. that do not
          have their original packaging. It is important to inform yourself
          previously of the conditions of the product purchased and if it
          complies with the return and/or exchange requirements, since if not
          proceed this action, the costs of a new shipment will be borne by the
          customer.
        </h4>
        <h2>Costs and refund methods</h2>
        <h4>
          The refund of the amount paid will be effective once received. the
          returned material and the correct condition of the products.
        </h4>
        <h4>
          For the refund of the money, the same payment method will be used with
          the one in which the purchase was made, so in the case of cards, will
          be made through bank transfer.
        </h4>
        <h4>
          Only in the event that the return and/or exchange of the product is
          result of an error, whose responsibility lies exclusively in
          E-commerce-web, the amount paid for shipping will be assumed by the
          company. Otherwise, these costs must be assumed by the customer.
        </h4>
        <h4>
          At E-commerce-web we strive every day to improve the customer
          experience. buy on our website with faster, cheaper shipping and
          satisfy the needs of our clients. Therefore, if you have Any
          suggestions, you can write to us through
          <Link href={"/contact"} className="second-color cursor-pointer">
            {" "}
            contact form{" "}
          </Link>
          or email contacto@e-commerce-web.com
        </h4>
        <h2>Thank you very much for trusting www.e-commerce-web.com!</h2>
      </div>
    </div>
  );
}
