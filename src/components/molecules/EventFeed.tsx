"use client";

import React, { RefObject, useEffect, useRef } from 'react'
import IconCard from '@/components/atoms/IconCard';
import filterIcon from '@/assets/filterIcon.svg';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface EventFeedProps {
    data: Events;
}

export const EventFeed = ({ data }: EventFeedProps) => {
    const [filterMenuOpen, setFilterMenuOpen] = React.useState(false);

    function useOutsideDetector(ref: RefObject<HTMLDivElement>, callback: (event: MouseEvent) => void) {
      useEffect(() => {
        function handleClickOutside(event:MouseEvent) {
          if (ref?.current && !ref.current.contains(event.target as Node)) {
            callback(event);
          }
        }
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          // Unbind the event listener on clean up
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [ref, callback]);
    }

    const filterMenu = useRef<HTMLDivElement>(null);
    useOutsideDetector(filterMenu, (event: MouseEvent) => {setFilterMenuOpen(false)});
  
    const router = useRouter();
    const activeFilters: string[] = router.query.filter ? (router.query.filter as string).split('|') : [];


    const eventNames = Object.values(data).flatMap((entry: {data: KronosEvent[]}) =>
      entry.data.map((element: KronosEvent) => element.name)
    );
    const filterOptions = Array.from(new Set(eventNames));
    const filteredEvents: Events = {}
    Object.entries(data).forEach(([key, value]) => {
      const filteredValues = value.data.filter(
        (item: KronosEvent) =>
          activeFilters.length === 0 || activeFilters.includes(item.name)
      );

      if (filteredValues.length > 0) {
        filteredEvents[key] = { data: filteredValues };
      }
    });
    
    function setFilter(name: string) {
      if (activeFilters.includes(name)) {
        const index = activeFilters.indexOf(name);
        activeFilters.splice(index, 1);
      }
      else {
        activeFilters.push(name);
      }
      router.push({
        query: { ...router.query, filter: activeFilters.join('|') },
      });
    }

    return (
      <div className='w-full'>
        <div className='flex items-center justify-between relative border-b border-[#303030] py-4 px-6'>
          <h2>Events</h2>
          <button onClick={() => setFilterMenuOpen(!filterMenuOpen)}>
          <Image src={filterIcon} alt='Filter' />
          </button>
          <div ref={filterMenu} className={`${filterMenuOpen ? 'flex' : 'hidden'} flex-col items-start p-4 rounded-md border-2 border-[#303030] shadow-lg absolute z-10 right-6 top-10 w-64 bg-black`}>
            <button className='absolute top-0 right-0 p-2' onClick={() => setFilterMenuOpen(false)}>Close</button>
            {filterOptions.map((name: string) => {
              return (
                <div
                  className='flex text-base gap-4 w-full p-2 cursor-pointer'
                  key={name}
                  onClick={() => setFilter(name)}>
                    <input
                      type='checkbox'
                      defaultChecked={activeFilters.includes(name)}
                    />
                    <span>
                    {name}
                    </span>
                </div>
              );
            })}
          </div>
        </div>
        {Object.entries(filteredEvents).map(([key, value]) => {
                return (
                  <div key={key}>
                    <h3 className='px-4 pt-4'>{key}</h3>
                    {value.data.map((item: KronosEvent, index: number) => (
                      <IconCard
                        key={`${key}-${index}`}
                        icon={
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            height={24}
                            width={24}>
                            <circle cx='12' cy='12' r='10' />
                            <polyline points='12 8 12 12 16 16' />
                            <line x1='8' y1='12' x2='12' y2='12' />
                          </svg>
                        }
                        name={item.name}
                        description={item.description || ''}
                        value={item.value}
                      />
                    ))}
                  </div>
                );
              })
            }
      </div>
    );
}
