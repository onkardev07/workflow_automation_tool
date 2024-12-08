import { Hero } from "@/components/Hero";

import { Appbar } from "../components/Appbar";
import { HeroVideo } from "@/components/HeroVideo";

// import { Appbar } from "@/components/Appbar";

export default function Home() {
  return (
    <main className="pb-48">
      <Appbar />
      <Hero />
      <div className="pt-8">
        <HeroVideo />
      </div>
    </main>
  );
}
