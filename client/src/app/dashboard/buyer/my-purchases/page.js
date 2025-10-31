/**
 * Title: Write a program using JavaScript on Page
 * Author: Hasibul Islam
 * Portfolio: https://devhasibulislam.vercel.app
 * Linkedin: https://linkedin.com/in/devhasibulislam
 * GitHub: https://github.com/devhasibulislam
 * Facebook: https://facebook.com/devhasibulislam
 * Instagram: https://instagram.com/devhasibulislam
 * Twitter: https://twitter.com/devhasibulislam
 * Pinterest: https://pinterest.com/devhasibulislam
 * WhatsApp: https://wa.me/8801906315901
 * Telegram: devhasibulislam
 * Date: 14, January 2024
 */

"use client";

import Inform from "@/components/icons/Inform";
import Dashboard from "@/components/shared/layouts/Dashboard";
import Image from "next/image";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const Page = () => {
  const user = useSelector((state) => state.auth.user);
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <Dashboard>
      {user?.purchases?.length === 0 ? (
        <p className="text-sm flex flex-row gap-x-1 items-center justify-center">
          <Inform /> Not Yet Purchased any Products!
        </p>
      ) : (
        <section className="w-full h-full">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Total Amount ($)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {user?.purchases
                  ?.slice()
                  .reverse()
                  .map(
                    ({
                      orderId,
                      products,
                      _id,
                      totalAmount,
                      status,
                      subtotal,
                      deliveryTax,
                    }) => (
                    <React.Fragment key={_id}>
                      <tr className="bg-white hover:bg-gray-50 border-b-2">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-sm">
                            {orderId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm">
                            {products?.length} item{products?.length > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-sm">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {status === "pending" && (
                            <span className="bg-orange-50 border border-orange-500 px-2 py-1 rounded text-orange-700 text-xs uppercase font-semibold">
                              {status}
                            </span>
                          )}
                          {status === "delivered" && (
                            <span className="bg-green-50 border border-green-500 px-2 py-1 rounded text-green-700 text-xs uppercase font-semibold">
                              {status}
                            </span>
                          )}
                          {status === "cancelled" && (
                            <span className="bg-gray-50 border border-gray-500 px-2 py-1 rounded text-gray-700 text-xs uppercase font-semibold">
                              {status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleOrder(_id)}
                            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-xs font-semibold"
                          >
                            {expandedOrders[_id] ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedOrders[_id] && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="bg-white p-4 rounded shadow-sm">
                              <h3 className="font-semibold mb-3 text-sm">Order Items:</h3>
                              <table className="w-full">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs">Thumbnail</th>
                                    <th className="px-4 py-2 text-left text-xs">Product</th>
                                    <th className="px-4 py-2 text-left text-xs">Price</th>
                                    <th className="px-4 py-2 text-left text-xs">Quantity</th>
                                    <th className="px-4 py-2 text-right text-xs">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {products?.map(({ product, quantity }, idx) => (
                                    <tr key={idx} className="border-b">
                                      <td className="px-4 py-3">
                                        <Image
                                          src={product?.thumbnail?.url}
                                          alt={product?.thumbnail?.public_id}
                                          height={40}
                                          width={40}
                                          className="h-[40px] w-[40px] rounded border object-cover"
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-sm">{product?.title}</td>
                                      <td className="px-4 py-3 text-sm">${product?.price.toFixed(2)}</td>
                                      <td className="px-4 py-3 text-sm">× {quantity}</td>
                                      <td className="px-4 py-3 text-sm text-right font-semibold">
                                        ${(product?.price * quantity).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="border-t-2">
                                    <td colSpan="4" className="px-4 py-2 text-right text-sm font-semibold">Subtotal:</td>
                                    <td className="px-4 py-2 text-right text-sm">${(subtotal || 0).toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td colSpan="4" className="px-4 py-2 text-right text-sm font-semibold">Delivery Tax:</td>
                                    <td className="px-4 py-2 text-right text-sm">${(deliveryTax || 0).toFixed(2)}</td>
                                  </tr>
                                  <tr className="border-t-2">
                                    <td colSpan="4" className="px-4 py-2 text-right text-sm font-bold">Total:</td>
                                    <td className="px-4 py-2 text-right text-sm font-bold">${totalAmount.toFixed(2)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </Dashboard>
  );
};

export default Page;
