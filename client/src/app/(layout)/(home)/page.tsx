// `app/(layout)/(home)/page.tsx` is the UI for the `/` URL

import Home from "../../../components/home/home";

// Función para obtener los banners del inicio
async function getBanners() {
  const homeData = {
    banners: [],
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_DOCKER}/api/home/get/banners`,
      // { cache: "no-store" }
      { next: { revalidate: 1600 } }
    );
    if (res.status === 200) {
      const data = await res.json();
      homeData.banners = data.banners;
    }
  } catch {
    // throw new Error("It was not possible to obtain the necessary information");
  }

  return homeData.banners;
}

export default async function Page() {
  const banners = await getBanners();
  return <Home banners={banners} />;
}
