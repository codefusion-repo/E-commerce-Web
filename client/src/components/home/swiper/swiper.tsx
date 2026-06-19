"use client";
// swiper.tsx

import "./swiper.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { BannerType } from "../../../interfaces/utils/utilsInterface";
import { useEffect, useState } from "react";

export default function BannerSwiper({ banners }: { banners: BannerType[] }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => media.removeEventListener("change", updatePreference);
  }, []);

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <Swiper
      className="box-xxl home-swiper"
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={50}
      slidesPerView={1}
      autoplay={
        reduceMotion
          ? false
          : {
              delay: 15000,
              disableOnInteraction: false,
            }
      }
    >
      {banners &&
        banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <img src={`${banner.thumbnail}`} alt={banner.alt || "Store banner"} />
          </SwiperSlide>
        ))}
    </Swiper>
  );
}
