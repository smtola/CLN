import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import ClaImage from '/assets/image/camfalogo.jpg'
import CcocImage from '/assets/image/ccoc.jpg'
// import required modules
import {Autoplay, FreeMode, Pagination } from 'swiper/modules';

export default function MembershipShow() {
  return (
    <>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        freeMode={true}
        loop={true}
        navigation={true}
        centeredSlides={true}
        autoplay={{
            delay: 2500,
            disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Autoplay, FreeMode, Pagination]}
        className="w-[34vh] h-full mb-2"
      >
        <SwiperSlide>
            <img src={ClaImage} alt="member_1" className='w-full'/>
        </SwiperSlide>
        <SwiperSlide>
            <img src={CcocImage} alt="member_2" className='w-full'/>
        </SwiperSlide>
      </Swiper>
    </>
  );
}
