import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import Hero from '../components/Hero';
import Newsletter from '../components/Newsletter';
import Testimonials from '~/components/Testimonials';
import Logos from '~/components/Logos';
import CTA from '~/components/Cta';
import ProductList from '~/components/Productlist';

export const meta = () => {
  return [{title: 'Chic Partner | Home'}];
};

export async function loader({context}) {
  const {storefront} = context;
  const {collections} = await storefront.query(FEATURED_COLLECTION_QUERY);
  const featuredCollection = collections.nodes[0];
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);
  const get10products = await storefront.query(GET_10_PRODUCTS);

  return defer({featuredCollection, recommendedProducts, get10products});
}

export default function Homepage() {
  const data = useLoaderData();
  return (
    <div className="home MainSection">
      <Hero />
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
      <CTA />
      <ProductList tenproducts={data.get10products}/>
      <Logos />
      <Testimonials />
      <Newsletter />
    </div>
  );
}

function FeaturedCollection({collection}) {
  if (!collection) return null;
  console.log("Collection Data:",collection);
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {({products}) => (
            <div className="recommended-products-grid">
              {products.nodes.map((product) => (
                <Link
                  key={product.id}
                  className="recommended-product"
                  to={`/products/${product.handle}`}
                >
                  <Image
                    data={product.images.nodes[0]}
                    aspectRatio="1/1"
                    sizes="(min-width: 45em) 20vw, 50vw"
                  />
                  <h4>{product.title}</h4>
                  <small>
                    <Money data={product.priceRange.minVariantPrice} />
                  </small>
                </Link>
              ))}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;
const simpleVariable = {
  data: `query {
    products(first: 10, reverse: true) {
      edges {
        node {
          id
          title
          handle
          resourcePublicationOnCurrentPublication {
            publication {
              name
              id
            }
            publishDate
            isPublished
          }
        }
      }
    }
  }`,
}
const GET_10_PRODUCTS = `#graphql
  fragment Get10Product on Product {
      id
      title
      handle
      priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query Get10Prodcut($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 10, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...Get10Product
      }
    }
  }
`;
