import React from "react";

interface AdvertisementProps {
  icon: string;
  title: string;
  description: string;
  url: string;
  bgColor: string;
  textColor: string;
  buttonColor: string;
}

export const Advertisement: React.FC<AdvertisementProps> = ({
  icon,
  title,
  description,
  bgColor,
  url,
  textColor,
  buttonColor,
}) => {
  return (
    <div className="flex items-center justify-center pt-6">
      <div className="w-full max-w-xl">
        <div
          className={`flex items-center justify-between px-3 py-2 ${bgColor} rounded-lg shadow-md`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`rounded-full overflow-hidden ${textColor}`}
              style={{ width: "86px", height: "86px" }}
            >
              <img
                className="object-cover w-full h-full"
                src={`ads/${icon}`}
                alt={`${title} logo`}
              />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${textColor}`}>{title}</h1>
              <p className="text-gray-500 text-lg font-light mt-2">
                {description}
              </p>
            </div>
          </div>
          <button
            className={`${buttonColor} text-white px-4 py-2 rounded-lg hover:bg-opacity-80`}
            onClick={() => window.open(url, "_blank")}
          >
            Find out more
          </button>
        </div>
      </div>
    </div>
  );
};
