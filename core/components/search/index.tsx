// Importing modules
import { algoliasearch } from "algoliasearch";
import { HierarchicalMenu, InstantSearch, RefinementList } from 'react-instantsearch'
import { CustomSearchBox } from "./search-box";
import { ProductCard } from "@/vibes/soul/primitives/product-card";
import { useHits } from 'react-instantsearch';

const searchClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
    process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY || '',
);

function CustomHits() {
    const { items } = useHits();
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8">
            {
                items.slice(0, 12).map(hit => {
                    return (
                        <ProductCard
                            product={{
                                id: hit.objectID,
                                title: hit.name,
                                href: hit.url,
                                subtitle: hit.brand_name,
                                image: {
                                    src: hit.image_url,
                                    alt: hit.name
                                },
                                price: currencyFormatter.format(Number(hit.default_price))
                            }}
                        />
                    )
                })
            }
        </div>
    )
}

export default function SearchBar() {
    return (
        <div className="p-4">
            <InstantSearch
                searchClient={searchClient}
                indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME}>
                <div className="mb-4">
                    <CustomSearchBox />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <h2 className="font-bold">Parameter</h2>
                        
                        <RefinementList 
                            attribute="variants.options.Parameter" 
                            classNames={{
                                labelText: 'ml-2 mr-2',
                                count: 'italic before:content-["("] after:content-[")"]'
                            }}
                        />
                        <h2 className="font-bold mt-4">Probes included</h2>
                        <RefinementList 
                            attribute="variants.options.Probes included" 
                            classNames={{
                                labelText: 'ml-2 mr-2',
                                count: 'italic before:content-["("] after:content-[")"]'
                            }}
                        />
                        <h2 className="font-bold mt-4">Range</h2>
                        <RefinementList 
                            attribute="variants.options.Range" 
                            classNames={{
                                labelText: 'ml-2 mr-2',
                                count: 'italic before:content-["("] after:content-[")"]'
                            }}
                        />
                    </div>
                    <div className="col-span-3">
                        <CustomHits />
                    </div>
                </div>
            </InstantSearch>
        </div>
    );
}
