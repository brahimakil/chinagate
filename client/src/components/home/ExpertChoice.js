/**
 * Title: Write a program using JavaScript on ExpertChoice
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React, { useEffect, useMemo } from "react";
import Container from "../shared/Container";
import Card from "../shared/Card";
import { useGetProductsQuery } from "@/services/product/productApi";
import ProductCard from "../shared/skeletonLoading/ProductCard";
import { toast } from "react-hot-toast";

const ExpertChoice = ({ className }) => {
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useGetProductsQuery();
  const products = useMemo(() => productsData?.data || [], [productsData]);

  useEffect(() => {
    if (productsError) {
      toast.error(productsError?.data?.description, { id: "expert-choice" });
    }
  }, [productsError]);

  return (
    <Container className={className ? className : ""}>
      <section className="flex flex-col gap-y-10">
        <h1 className="text-4xl">
          Experts Choice. <span className="">Most Favorites</span>
        </h1>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-x-6 gap-y-8">
          {productsLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                <ProductCard key={index} />
              ))}
            </>
          ) : (
            <>
              {products?.slice(-8)?.map((product) => (
                <Card key={product?._id} product={product} />
              ))}
            </>
          )}
        </div>
        
        {!productsLoading && products?.length === 0 && (
          <p className="text-sm">Oops! No products found!</p>
        )}
      </section>
    </Container>
  );
};

export default ExpertChoice;
