"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PrimaryButton } from "./buttons/PrimaryButton";
import { LinkButton } from "./buttons/LinkButton";

export const Appbar = () => {
  const router = useRouter();
  const [isTokenPresent, setIsTokenPresent] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsTokenPresent(!!token);
  }, []);

  return (
    <div className="flex border-b justify-between p-4">
      <div className="flex flex-col justify-center text-2xl font-extrabold">
        Zapier
      </div>

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
