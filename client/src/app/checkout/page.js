"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCreateOrderMutation } from "@/services/order/orderApi";
import { useGetSystemSettingsQuery } from "@/services/system/systemApi";
import Main from "@/components/shared/layouts/Main";
import Container from "@/components/shared/Container";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: settingsData } = useGetSystemSettingsQuery();

  const [formData, setFormData] = useState({
    deliveryAddress: "",
    whatsappNumber: "",
    customerNotes: "",
  });

  // Pre-fill address and phone from user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: user.address || "",
        whatsappNumber: user.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.cart?.length === 0) {
      toast.error("Your cart is empty!");
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.deliveryAddress || !formData.whatsappNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    const items = user.cart
      .filter((item) => item.product !== null)
      .map(({ product, quantity, _id }) => ({
        name: product.title,
        quantity,
        price: product.price,
        thumbnail: product.thumbnail?.url,
        description: product.summary,
        pid: product._id,
        cid: _id,
      }));

    try {
      const result = await createOrder({
        items,
        ...formData,
      }).unwrap();

      toast.success(result.description);
      router.push("/dashboard/buyer/my-purchases");
    } catch (error) {
      toast.error(error?.data?.description || "Failed to place order");
    }
  };

  const deliveryTax = settingsData?.data?.deliveryTax || 0;
  const subtotal = user?.cart
    ?.filter((item) => item.product !== null)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
  const totalAmount = subtotal + deliveryTax;

  return (
    <Main>
      <Container>
        <div className="max-w-2xl mx-auto py-12">
          <h1 className="text-3xl font-bold mb-8">Checkout - Cash on Delivery</h1>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {user?.cart?.filter((item) => item.product !== null).map(({ product, quantity, _id }) => (
              <div key={_id} className="flex justify-between items-center mb-2 pb-2 border-b">
                <div>
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-gray-600">Qty: {quantity}</p>
                </div>
                <p className="font-semibold">${(product.price * quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg">Subtotal:</p>
                <p className="text-lg">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg">Delivery Tax:</p>
                <p className="text-lg">${deliveryTax.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-black">
                <p className="text-xl font-bold">Total:</p>
                <p className="text-xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Delivery Form */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter your full delivery address"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.customerNotes}
                onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Any special instructions for delivery?"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>Payment Method:</strong> Cash on Delivery 💵
              </p>
              <p className="text-sm text-blue-600 mt-2">
                You will pay when you receive your order.
              </p>
              {deliveryTax > 0 && (
                <p className="text-sm text-blue-600 mt-2">
                  <strong>Note:</strong> A delivery tax of ${deliveryTax.toFixed(2)} will be added to your order.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>
      </Container>
    </Main>
  );
}
