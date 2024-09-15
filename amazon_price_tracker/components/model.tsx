"use client";

import React, { FormEvent, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import Image from "next/image";
import { addUserEmailToProduct } from "@/lib/actions";

interface Props {
  productId: String;
}

const Model = ({ productId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const openModel = () => setIsOpen(true);
  const closeModel = () => setIsOpen(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    await addUserEmailToProduct(productId, email);

    setIsSubmitting(false);
    setEmail("");
    closeModel();
  };

  return (
    <>
      <button className="btn" type="button" onClick={openModel}>
        Track
      </button>
      <Dialog open={isOpen} onClose={closeModel} className="relative z-50">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-2">
          <DialogPanel className="relative max-w-lg space-y-4 border bg-white p-6 rounded-lg shadow-lg">
            <Image
              src="/assets/icons/x-close.svg"
              alt="Close"
              width={24}
              height={24}
              className="absolute top-4 right-4 cursor-pointer"
              onClick={closeModel}
            />

            <div className="flex flex-col items-start">
              <Image
                src="/assets/icons/logo.svg"
                alt="Logo"
                width={28}
                height={28}
                className="absolute top-4 left-4"
              />

              <h4 className="text-lg font-semibold">
                Stay updated with product pricing alerts right in your inbox!
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                Never miss a bargain again with our timely alerts!
              </p>

              <form
                className="flex flex-col mt-5 w-full"
                onSubmit={handleSubmit}
              >
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <div className="relative flex items-center">
                  <Image
                    src="/assets/icons/mail.svg"
                    alt="Mail"
                    width={18}
                    height={18}
                    className="absolute left-3"
                  />
                  <input
                    required
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10 py-2 w-full border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>

                <button type="submit" className="dialog-btn">
                  {isSubmitting ? "Submitting..." : "Track"}
                </button>
              </form>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default Model;
