import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getListingById } from "../services/api";

const ListingPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      const data = await getListingById(id);
      setListing(data);
    };
    fetchListing();
  }, [id]);

  if (!listing) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl mt-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {listing.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-2">{listing.price}$</p>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{listing.condition}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {listing.images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`listing-${idx}`}
            className="w-full h-64 object-cover rounded-xl"
          />
        ))}
      </div>

      <p className="text-gray-700 dark:text-gray-300">{listing.description}</p>
    </div>
  );
};

export default ListingPage;