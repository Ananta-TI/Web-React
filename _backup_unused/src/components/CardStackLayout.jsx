import React from "react";
import CardSwap, { Card } from "../components/CardSwap";

const cards = [
  {
    title: "Smooth",
    color: "bg-gradient-to-r from-gray-800 to-gray-900",
    media: "https://cdn.dribbble.com/userupload/7053861/file/original-7956be57144058795db6bb24875bdab9.mp4",
  },
  {
    title: "Customizable",
    color: "bg-gradient-to-r from-gray-700 to-gray-800",
    media: "https://cdn.dribbble.com/userupload/7098541/file/original-0b063b12ca835421580e6034368ad95a.mp4",
  },
  {
    title: "Reliable",
    color: "bg-gradient-to-r from-gray-600 to-gray-700",
    media: "https://cdn.dribbble.com/userupload/7078020/file/original-b071e9063d9e3ba86a85a61b9d5a7c42.mp4",
  },
];

export default function CardStackLayout() {
  return (
    <div className="min-h-screen bg-[#0c0818] text-white p-10 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* LEFT TEXT */}
        <div>
          <h2 className="text-4xl font-semibold mb-4">
            Card stacks have never <br />
            <span className="text-white/80">looked so good</span>
          </h2>
          <p className="text-gray-400 text-lg">Just look at it go!</p>
        </div>

        {/* RIGHT CARD STACK */}
        <div className="relative w-[400px] h-[300px] mx-auto">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`absolute top-1/2 left-1/2 rounded-xl overflow-hidden text-white border border-white/10 shadow-xl transition-transform duration-700 ease-in-out`}
              style={{
                width: "400px",
                height: "300px",
                transform: `translate(-50%, -50%) translate3d(${index * 30}px, -${
                  index * 30
                }px, -${index * 100}px) skew(0deg, 5deg)`,
                zIndex: cards.length - index,
              }}
            >
              <div className={`p-4 flex items-center gap-2 ${card.color}`}>
                <span className="text-sm">⚙️</span>
                <span className="text-sm font-medium">{card.title}</span>
              </div>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={card.media} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
