// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import ActsExplorer from "./ActsExplorer";
import CompareActs from "./CompareActs";
import NewsFeed from "./NewsFeed"; // <- imported

// Material UI Icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import AddIcon from "@mui/icons-material/Add";

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

const heroSlides = [
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
    img: "/hero8.jpg",
    title: "Stay Informed",
    desc: "Get the latest updates about tax laws and policies.",
    btn1: { text: "See News", to: "#news" },
    btn2: { text: "Contact Us", to: "#contact" },
  },
];

const exploreCards = [
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
    bgColor: "#eff6fb",
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
    bgColor: "#eeedf2",
  },
];

const Home = () => {
  const [current, setCurrent] = useState(0);
  const form = useRef();
  const contactRef = useRef(null);
  const actsRef = useRef(null);
  const compareRef = useRef(null);
  const newsRef = useRef(null); // news ref

  // Header height used as offset so the sticky header doesn't cover sections.
  // Keep this in sync with Header.jsx's offset (currently 80).
  const HEADER_HEIGHT = 80;

  // Hero auto-slide
  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        form.current,
        "YOUR_PUBLIC_KEY"
      )
      .then(() => {
        alert("Message sent successfully!");
        form.current.reset();
      })
      .catch(() => alert("Failed to send message. Please try again."));
  };

  // Smooth scroll handlers (use programmatic scroll with offset)
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      const top =
        ref.current.getBoundingClientRect().top + window.pageYOffset - HEADER_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const scrollToContact = () => scrollToSection(contactRef);
  const scrollToActs = () => scrollToSection(actsRef);
  const scrollToCompare = () => scrollToSection(compareRef);
  const scrollToNews = () => scrollToSection(newsRef); // news scroll

  return (
    <div className="bg-white text-gray-900">
      {/* --- Hero Carousel --- */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
  {heroSlides.map((slide, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, scale: 1.01 }}
      animate={{
        opacity: i === current ? 1 : 0,
        scale: i === current ? 1 : 1.01,
      }}
      transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0"
      style={{
        backgroundImage: `url(${slide.img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: i === current ? 1 : 0,
      }}
    >
      {/* ✅ Much lighter overlay for clarity */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white/40" />
    </motion.div>
  ))}

  {/* ✅ Hero Content */}
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
        {/* Primary Button */}
        <button
          onClick={() => {
            if (heroSlides[current].btn1.to === "#acts") scrollToActs();
            else if (heroSlides[current].btn1.to === "#compare") scrollToCompare();
            else if (heroSlides[current].btn1.to === "#news") scrollToNews();
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-md font-semibold hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-md"
        >
          {heroSlides[current].btn1.text}
        </button>

        {/* Secondary Button */}
        <button
          onClick={() => {
            if (heroSlides[current].btn2.to === "#contact") scrollToContact();
            else if (heroSlides[current].btn2.to === "#news") scrollToNews();
          }}
          className="border border-blue-500 text-blue-700 px-6 py-3 rounded-md font-semibold hover:bg-blue-50 transition-all duration-300 shadow-sm"
        >
          {heroSlides[current].btn2.text}
        </button>
      </div>
    </div>
  </motion.div>

  {/* ✅ Navigation Dots */}
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


      {/* --- Supporting Panels --- */}
      {[
  {
    title: "Browse Legislation",
    desc: "Access a complete database of tax acts with version history and detailed insights.",
    action: scrollToActs,
    bg: "#f7f3fa", // lighter lavender
    btn: "View Acts",
    icon: <MenuBookIcon fontSize="large" className="mb-4 text-black" />,
  // reduced opacity
    textColor: "black",
  },
  {
    title: "Compare Versions",
    desc: "Easily track legislative changes across different versions.",
    action: scrollToCompare,
    bg: "#F1EDF5", // soft peach-pink tone
    btn: "Compare Now",
    icon: (
      <CompareArrowsIcon fontSize="large" className="mb-4 text-black" />
    ),
   
    textColor: "oklch(37.2% 0.044 257.287)",
  },
  {
    title: "Stay Informed",
    desc: "Get the latest news and updates about tax laws and policy changes.",
    to: "#news",
     bg: "#F1EDF5", // light blue-gray pastel
    btn: "See News",
    icon: <NewspaperIcon fontSize="large" className="mb-4 text-black" />,
    overlay: "bg-black/10",
    textColor: "black",
  },
].map((section, i) => (
  <section
    key={i}
    className="relative min-h-[50vh] flex flex-col items-center justify-center text-center py-12"
    style={{
      background: section.bg.startsWith("#")
        ? section.bg
        : `url(${section.bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className={`absolute inset-0 ${section.overlay}`} />
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className={`relative z-10 px-4 flex flex-col items-center text-${section.textColor}`}
    >
      {section.icon}
      <h2 className="text-3xl md:text-5xl font-bold mb-4">{section.title}</h2>
      <p className="text-lg mb-8 max-w-2xl mx-auto">{section.desc}</p>
      {section.action ? (
        <button
          onClick={section.action}
          className="bg-[#f2f4f8] text-black px-8 py-3 rounded-md font-semibold hover:bg-[#e2e6eb] transition"
        >
          {section.btn}
        </button>
      ) : (
        <button
          onClick={() => {
            if (section.to === '#news') scrollToNews();
          }}
          className="bg-[#f2f4f8] text-black px-8 py-3 rounded-md font-semibold hover:bg-[#e2e6eb] transition"
        >
          {section.btn}
        </button>
      )}
    </motion.div>
  </section>
))}

      {[ /* ... same sections array ... */ ].map((section, i) => (
        <section
          key={i}
          className="relative min-h-[50vh] flex flex-col items-center justify-center text-center py-12"
          style={{
            background: section.bg.startsWith("#")
              ? section.bg
              : `url(${section.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // add scroll margin on every panel so if someone links directly it won't be hidden
            scrollMarginTop: `${HEADER_HEIGHT}px`,
          }}
        >
          <div className={`absolute inset-0 ${section.overlay}`} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className={`relative z-10 px-4 flex flex-col items-center ${section.textColor}`}
          >
            {section.icon}
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {section.title}
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">{section.desc}</p>
            {section.action ? (
              <button
                onClick={section.action}
                className="bg-[#ebeef2] text-black px-8 py-3 rounded-md font-semibold hover:bg-[#cacfd8] transition"
              >
                {section.btn}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (section.to === "#news") scrollToNews();
                }}
                className="bg-[#ebeef2] text-black px-8 py-3 rounded-md font-semibold hover:bg-[#cacfd8] transition"
              >
                {section.btn}
              </button>
            )}
          </motion.div>
        </section>
      ))}

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
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              Explore More
            </h2>
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
                  {/* Text Section */}
                  <div className="p-5 flex-grow flex flex-col">
                    <span className="text-xs font-medium text-gray-600">
                      {card.title}
                    </span>
                    <h3 className="text-base lg:text-sm font-medium text-gray-900 leading-snug mt-1">
                      {card.desc}
                    </h3>
                  </div>

                  {/* Image fills bottom half */}
                  <div
                    className="w-full h-1/2 bg-cover bg-bottom"
                    style={{ backgroundImage: `url(${card.img})` }}
                  />

                  {/* Floating + Button */}
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-md cursor-pointer"
                  >
                    <AddIcon className="text-white text-sm" />
                  </motion.div>
                </div>

                {/* Overlay Link */}
                {card.to.startsWith("#") ? (
                  <button
                    onClick={() => {
                      if (card.to === "#acts") scrollToActs();
                      else if (card.to === "#compare") scrollToCompare();
                      else if (card.to === "#news") scrollToNews();
                    }}
                    className="absolute inset-0 z-10"
                    aria-label={`Explore ${card.title}`}
                  />
                ) : (
                  <Link
                    to={card.to}
                    className="absolute inset-0 z-10"
                    aria-label={`Explore ${card.title}`}
                  />
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
        <ActsExplorer embedded={true} />
      </section>

      {/* --- Compare Acts Section --- */}
      <section
        ref={compareRef}
        id="compare"
        className="py-12 bg-[#fdfdfd] text-gray-900"
        style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
      >
        <CompareActs embedded={true} />
      </section>

      {/* --- News Feed Section (Inserted below compare) --- */}
      <section
        ref={newsRef}
        id="news"
        className="py-12 bg-[#fdfdfd] text-gray-900"
        style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
      >
        {/* render NewsFeed in embedded mode to avoid full page styling clashes */}
        <NewsFeed embedded={true} />
      </section>

      {/* --- Contact Section --- */}
      <section
        ref={contactRef}
        className="py-12 text-center bg-[#fdfdfd]"
        id="contact"
        style={{ scrollMarginTop: `${HEADER_HEIGHT}px` }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="container mx-auto px-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Get in Touch
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Questions or suggestions? We'd love to hear from you.
          </p>

          <motion.form
            ref={form}
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
              className="bg-black text-white px-8 py-3 rounded-md font-semibold mt-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Send Message
            </motion.button>
          </motion.form>

          {/* Social icons */}
          <div className="flex justify-center gap-6 mt-10 text-gray-600">
            {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map(
              (Icon, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon className="cursor-pointer hover:text-black" />
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
