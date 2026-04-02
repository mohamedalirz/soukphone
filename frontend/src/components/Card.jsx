// Card.jsx
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import UserBadge from "./UserBadge";

const Card = ({ phone }) => {
  const [fav, setFav] = useState(false);

  const settings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dotsClass: "slick-dots custom-dots"
  };

  if (!phone) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
    >
      <div className="relative">
        {phone.images && phone.images.length > 0 ? (
          <Slider {...settings}>
            {phone.images.map((img, i) => (
              <div key={i}>
                <img 
                  src={img} 
                  alt={phone.title} 
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}

        <FaHeart
          onClick={() => setFav(!fav)}
          className={`absolute top-3 right-3 cursor-pointer text-xl ${fav ? "text-red-500" : "text-white drop-shadow-md"}`}
        />
      </div>

      <div className="p-4">
              {phone.seller && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
              {phone.seller.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-600">{phone.seller.username}</span>
            <UserBadge badge={phone.seller.badge} showLabel={false} />
          </div>
        </div>
      )}
        <h3 className="font-semibold text-lg mb-1 truncate">{phone.title}</h3>
        <p className="text-gray-500 text-sm mb-2">{phone.condition}</p>
        <p className="text-blue-600 font-bold text-xl">${phone.price}</p>

        <Link
          to={`/phone/${phone._id}`}
          className="block bg-blue-600 text-white text-center py-2 rounded-xl mt-3 hover:bg-blue-700 transition"
        >
          View Details
        </Link>
      </div>

      <style>{`
        .custom-dots {
          bottom: 8px;
        }
        .custom-dots li button:before {
          color: white;
          opacity: 0.5;
          font-size: 8px;
        }
        .custom-dots li.slick-active button:before {
          color: white;
          opacity: 1;
        }
      `}</style>
    </motion.div>
  );
};

export default Card;