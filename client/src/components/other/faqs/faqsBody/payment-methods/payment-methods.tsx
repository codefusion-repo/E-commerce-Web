"use client";
// payment-methods.tsx

// import "../faqsBody.css";

export default function PaymentMethods() {
  return (
    <>
      <div className="flex box-xxl m-height-xxs column a-start j-center padding-xs second-border-b">
        <h1>FAQs Payment methods</h1>
      </div>

      <div className="flex column box-xxl a-start padding-s gap-s">
        <h4>
          At e-commerce-web.store we have 2 different payment methods available
          of our clients so that they choose the medium that interests them
          most.
        </h4>

        <h2>Pay with Flow or Mercadopago</h2>
        <h4>
          You can pay by credit or debit card (Visa, MasterCard or Maestro),
          with the Prepaid method. Credit card options or Debit are the payment
          method most used by our clients. Is the safest and fastest since it is
          a payment that is processed at the moment of the purchase.
        </h4>
      </div>
    </>
  );
}
