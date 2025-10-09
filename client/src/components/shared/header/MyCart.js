/**
 * Title: Write a program using JavaScript on Cart
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
 * Date: 13, November 2023
 */

import Cart from "@/components/icons/Cart";
import React, { useEffect, useState } from "react";
import OutsideClick from "../OutsideClick";
import Image from "next/image";
import { useSelector } from "react-redux";
import Trash from "@/components/icons/Trash";
import { useDeleteFromCartMutation, useUpdateCartMutation } from "@/services/cart/cartApi";
import { toast } from "react-hot-toast";
import Inform from "@/components/icons/Inform";
import { useCreatePaymentMutation } from "@/services/payment/paymentApi";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { useRouter } from "next/navigation";

const MyCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [removeFromCart, { isLoading, data, error }] =
    useDeleteFromCartMutation();
  
  const [
    updateCart,
    { isLoading: isUpdating, data: updateData, error: updateError },
  ] = useUpdateCartMutation();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Removing item from cart...", { id: "removeFromCart" });
    }

    if (data) {
      toast.success(data?.description, { id: "removeFromCart" });
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "removeFromCart" });
    }
  }, [isLoading, data, error]);

  useEffect(() => {
    if (isUpdating) {
      toast.loading("Updating cart...", { id: "updateCart" });
    }

    if (updateData) {
      toast.success(updateData?.description, { id: "updateCart" });
    }

    if (updateError?.data) {
      toast.error(updateError?.data?.description, { id: "updateCart" });
    }
  }, [isUpdating, updateData, updateError]);

  const handleUpdateQuantity = (cartId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return; // Don't allow 0 or negative
    updateCart({ id: cartId, quantity: newQuantity });
  };

  return (
    <>
      <button
        className="p-2 rounded-secondary hover:bg-slate-100 transition-colors relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Cart className="h-6 w-6" />

        {user?.cart?.length > 0 && (
          <span className="h-2 w-2 bg-red-500 rounded-secondary absolute top-1 right-1"></span>
        )}
      </button>

      {isOpen && (
        <OutsideClick
          onOutsideClick={() => setIsOpen(false)}
          className="absolute top-full right-0 w-80 h-96 overflow-y-auto bg-white border rounded p-4 flex flex-col gap-y-2.5"
        >
          <div className="w-full h-full flex flex-col gap-y-8">
            {Object.keys(user).length === 0 || user?.cart?.length === 0 ? (
              <p className="text-sm flex flex-row gap-x-1 items-center justify-center h-full w-full">
                <Inform /> No Products in Cart!
              </p>
            ) : (
              <div className="h-full w-full flex flex-col gap-y-4">
                <div className="h-full overflow-y-auto scrollbar-hide">
                  {user?.cart
                    ?.filter((item) => item.product !== null) // Filter out items with deleted products
                    .map(({ product, quantity, _id }) => (
                      <div
                        key={product?._id}
                        className="flex flex-row gap-x-2 transition-all border border-transparent p-2 rounded hover:border-black group relative"
                      >
                        <Image
                          src={product?.thumbnail?.url}
                          alt={product?.thumbnail?.public_id}
                          width={50}
                          height={50}
                          className="rounded h-[50px] w-[50px] object-cover"
                        />
                        <article className="flex flex-col gap-y-2 flex-1">
                        <div className="flex flex-col gap-y-0.5">
                          <h2 className="text-base line-clamp-1">
                            {product?.title}
                          </h2>
                          <p className="text-xs line-clamp-2">
                            {product?.summary}
                          </p>
                        </div>
                        <div className="flex flex-col gap-y-1">
                          <p className="flex flex-row justify-between items-center">
                            <span className="text-xs flex flex-row gap-x-0.5 items-baseline">
                              $
                              <span className="text-sm text-black">
                                {product?.price * quantity}.00
                              </span>
                            </span>
                            <div className="flex flex-row gap-x-1 items-center border rounded">
                              <button
                                onClick={() => handleUpdateQuantity(_id, quantity, -1)}
                                disabled={quantity === 1 || isUpdating}
                                className="p-0.5 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <AiOutlineMinus className="w-3 h-3" />
                              </button>
                              <span className="text-xs px-1.5 min-w-[20px] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(_id, quantity, 1)}
                                disabled={isUpdating}
                                className="p-0.5 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <AiOutlinePlus className="w-3 h-3" />
                              </button>
                            </div>
                          </p>
                          <div className="flex flex-row gap-x-1">
                            <span className="whitespace-nowrap text-[10px] bg-purple-300/50 text-purple-500 border border-purple-500 px-1.5 rounded">
                              {product?.store?.title}
                            </span>
                            <span className="whitespace-nowrap text-[10px] bg-indigo-300/50 text-indigo-500 border border-indigo-500 px-1.5 rounded">
                              {product?.brand?.title}
                            </span>
                            <span className="whitespace-nowrap text-[10px] bg-blue-300/50 text-blue-500 border border-blue-500 px-1.5 rounded">
                              {product?.category?.title}
                            </span>
                          </div>
                        </div>
                      </article>

                        <button
                          type="button"
                          className="opacity-0 transition-opacity group-hover:opacity-100 absolute top-2 right-2 border p-1 rounded-secondary bg-red-100 text-red-900 border-red-900"
                          onClick={() => removeFromCart(_id)}
                        >
                          <Trash />
                        </button>
                      </div>
                    ))}
                </div>
                <Purchase cart={user?.cart} />
              </div>
            )}
          </div>
        </OutsideClick>
      )}
    </>
  );
};

function Purchase({ cart }) {
  const router = useRouter();
  
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    
    // Navigate to checkout page
    router.push("/checkout");
  };

  return (
    <button
      type="button"
      className="px-8 py-2 border border-black rounded-secondary bg-black hover:bg-black/90 text-white transition-colors drop-shadow flex flex-row gap-x-2 items-center justify-center"
      onClick={handleCheckout}
    >
      Proceed to Checkout
    </button>
  );
}

export default MyCart;
