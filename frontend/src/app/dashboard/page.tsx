/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Appbar } from "@/components/Appbar";
import { useRouter } from "next/navigation";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { DarkButton } from "@/components/buttons/DarkButton";
import { LinkButton } from "@/components/buttons/LinkButton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  createdAt: string;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/zap`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        console.log("my zaps", res.data.zaps);
        setZaps(res.data.zaps);
        setLoading(false);
      });
  }, []);

  return {
    loading,
    zaps,
  };
}

export default function Page() {
  const { zaps } = useZaps();

  const { loading } = useZaps();
  const router = useRouter();

  return (
    <div>
      <Appbar />
      <div className="flex justify-center pt-8">
        <div className="max-w-screen-lg	 w-full">
          <div className="flex justify-between pr-8 ">
            <div className="text-2xl font-bold">My Zaps</div>
            <DarkButton
              onClick={() => {
                router.push("/zap/create");
              }}
            >
              Create
            </DarkButton>
          </div>
        </div>
      </div>
      {loading ? (
        "Loading..."
      ) : (
        <div className="flex justify-center">
          {" "}
          <ZapTable zaps={zaps} />{" "}
        </div>
      )}
    </div>
  );
}

function ZapTable({ zaps }: { zaps: Zap[] }) {
  const router = useRouter();

  return (
    <div className="p-8 max-w-screen-lg w-full">
      <Table>
        <TableCaption>A list of your Zaps</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Name</TableHead>
            <TableHead>Id</TableHead>
            <TableHead className="w-[120px]">Created At</TableHead>
            <TableHead>Webhook URL</TableHead>
            {/* <TableHead className="">Go</TableHead> */}
          </TableRow>
        </TableHeader>

        <TableBody>
          {zaps.map((z) => (
            <TableRow key={z.id}>
              <TableCell className="flex items-center font-medium">
                <img
                  src={z.trigger.type.image}
                  alt="Trigger"
                  className="w-[30px] h-[30px] mr-2"
                />
                {z.actions.map((x, index) => (
                  <img
                    key={index}
                    src={x.type.image}
                    alt="Action"
                    className="w-[30px] h-[30px] mr-2"
                  />
                ))}
              </TableCell>
              <TableCell>{z.id}</TableCell>
              <TableCell>
                {new Date(z.createdAt)
                  .toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })
                  .replace(",", "")}
              </TableCell>

              <TableCell>{`${HOOKS_URL}/hooks/catch/1/${z.id}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
