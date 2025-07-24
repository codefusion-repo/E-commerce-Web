import Footer from "../components/navigation/footer/footer";
import Navbar from "../components/navigation/navbar/navbar";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="flex box-xxl f-height-xxxxl a-start j-center navbar-p-xxl">
        <div className="flex f-width-xxxl f-height-l column a-center j-center gap-s second-bg border-radius-xs">
          <h1>Page not found 404</h1>
          <h2>Request could not be completed</h2>
          <Link className="btn-middle btn-active" href="/">
            Return to home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
