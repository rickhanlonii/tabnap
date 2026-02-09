import { Hero } from "./components/hero";
import { Screenshots } from "./components/screenshots";
import { Features } from "./components/features";
import { Comparison } from "./components/comparison";
import { CTA } from "./components/cta";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Screenshots />
      <Features />
      <Comparison />
      <CTA />
      <Footer />
    </main>
  );
}
