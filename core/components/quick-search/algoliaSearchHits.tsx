import Image from 'next/image';
import React from 'react';
import { useInstantSearch } from 'react-instantsearch';

function SearchHits() {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const { results } = useInstantSearch();
  console.log(results);


  return (
    <div>
      {results.hits.length > 0 && (
        <div className="mt-8 grid overflow-auto px-1 lg:grid-cols-3 lg:gap-6">
          {/* <section>
            <h3 className="mb-6 border-b border-gray-200 pb-3 text-h5">Categories</h3>
            <ul id="categories" role="listbox">
              {Object.entries(
                results.hits.reduce<Record<string, string>>(
                  (
                    categories,
                    {
                      categories_without_path,
                    }: {
                      categories_without_path: [];
                    },
                  ) => {
                    categories_without_path.forEach((category) => {
                      categories[category] = category;
                    });

                    return categories;
                  },
                  {},
                ),
              ).map(([name, path]) => {
                return (
                  <li className="mb-3 last:mb-6" key={name}>
                    <a
                      className="focus:ring-primary-blue/20 align-items mb-6 flex gap-x-6 focus:outline-none focus:ring-4"
                      href={path}
                    >
                      {name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section> */}
          <section>
            <h3 className="mb-6 border-b border-gray-200 pb-3 text-h5">Products</h3>
            <ul id="products" role="listbox">
              {results.hits.map(
                ({
                  default_price,
                  image_url,
                  name,
                  objectID,
                  url,
                }: {
                  default_price: string;
                  image_url: string;
                  name: string;
                  objectID: string;
                  url: string;
                }) => {
                  return (
                    <li key={objectID}>
                      <a
                        className="focus:ring-primary-blue/20 align-items mb-6 flex gap-x-6 focus:outline-none focus:ring-4"
                        href={url}
                      >
                        {/* {image_url ? (
                          <Image
                            alt={name}
                            className="self-start object-contain"
                            height={80}
                            src={image_url}
                            width={80}
                          />
                        ) : (
                          <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center bg-gray-200 text-h6 text-gray-500">
                            Photo
                          </span>
                        )} */}

                        <span className="flex flex-col">
                          <p className="text-h5">{name}</p>
                          <p className="w-36 shrink-0">
                            {currencyFormatter.format(Number(default_price))}
                          </p>
                        </span>
                      </a>
                    </li>
                  );
                },
              )}
            </ul>
          </section>
          {/* <section>
            <h3 className="mb-6 border-b border-gray-200 pb-3 text-h5">Brands</h3>
            <ul id="brands" role="listbox">
              {Object.entries(
                results.hits.reduce<Record<string, string>>(
                  (
                    brands,
                    {
                      brand_id,
                      brand_name,
                    }: {
                      brand_id: string;
                      brand_name: string;
                    },
                  ) => {
                    if (brand_id) {
                      brands[brand_name] = brand_name;
                    }

                    return brands;
                  },
                  {},
                ),
              ).map(([name]) => {
                return (
                  <li className="mb-3 last:mb-6" key={name}>
                    <a
                      className="focus:ring-primary-blue/20 align-items mb-6 flex gap-x-6 focus:outline-none focus:ring-4"
                      href={`brands/${name}`}
                    >
                      {name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section> */}
        </div>
      )}
      {results.query.length >= 3 && results.hits.length === 0 && (
        <p className="pt-6">
          No products matched with <b>"{results.query}"</b>
        </p>
      )}
    </div>
  );
}

export default SearchHits;
