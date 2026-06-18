"use client";
// faqs.tsx

import Link from "next/link";
// import "../faqsBody.css";

export default function MyOrderOnline() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>Faqs My online order</h1>
      </div>
      <div className="flex column box-xxl a-start padding-s gap-s">
        <h2>How can I track my order?</h2>
        <h4>
          Depending on the shipping company, you will be informed by e-mail as
          soon as your order leaves our facilities. as soon as your order leaves
          our facilities. We will We will send you an assigned tracking number
          by e-mail. You will be able to check your order on our website in the
          section 'PURCHASES' located in your customer your customer account.
          You can also check the status of your order with your tracking number
          on the courier company's website.
        </h4>
        <h2>How can I modify, cancel or return my order?</h2>
        <h4>
          To perform these operations, we recommend that you contact our
          customer service department as soon as possible. our customer service
          department as soon as possible by WhatsApp or email. possible by
          WhatsApp or email. In these cases we recommend that you contact us to
          proceed to make the necessary changes as soon as possible.
          modifications as soon as possible. From ecommerce-demo.codefusion.cl we make
          every effort to send your shipment as quickly as possible.
        </h4>
        <h2>How can I make an online purchase or order?</h2>
        <h4>
          Here you have all the information with the
          <Link href={"/how-buy"} className="second-color cursor-pointer">
            {" "}
            step-by-step to make a purchase{" "}
          </Link>
          satisfactorily.
        </h4>
        <h2>Do you ship to other Latin American countries?</h2>
        <h4>No, we only ship within Chile.</h4>
        <h2>How long will it take for my order to arrive?</h2>
        <h4>
          From ecommerce-demo.codefusion.cl our commitment is to always have in stock
          all our catalog, so that at the time you finalize your order our
          catalog, so that when you finalize your order, we can send it
          immediately, we can send it immediately.
        </h4>
        <h2>What time will my order arrive?</h2>
        <h4>
          This will depend on the transport company. From ecommerce-demo.codefusion.cl
          we recommend that you keep an eye on your phone. Please, in the
          shipping information, please put an address where you can be sure that
          someone will be present to that there will be someone present to pick
          it up.
        </h4>
        <h2>
          Will the delivery person call to inform me about the delivery of my
          order?
        </h2>
        <h4>
          They are not obliged to advise when your order will be delivered. In
          ecommerce-demo.codefusion.cl we have contracted with our transporters a double
          delivery attempt, so they will certainly try to deliver it a second
          time in case they cannot try to deliver it a second time in case they
          can not find you in the first first delivery. For this reason, it is
          important that you pay attention to the tracking of your order as it
          will be updated as delivery changes occur. changes in the delivery.
        </h4>
        <h2>What are the shipping costs for my order?</h2>
        <h4>
          The minimum charge will be $4000 but it will depend on the total
          amount of the purchase, you will see this value reflected under
          “Shipping cost” at the end of your order. at the end of your order.
        </h4>
        <h2>Is it a discreet shipment?</h2>
        <h4>YES, always.</h4>
        <h2>What if it was not there when you tried to deliver it to me?</h2>
        <h4>
          From ecommerce-demo.codefusion.cl we count on the contracting of a second
          delivery attempt by the carrier company. delivery by the carrier
          company. In the event that the second attempt cannot be carried out,
          you will have to go to a corresponding branch to branch to pick up
          your order.
        </h4>
      </div>
    </>
  );
}
