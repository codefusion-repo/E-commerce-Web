"use client";
// swiper.tsx

//import "./swiper.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { BannerType } from "../../../interfaces/utils/utilsInterface";

export default function BannerSwiper({ banners }: { banners: BannerType[] }) {
  return (
    <Swiper
      className="box-xxl"
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={50}
      slidesPerView={1}
      autoplay={{
        delay: 15000,
        disableOnInteraction: false,
      }}
    >
      {banners &&
        banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <img src={`${banner.thumbnail}`} alt={banner.alt} />
          </SwiperSlide>
        ))}
    </Swiper>
  );
}
