import { Search } from 'lucide-react';
import React, { useRef } from 'react';
import { useInstantSearch, useSearchBox, UseSearchBoxProps } from 'react-instantsearch';

import { Input, InputIcon } from '../ui/input';

export function CustomSearchBox(props: UseSearchBoxProps) {
  const { refine } = useSearchBox(props);
  const { status } = useInstantSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchStalled = status === 'stalled';

  return (
    <div>
      <form
        action=""
        noValidate
        onReset={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (inputRef.current) {
            inputRef.current.blur();
          }
        }}
        role="search"
      >
        <Input
          aria-controls="categories products brands"
          className="peer appearance-none border-2 px-12 py-3"
          onChange={(event) => refine(event.currentTarget.value)}
          placeholder="Search..."
          ref={inputRef}
          role="combobox"
        >
          <InputIcon className="peer-hover:text-blue-primary peer-focus:text-blue-primary start-3">
            <Search />
          </InputIcon>
        </Input>
        <span hidden={!isSearchStalled}>Searching…</span>
      </form>
    </div>
  );
}
