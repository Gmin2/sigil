import Nav from "../components/Nav";
import Hero from "../components/landing/Hero";
import Problem from "../components/landing/Problem";
import HowSection from "../components/landing/HowSection";
import Footer from "../components/Footer";
import { BookOpen, Layers, Grid } from "../components/icons";

const NAV_LINKS = [
  { label: "How it works", to: "/#how", Icon: BookOpen },
  { label: "Architecture", to: "/#architecture", Icon: Layers },
  { label: "App", to: "/app", Icon: Grid },
];

export default function Landing() {
  return (
    <>
      <Nav links={NAV_LINKS} />
      <main>
        <Hero />
        <Problem />
        <HowSection />
      </main>
      <Footer />
    </>
  );
}
