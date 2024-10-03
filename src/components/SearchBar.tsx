import React from "react";
import { SearchIcon } from "@/assets";
import { SearchNormal1 } from "iconsax-react";
import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";
 

export default function SearchBar() {
  const router = useRouter();
  const { query, pathname } = router;

  const handleSearch = useDebouncedCallback((term: string) => {
    if (term && query) {
      query.query = term;
    } else {
      query.query = undefined;
    }
    router.replace({ pathname, query });
  }, 300);

  return (
    <>
      <div className='bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark flex-shrink-0 w-64 flex items-center rounded-sm h-8 py-1 px-2'>
        <SearchNormal1 size='24' />
        <input
          type='text'
          placeholder='Search'
          className='bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark ml-2 w-full focus:outline-none'
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          defaultValue={query?.query || ''}
        />
      </div>
    </>
  );
}
