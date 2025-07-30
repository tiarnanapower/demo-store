'use client';

import { algoliasearch } from 'algoliasearch';
import { Search, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import { InstantSearch } from 'react-instantsearch';

import { Button } from '../ui/button';
import { Field, FieldControl, Form } from '../ui/form';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
} from '../ui/sheet';
import { CustomSearchBox } from '~/components/quick-search/algoliasearchbox';
import AlgoliaSearchHits from '~/components/quick-search/algoliaSearchHits';
import { cn } from '~/lib/utils';

interface SearchProps extends PropsWithChildren {
  initialTerm?: string;
}

export const QuickSearch = () => {
  const [open, setOpen] = useState(false);
  const algoliaClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
    process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY || '',
  );

  return (
    <InstantSearch indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME} searchClient={algoliaClient}>
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger asChild>
          <Button
            aria-label="Open search popup"
            className="border-0 bg-transparent p-3 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary"
          >
            <Search />
          </Button>
        </SheetTrigger>
        <SheetOverlay className="bg-transparent backdrop-blur-none">
          <SheetContent
            className={cn(
              'absolute left-0 top-0 flex flex min-h-[92px] flex-col flex-col px-6 py-4 data-[state=closed]:duration-0 data-[state=open]:duration-0 md:px-10 md:py-4 lg:px-12',
            )}
            side="top"
          >
            <div className="grid grid-cols-5 items-center">
              <Form
                action="/search"
                className="col-span-4 flex lg:col-span-3"
                method="get"
                role="search"
              >
                <Field className="w-full" name="term">
                  <FieldControl asChild required>
                    <CustomSearchBox />
                  </FieldControl>
                </Field>
              </Form>
              <SheetClose asChild>
                <Button
                  aria-label="Close search popup"
                  className="w-auto justify-self-end border-0 bg-transparent p-2.5 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary peer-hover:text-blue-primary peer-focus:text-blue-primary"
                >
                  <small className="me-2 hidden text-base md:inline-flex">Close</small>
                  <X />
                </Button>
              </SheetClose>
            </div>
            <AlgoliaSearchHits />
          </SheetContent>
        </SheetOverlay>
      </Sheet>
    </InstantSearch>
  );
};
