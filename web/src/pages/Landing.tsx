import Nav from "../components/Nav";
import Hero from "../components/landing/Hero";
import Problem from "../components/landing/Problem";
import HowSection from "../components/landing/HowSection";
import Footer from "../components/Footer";

const NAV_LINKS = [
  { label: "How it works", to: "/#how" },
  { label: "Architecture", to: "/#architecture" },
  { label: "App", to: "/app" },
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
