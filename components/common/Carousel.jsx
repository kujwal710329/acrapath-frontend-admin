"use client";

import React, { useEffect, useState } from "react";

/**
 * Generic swipeable carousel.
 *
 * Props:
 * - items: array of data items
 * - renderItem: (item, index) => ReactNode
 * - autoPlay: boolean (default true)
 * - interval: number in ms (default 4000)
 * - className: extra classes for the outer container
 * - dotsClassName: extra classes for the dots wrapper
 * - visibleCards: number, how many cards should be visible at a time (can be fractional, e.g. 1.2)
 * - showDots: boolean, whether to show navigation dots (default true)
 */
const Carousel = ({
  items = [],
  renderItem,
  autoPlay = true,
  interval = 4000,
  className = "",
  dotsClassName = "",
  visibleCards = 1,
  showDots = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, items.length]);

  if (!items.length || !renderItem || visibleCards <= 0) return null;

  const slideWidth = 100 / visibleCards;
  const hasPeek = visibleCards !== Math.floor(visibleCards);
  const lastCardTranslate = items.length * slideWidth - 100;
  const translate =
    hasPeek && activeIndex === items.length - 1
      ? lastCardTranslate
      : activeIndex * slideWidth;

  const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const distance = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(distance) < 50) return;
    if (distance > 0) setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
    else setActiveIndex((prev) => Math.max(prev - 1, 0));
    setTouchStartX(null);
  };

  return (
    <>
      <div
        className={`overflow-hidden ${className}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex items-stretch transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${translate}%)` }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{ minWidth: `${slideWidth}%`, maxWidth: `${slideWidth}%` }}
              className="px-2 box-border h-auto"
            >
              <div className="h-full">{renderItem(item, index)}</div>
            </div>
          ))}
        </div>
      </div>

      {showDots && items.length > 1 && (
        <div className={dotsClassName || "flex justify-center items-center gap-2 mt-4"}>
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-3 w-3 rounded-full border border-[#A3A3A3] transition-all duration-300 ${
                activeIndex === index ? "bg-[#A3A3A3]" : "bg-transparent"
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Carousel;
