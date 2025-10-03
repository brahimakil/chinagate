

"use client";

import DemoteBrand from "@/components/dashboard/DemoteBrand";
import Inform from "@/components/icons/Inform";
import Pencil from "@/components/icons/Pencil";
import Trash from "@/components/icons/Trash";
import User from "@/components/icons/User";
import Card from "@/components/shared/Card";
import Modal from "@/components/shared/Modal";
import Dashboard from "@/components/shared/layouts/Dashboard";
import DashboardLading from "@/components/shared/skeletonLoading/DashboardLading";
import { setBrand, setBrands } from "@/features/brand/brandSlice";
import { setProduct } from "@/features/product/productSlice";
import {
  useDeleteBrandMutation,
  useGetBrandsQuery,
} from "@/services/brand/brandApi";
import { useDeleteProductMutation, useGetProductsQuery } from "@/services/product/productApi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";

const ListBrands = () => {
  const {
    data: brandsData,
    isLoading: brandsLoading,
    error: brandsError,
  } = useGetBrandsQuery();
  
  const {
    data: productsData,
    isLoading: productsLoading,
  } = useGetProductsQuery();
  
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);

  // Calculate product count for each brand
  const brandsWithProductCount = useMemo(() => {
    return brands.map(brand => ({
      ...brand,
      productCount: products.filter(product => product.brand?._id === brand._id).length
    }));
  }, [brands, products]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (brandsLoading) {
      toast.loading("Fetching Brands...", { id: "brandsData" });
    }

    if (brandsData) {
      toast.success(brandsData?.description, { id: "brandsData" });
    }

    if (brandsError) {
      toast.error(brandsError?.data?.description, { id: "brandsData" });
    }

    dispatch(setBrands(brands));
  }, [brandsError, brandsData, brandsLoading, dispatch, brands]);

  return (
    <Dashboard>
      {/* Header with Add Button */}
      <div className="w-full flex flex-row justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg border">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Brand Management</h1>
          <p className="text-sm text-gray-600">Manage all brands in your system</p>
        </div>
        <Link
          href="/dashboard/admin/add-brand"
          className="flex items-center gap-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Brand
        </Link>
      </div>

      {brandsWithProductCount?.length === 0 ? (
        <div className="text-center py-12">
          <Inform className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Brands Found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first brand.</p>
          <Link
            href="/dashboard/admin/add-brand"
            className="inline-flex items-center gap-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Brand
          </Link>
        </div>
      ) : (
        <section className="w-full h-full bg-white rounded-lg border shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Logo
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Brand Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Total Products
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Creator
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Tags
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Features
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brandsWithProductCount.map((brand, index) => (
                  <tr
                    key={brand?._id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <Image
                        src={brand?.logo?.url}
                        alt={brand?.logo?.public_id}
                        height={40}
                        width={40}
                        className="h-10 w-10 rounded-lg border-2 border-gray-200 object-cover"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {brand?.title}
                        </span>
                        <span className="text-xs text-gray-500 line-clamp-1">
                          {brand?.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {brand?.productCount} products
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <Image
                            src={brand?.creator?.avatar?.url || "https://placehold.co/32x32.png"}
                            alt={brand?.creator?.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {brand?.creator?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-40">
                        {brand?.tags?.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {brand?.tags?.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{brand?.tags?.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {brand?.keynotes?.length} features
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-x-2">
                        <BrandDetails brand={brand} />
                        <Link
                          href={`/dashboard/admin/update-brand?id=${brand?._id}`}
                          className="bg-blue-50 border border-blue-200 p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit Brand"
                        >
                          <Pencil />
                        </Link>
                        <DeleteBrand brand={brand} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </Dashboard>
  );
};

function DeleteBrand({ brand }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteBrand, { isLoading, data, error }] = useDeleteBrandMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Deleting Brand...", { id: "deleteBrand" });
    }

    if (data) {
      toast.success(data?.description, { id: "deleteBrand" });
    }

    if (error) {
      toast.error(error?.data?.description, { id: "deleteBrand" });
    }
  }, [isLoading, data, error]);

  return (
    <>
      <button
        type="submit"
        className="bg-red-50 border border-red-900 p-0.5 rounded-secondary text-red-900"
        onClick={() => {
          setIsOpen(true);
          dispatch(setBrand(brand));
        }}
      >
        <Trash />
      </button>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="p-4 lg:w-1/5"
        >
          <article className="flex flex-col gap-y-4">
            <p className="text-xs bg-yellow-500/50 text-black px-2 py-0.5 rounded-sm text-center">
              Brand will be deleted permanently!
            </p>
            <div className="flex flex-col gap-y-2 items-start">
              <h1 className="text-xl">Are you sure?</h1>
              <p className="text-sm flex flex-col gap-y-2">
                You are about to unlisted from:
                <span className="flex flex-row gap-x-1 items-center text-xs">
                  <Inform /> {brand?.products?.length} Products
                </span>
              </p>
            </div>
            <div className="flex flex-row gap-x-4">
              <button
                className="text-white bg-slate-500 px-3 py-1.5 rounded text-sm"
                onClick={() => setIsOpen(false)}
              >
                No, cancel
              </button>
              <button
                className="flex flex-row gap-x-2 items-center text-white bg-red-500 px-3 py-1.5 rounded text-sm"
                onClick={() => deleteBrand(brand?._id)}
              >
                <Trash /> Yes, delete
              </button>
            </div>
          </article>
        </Modal>
      )}
    </>
  );
}

function BrandDetails({ brand }) {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  return (
    <>
      <button
        type="submit"
        className="bg-green-50 border border-green-900 p-0.5 rounded-secondary text-green-900"
        onClick={() => {
          setIsOpen(true);
          dispatch(setBrand(brand));
        }}
      >
        <User />
      </button>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="p-6 lg:w-1/3 md:w-3/4 w-full h-96 overflow-y-auto scrollbar-hide"
        >
          <div className="h-full w-full flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-1 items-center">
              <Image
                src={brand?.creator?.avatar?.url}
                alt={brand?.creator?.avatar?.public_id}
                width={50}
                height={50}
                className="rounded-full h-[50px] w-[50px] object-cover"
              />
              <h1 className="text-lg">{brand?.creator?.name}</h1>
              <p className="text-sm">{brand?.creator?.email}</p>
              <p className="text-xs">{brand?.creator?.phone}</p>
            </div>

            <hr />

            <div className="flex flex-col gap-y-2 w-full">
              {brand?.products?.map((product) => (
                <div
                  key={product?._id}
                  className="flex flex-row justify-between items-center bg-slate-50 rounded p-2 w-full"
                >
                  <div
                    className="flex flex-row gap-x-2 items-center cursor-pointer"
                    onClick={() =>
                      window.open(
                        `/product?product_id=${
                          product?._id
                        }&product_title=${product?.title
                          .replace(/ /g, "-")
                          .toLowerCase()}}`,
                        "_blank"
                      )
                    }
                  >
                    <Image
                      src={product?.thumbnail?.url}
                      alt={product?.thumbnail?.public_id}
                      width={20}
                      height={20}
                      className="rounded-full h-[20px] w-[20px] object-cover"
                    />
                    <p className="line-clamp-1 text-sm whitespace-normal text-left">
                      {product?.title}
                    </p>
                  </div>
                  <DeleteProduct product={product} />
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function DeleteProduct({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteProduct, { isLoading, data, error }] =
    useDeleteProductMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Deleting Product...", { id: "deleteProduct" });
    }

    if (data) {
      toast.success(data?.description, { id: "deleteProduct" });
      setIsOpen(false);
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "deleteProduct" });
    }
  }, [isLoading, data, error]);

  return (
    <>
      <button
        type="submit"
        className="bg-red-50 border border-red-900 p-0.5 rounded-secondary text-red-900"
        onClick={() => {
          setIsOpen(true);
          dispatch(setProduct(product));
        }}
      >
        <Trash />
      </button>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="p-4 lg:w-1/5"
        >
          <article className="flex flex-col gap-y-4">
            <p className="text-xs bg-yellow-500/50 text-black px-2 py-0.5 rounded-sm text-center">
              Product will be deleted permanently!
            </p>
            <div className="flex flex-col items-start gap-y-2">
              <h1 className="text-xl">Are you sure?</h1>
              <p className="text-sm flex flex-col gap-y-2">
                You are about to unlisted from:
                <p className="flex flex-col gap-y-1.5">
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Brand: {product?.brand?.title}
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Category: {product?.category?.title}
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Store: {product?.store?.title}
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Lost {product?.buyers?.length} buyers
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Lost {product?.reviews?.length} reviews
                  </span>
                </p>
              </p>
            </div>
            <div className="flex flex-row gap-x-4">
              <button
                className="text-white bg-slate-500 px-3 py-1.5 rounded text-sm"
                onClick={() => setIsOpen(false)}
              >
                No, cancel
              </button>
              <button
                className="flex flex-row gap-x-2 items-center text-white bg-red-500 px-3 py-1.5 rounded text-sm"
                onClick={() => deleteProduct(product?._id)}
              >
                <Trash /> Yes, delete
              </button>
            </div>
          </article>
        </Modal>
      )}
    </>
  );
}

export default ListBrands;
