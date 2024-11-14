"use client";

import React, { RefObject, useEffect, useRef } from "react";

import { Coin, FilterSquare } from "iconsax-react";
import { useRouter } from "next/router";

import IconCard from "@/components/atoms/IconCard";

interface EventFeedProps {
  data: Events;
}

export const EventFeed = ({ data }: EventFeedProps) => {
  const [filterMenuOpen, setFilterMenuOpen] = React.useState(false);

  function useOutsideDetector(ref: RefObject<HTMLDivElement>, callback: (event: MouseEvent) => void) {
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref?.current && !ref.current.contains(event.target as Node)) {
          callback(event);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, callback]);
  }

  const filterMenu = useRef<HTMLDivElement>(null);
  useOutsideDetector(filterMenu, (event: MouseEvent) => {
    setFilterMenuOpen(false);
  });

  const router = useRouter();
  const activeFilters: string[] = router.query.filter ? (router.query.filter as string).split("|") : [];

  const eventNames = Object.values(data).flatMap((entry: { data: TokenEvent[] }) => entry.data.map((element: TokenEvent) => element.name));
  const filterOptions = Array.from(new Set(eventNames));
  const filteredEvents: Events = {};
  Object.entries(data).forEach(([key, value]) => {
    const filteredValues = value.data.filter((item: TokenEvent) => activeFilters.length === 0 || activeFilters.includes(item.name));

    if (filteredValues.length > 0) {
      filteredEvents[key] = { data: filteredValues };
    }
  });

  function setFilter(name: string) {
    if (activeFilters.includes(name)) {
      const index = activeFilters.indexOf(name);
      activeFilters.splice(index, 1);
    } else {
      activeFilters.push(name);
    }
    router.push({
      query: { ...router.query, filter: activeFilters.join("|") },
    });
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative text-nomyx-text-light dark:text-nomyx-text-dark bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-b border-nomyx-gray4-light dark:border-nomyx-gray4-dark py-4 px-6">
        <h2>Events</h2>
        <div ref={filterMenu} className="flex relative">
          <button onClick={() => setFilterMenuOpen(!filterMenuOpen)}>
            <FilterSquare />
          </button>
          <div
            className={`${
              filterMenuOpen ? "flex" : "hidden"
            } flex-col items-start py-4 rounded-md border-2 border-nomyx-gray4-light dark:border-nomyx-gray4-darkshadow-lg absolute top-6 -right-5 z-10 max-w-64 bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark`}
          >
            <button
              className="text-nomyx-text-light dark:text-nomyx-text-dark absolute top-0 right-0 p-2 text-xs"
              onClick={() => setFilterMenuOpen(false)}
            >
              Close
            </button>
            {filterOptions.map((name: string) => {
              const isChecked = activeFilters.includes(name);
              return (
                <div className="flex text-xs gap-4 w-full p-2 cursor-pointer" key={name} onClick={() => setFilter(name)}>
                  <input type="checkbox" checked={isChecked} onChange={() => setFilter(name)} onClick={(e) => e.stopPropagation()} />
                  <span>{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {Object.keys(filteredEvents).length === 0 ? (
        // Empty state while filtering
        <div className="flex-grow flex min-h-screen items-center justify-center text-nomyx-text-light dark:text-nomyx-text-dark bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark"></div>
      ) : (
        // Render the events
        Object.entries(filteredEvents).map(([key, value]) => {
          return (
            <div key={key} className="text-nomyx-text-light dark:text-nomyx-text-dark bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark">
              <h3 className="px-4 pt-4">{key}</h3>
              {value.data.map((item: TokenEvent, index: number) => (
                <IconCard key={`${key}-${index}`} icon={<Coin />} name={item.name} description={item.description || ""} value={item.value} />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
};
