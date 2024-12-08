"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PrimaryButton } from "./buttons/PrimaryButton";
import { LinkButton } from "./buttons/LinkButton";

export const Appbar = () => {
  const router = useRouter();
  const [isTokenPresent, setIsTokenPresent] = useState(false);

  useEffect(() => {
    // Check if a token exists in localStorage
    const token = localStorage.getItem("token");
    setIsTokenPresent(!!token); // Set state based on whether token exists
  }, []); // This will run only once when the component mounts

  return (
    <div className="flex border-b justify-between p-4">
      <div className="flex flex-col justify-center text-2xl font-extrabold">
        Zapier
      </div>

      {/* Conditionally render the red background div based on the token presence */}
      {!isTokenPresent && (
        <div className="flex">
          <div className="pr-4">
            <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
          </div>
          <div className="pr-4">
            <LinkButton
              onClick={() => {
                router.push("/login");
              }}
            >
              Login
            </LinkButton>
          </div>
          <PrimaryButton
            onClick={() => {
              router.push("/signup");
            }}
          >
            Signup
          </PrimaryButton>
        </div>
      )}
      {isTokenPresent && (
        <div className="flex">
          <PrimaryButton
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
          >
            Logout
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};
