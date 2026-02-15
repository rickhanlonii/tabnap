import { Hero } from "./components/hero";
import { InteractiveDemo } from "./components/interactive-demo";
import { Features } from "./components/features";
import { Comparison } from "./components/comparison";
import { CTA } from "./components/cta";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <InteractiveDemo />
      <Features />
      <Comparison />
      <CTA />
      <Footer />
    </main>
  );
}
