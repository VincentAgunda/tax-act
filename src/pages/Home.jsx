// src/pages/Home.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

// Icons (Material UI)
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import AddIcon from "@mui/icons-material/Add";

// Lazy loaded heavy components to improve initial bundle
const ActsExplorer = React.lazy(() => import("./ActsExplorer"));
const CompareActs = React.lazy(() => import("./CompareActs"));
const NewsFeed = React.lazy(() => import("./NewsFeed"));

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const bounceAnimation = {
  rest: { scale: 1 },
  hover: {
    scale: 1.08,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
  tap: { scale: 0.95 },
};

// Static data (extracted to avoid re-creation)
const HERO_SLIDES = [
  {
    img: "/hero9.jpg",
    title: "Navigate Tax Acts",
    desc: "Your complete resource for tax legislation and news.",
    btn1: { text: "Explore Acts", to: "#acts" },
    btn2: { text: "Latest News", to: "#news" },
  },
  {
    img: "/hero-5.jpg",
    title: "Compare Versions",
    desc: "Track legislative changes across different versions.",
    btn1: { text: "Compare Now", to: "#compare" },
    btn2: { text: "Learn More", to: "#about" },
  },
  {
    img: "/hero9.jpg",
    title: "Stay Informed",
    desc: "Get the latest updates about tax laws and policies.",
    btn1: { text: "See News", to: "#news" },
    btn2: { text: "Contact Us", to: "#contact" },
  },
];

const EXPLORE_CARDS = [
  {
    title: "Acts Library",
    desc: "Search and access every act in one place.",
    img: "/hero-5.jpg",
    to: "#acts",
    bgColor: "#f5f5f7",
  },
  {
    title: "Compare Tools",
    desc: "Spot changes between different versions quickly.",
    img: "/hero-4.jpg",
    to: "#compare",
    bgColor: "#bebfc2",
  },
  {
    title: "Tax News",
    desc: "Stay up to date with tax-related policies.",
    img: "/hero8.jpg",
    to: "#news",
    bgColor: "#f5f5f7",
  },
  {
    title: "Insights",
    desc: "Deep analysis of legislative changes and impacts.",
    img: "/hero-5.jpg",
    to: "#acts",
    bgColor: "#FFD600",
  },
];

// Header height used for smooth scrolling offset (keep in sync with Header.jsx)
const HEADER_HEIGHT = 80;

const Home = () => {
  const [current, setCurrent] = useState(0);
  const [sending, setSending] = useState(false);

  // refs for sections & form
  const formRef = useRef(null);
  const contactRef = useRef(null);
  const actsRef = useRef(null);
  const compareRef = useRef(null);
  const newsRef = useRef(null);

  // mounted ref to avoid setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Hero autoplay with stable timer (useRef holds interval id)
  useEffect(() => {
    const id = setInterval(() => {
      // use functional update to avoid stale closure
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => clearInterval(id);
  }, []);

  // Smooth scroll helper (useCallback stable identity)
  const scrollToSection = useCallback((ref) => {
    if (!ref || !ref.current) return;
    const top = ref.current.getBoundingClientRect().top + window.pageYOffset - HEADER_HEIGHT;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const scrollToContact = useCallback(() => scrollToSection(contactRef), [scrollToSection]);
  const scrollToActs = useCallback(() => scrollToSection(actsRef), [scrollToSection]);
  const scrollToCompare = useCallback(() => scrollToSection(compareRef), [scrollToSection]);
  const scrollToNews = useCallback(() => scrollToSection(newsRef), [scrollToSection]);

  // Generic handler to map anchor strings to scroll functions
  const handleAnchor = useCallback(
    (anchor) => {
      if (!anchor) return;
      if (anchor === "#acts") scrollToActs();
      else if (anchor === "#compare") scrollToCompare();
      else if (anchor === "#news") scrollToNews();
      else if (anchor === "#contact") scrollToContact();
    },
    [scrollToActs, scrollToCompare, scrollToNews, scrollToContact]
  );

  // Email send
  const sendEmail = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formRef.current) return;
      setSending(true);

      try {
        // replace your SERVICE_ID / TEMPLATE_ID / PUBLIC_KEY in env or code
        await emailjs.sendForm(
          "YOUR_SERVICE_ID",
          "YOUR_TEMPLATE_ID",
          formRef.current,
          "YOUR_PUBLIC_KEY"
        );

        if (mountedRef.current) {
          alert("Message sent successfully!");
          formRef.current.reset();
        }
      } catch (err) {
        // better logging (could integrate Sentry or console)
        // eslint-disable-next-line no-console
        console.error("Email send error:", err);
        if (mountedRef.current) alert("Failed to send message. Please try again.");
      } finally {
        if (mountedRef.current) setSending(false);
      }
    },
    []
  );

  // Memoized values for rendering lists to prevent recreation each render
  const heroSlides = useMemo(() => HERO_SLIDES, []);
  const exploreCards = useMemo(() => EXPLORE_CARDS, []);

  return (
    <div className="bg-white text-gray-900">
      {/* --- Hero Carousel --- */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
        {heroSlides.map((slide, i) => {
          const isActive = i === current;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 1.01,
              }}
              transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${slide.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: isActive ? 1 : 0,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white/40" />
            </motion.div>
          );
        })}

        {/* Hero Content */}
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 flex flex-col items-start justify-center h-full px-6 md:px-16 lg:px-32 text-left"
        >
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-5 tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-700">
                {heroSlides[current].title.split(" ")[0]}
              </span>{" "}
              <span className="text-[#0b1b32]">
                {heroSlides[current].title.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              {heroSlides[current].desc}
            </p>

            <div className="flex flex-row items-center gap-4 flex-wrap">
              <button
                onClick={() => handleAnchor(heroSlides[current].btn1.to)}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-md font-semibold hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-md"
              >
                {heroSlides[current].btn1.text}
              </button>

              <button
                onClick={() => handleAnchor(heroSlides[current].btn2.to)}
                className="border border-blue-500 text-blue-700 px-6 py-3 rounded-md font-semibold hover:bg-blue-50 transition-all duration-300 shadow-sm"
              >
                {heroSlides[current].btn2.text}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? "w-6 bg-blue-600" : "w-3 bg-gray-400/50 hover:bg-blue-400/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* --- True Apple-Style Supporting Panels --- */}
      <div className="w-full px-4 md:px-10 mt-20 space-y-24">
        {[
          {
            title: "Browse Legislation",
            desc: "Access a complete database of tax acts with version history and detailed insights.",
            action: scrollToActs,
            bg: "#bebfc2 ",
            text: "text-navy",
            btnStyle: "light",
            icon: <MenuBookIcon fontSize="large" className="mb-4 text-black opacity-90" />,
          },
          {
            title: "Compare Versions",
            desc: "Easily track legislative changes across different versions.",
            action: scrollToCompare,
            bg: "#F5F5F7",
            text: "text-black",
            btnStyle: "dark",
            icon: <CompareArrowsIcon fontSize="large" className="mb-4 text-black opacity-80" />,
          },
          {
            title: "Stay Informed",
            desc: "Get the latest news and updates about tax laws and policy changes.",
            to: "#news",
            bg: "#FFD600 ",
            text: "text-black",
            btnStyle: "light",
            icon: <NewspaperIcon fontSize="large" className="mb-4 text-navy opacity-90" />,
          },
        ].map((section, i) => (
          <motion.section
            key={i}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="
              relative w-full max-w-6xl mx-auto rounded-[40px]
              py-24 px-10 flex flex-col items-center justify-center text-center
              shadow-[0_40px_120px_-30px_rgba(0,0,0,0.35)]
              overflow-hidden backdrop-blur-xl
              transition-transform duration-500
              hover:-translate-y-3 hover:shadow-[0_60px_160px_-40px_rgba(0,0,0,0.45)]
            "
            style={{ background: section.bg }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="
                  absolute top-0 left-1/3 w-1/2 h-full
                  bg-white opacity-[0.07]
                  blur-3xl rotate-[25deg]
                "
              />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {section.icon}

              <h2 className={`text-4xl md:text-5xl font-semibold mb-4 tracking-tight ${section.text}`}>
                {section.title}
              </h2>

              <p
                className={`text-lg max-w-2xl mb-10 ${
                  section.text === "text-white" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {section.desc}
              </p>

              <button
                onClick={() => {
                  if (section.action) section.action();
                  else if (section.to === "#news") scrollToNews();
                }}
                className={`px-12 py-3 rounded-full font-medium tracking-wide text-lg transition-all duration-300 ${
                  section.btnStyle === "light"
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {section.title}
              </button>
            </div>
          </motion.section>
        ))}
      </div>

      {/* --- Explore More Section --- */}
      <section className="py-12 bg-[#fdfdfd]">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">Explore More</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
              Discover our comprehensive tax resources and tools
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exploreCards.map((card, i) => (
              <motion.div
                key={i}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={bounceAnimation}
                className="relative"
              >
                <div
                  className="h-80 rounded-xl overflow-hidden shadow-sm group relative flex flex-col"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <div className="p-5 flex-grow flex flex-col">
                    <span className="text-xs font-medium text-gray-600">{card.title}</span>
                    <h3 className="text-base lg:text-sm font-medium text-gray-900 leading-snug mt-1">
                      {card.desc}
                    </h3>
                  </div>

                  <div
                    className="w-full h-1/2 bg-cover bg-bottom"
                    style={{ backgroundImage: `url(${card.img})` }}
                    aria-hidden
                  />

                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-md cursor-pointer"
                    aria-hidden
                  >
                    <AddIcon className="text-white text-sm" />
                  </motion.div>
                </div>

                {card.to.startsWith("#") ? (
                  <button
                    onClick={() => handleAnchor(card.to)}
                    className="absolute inset-0 z-10"
                    aria-label={`Explore ${card.title}`}
                  />
                ) : (
                  <Link to={card.to} className="absolute inset-0 z-10" aria-label={`Explore ${card.title}`} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Acts Explorer Section --- */}
      <section
        ref={actsRef}
        id="acts"
        className="py-12 bg-[#fdfdfd] text-gray-900"
        style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
      >
        <Suspense fallback={<div className="max-w-6xl mx-auto py-20 text-center">Loading acts…</div>}>
          <ActsExplorer embedded={true} />
        </Suspense>
      </section>

      {/* --- Compare Acts Section --- */}
      <section
        ref={compareRef}
        id="compare"
        className="py-12 bg-[#fdfdfd] text-gray-900"
        style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
      >
        <Suspense fallback={<div className="max-w-6xl mx-auto py-20 text-center">Loading compare tools…</div>}>
          <CompareActs embedded={true} />
        </Suspense>
      </section>

      {/* --- News Feed Section --- */}
      <section
        ref={newsRef}
        id="news"
        className="py-12 bg-[#fdfdfd] text-gray-900"
        style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
      >
        <Suspense fallback={<div className="max-w-6xl mx-auto py-20 text-center">Loading news…</div>}>
          <NewsFeed embedded={true} />
        </Suspense>
      </section>

      {/* --- Contact Section --- */}
      <section
        ref={contactRef}
        className="py-12 text-center bg-[#fdfdfd]"
        id="contact"
        style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
      >
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Get in Touch</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">Questions or suggestions? We'd love to hear from you.</p>

          <motion.form
            ref={formRef}
            onSubmit={sendEmail}
            className="max-w-xl mx-auto flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-200 shadow-lg"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              required
              className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-800 focus:outline-none transition"
            />
            <input
              type="email"
              name="user_email"
              placeholder="Your Email"
              required
              className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-800 focus:outline-none transition"
            />
            <textarea
              name="message"
              rows="4"
              placeholder="Your Message"
              required
              className="w-full p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-gray-800 focus:outline-none transition"
            />
            <motion.button
              type="submit"
              disabled={sending}
              className={`bg-black text-white px-8 py-3 rounded-md font-semibold mt-4 ${sending ? "opacity-60 cursor-not-allowed" : ""}`}
              whileHover={{ scale: sending ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {sending ? "Sending…" : "Send Message"}
            </motion.button>
          </motion.form>

          <div className="flex justify-center gap-6 mt-10 text-gray-600">
            {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map((Icon, idx) => (
              <motion.div key={idx} whileHover={{ y: -5, scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
                <Icon className="cursor-pointer hover:text-black" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
