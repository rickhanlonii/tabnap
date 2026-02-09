import { Hero } from "./components/hero";
import { Screenshots } from "./components/screenshots";
import { Features } from "./components/features";
import { Comparison } from "./components/comparison";

export default function Home() {
  return (
    <main>
      <Hero />
      <Screenshots />
      <Features />
      <Comparison />
    </main>
  );
}
