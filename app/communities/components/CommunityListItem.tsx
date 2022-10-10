import { CommunitySchema } from "app/communities/validations"
import { Link, Routes } from "blitz"
import { z } from "zod"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import { Pagination } from "swiper"

interface CommunityProps {
  community: z.infer<typeof CommunitySchema>
}

const CommunityListItem = ({ community }: CommunityProps) => {
  return (
    <div className="py-6 p-4 lg:p-6 w-1/2 md:w-1/4 lg:w-1/2 xl:w-1/4">
      <Link href={Routes.ShowCommunityPage({ communityId: community.id })}>
        <div className="cursor-pointer h-full ">
          {community.images.length > 0 ? (
            <Swiper
              className="rounded-xl"
              spaceBetween={0}
              slidesPerView={1}
              resistanceRatio={0}
              pagination={{
                dynamicBullets: true,
              }}
              modules={[Pagination]}
            >
              {community.images.map((image) => (
                <SwiperSlide key={image.id}>
                  <div className="bg-gray-300 w-full aspect-square overflow-hidden">
                    <img src={image.cloudUrl} className="w-full" alt={image.name} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className={`h-[252px] w-[252px] rounded-xl w-full bg-slate-200`}></div>
          )}

          <div className="ml-3 mt-3">
            <a>{community.name}</a>
            <div className="text-xs">UserId: {community.userId}</div>
          </div>
        </div>
      </Link>
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #fff;
          opacity: 0.5;
        }

        .swiper-pagination-bullet.swiper-pagination-bullet-active {
          background: white;
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default CommunityListItem
