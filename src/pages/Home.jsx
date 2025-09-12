import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

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
    img: "/hero-5.jpg",
    title: "Navigate Tax Acts",
    desc: "Your complete resource for tax legislation and news.",
    btn1: { text: "Explore Acts", to: "/acts" },
    btn2: { text: "Latest News", to: "/news" },
  },
  {
    img: "/hero-6.jpg",
    title: "Compare Versions",
    desc: "Track legislative changes across different versions.",
    btn1: { text: "Compare Now", to: "/compare" },
    btn2: { text: "Learn More", to: "/about" },
  },
  {
    img: "/hero-5.jpg",
    title: "Stay Informed",
    desc: "Get the latest updates about tax laws and policies.",
    btn1: { text: "See News", to: "/news" },
    btn2: { text: "Contact Us", to: "#contact" }, // will scroll
  },
];

const exploreCards = [
  {
    title: "Acts Library",
    desc: "Search and access every act in one place.",
    img: "/hero-5.jpg",
    to: "/acts",
    bgColor: "#f5f5f7", // Apple Off-White
  },
  {
    title: "Compare Tools",
    desc: "Spot changes between different versions quickly.",
    img: "/hero-4.jpg",
    to: "/compare",
    bgColor: "#eff6fb", // Light Gray Tint
  },
  {
    title: "Tax News",
    desc: "Stay up to date with tax-related policies.",
    img: "/hero-6.jpg",
    to: "/news",
    bgColor: "#f5f5f7", // Almost White
  },
  {
    title: "Insights",
    desc: "Deep analysis of legislative changes and impacts.",
    img: "/hero-5.jpg",
    to: "/acts", // changed from /insights
    bgColor: "#eeedf2", // Soft Blue-Tinted Gray
  },
];

const Home = () => {
  const [current, setCurrent] = useState(0);
  const form = useRef();
  const contactRef = useRef(null);

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

  // Smooth scroll handler
  const scrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-black text-white">
      {/* --- Hero Carousel --- */}
      <section className="relative w-full h-[75vh] min-h-[500px] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: i === current ? 1 : 0,
              scale: i === current ? 1 : 1.05,
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${slide.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: i === current ? 1 : 0,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/10" />
          </motion.div>
        ))}

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-md">
              {heroSlides[current].title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto drop-shadow">
              {heroSlides[current].desc}
            </p>
            <div className="flex flex-row items-center justify-center gap-4 flex-wrap">
              <Link
                to={heroSlides[current].btn1.to}
                className="bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition text-center shadow-md"
              >
                {heroSlides[current].btn1.text}
              </Link>

              {heroSlides[current].btn2.to === "#contact" ? (
                <button
                  onClick={scrollToContact}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-md font-semibold hover:bg-white/30 transition text-center shadow-md"
                >
                  {heroSlides[current].btn2.text}
                </button>
              ) : (
                <Link
                  to={heroSlides[current].btn2.to}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-md font-semibold hover:bg-white/30 transition text-center shadow-md"
                >
                  {heroSlides[current].btn2.text}
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hero dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-8 bg-white" : "w-3 bg-gray-400/70"
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
          to: "/acts",
          bg: "#DDDDDD",
          btn: "View Acts",
          icon: <MenuBookIcon fontSize="large" className="mb-4 text-black" />,
          overlay: "bg-black/20",
          textColor: "text-black",
        },
        {
          title: "Compare Versions",
          desc: "Easily track legislative changes across different versions.",
          to: "/compare",
          bg: "#AAAAAA",
          btn: "Compare Now",
          icon: (
            <CompareArrowsIcon fontSize="large" className="mb-4 text-black" />
          ),
          overlay: "bg-black/10",
          textColor: "text-black",
        },
        {
          title: "Stay Informed",
          desc: "Get the latest news and updates about tax laws and policy changes.",
          to: "/news",
          bg: "/news-bg.jpg",
          btn: "See News",
          icon: <NewspaperIcon fontSize="large" className="mb-4 text-white" />,
          overlay: "bg-white/20",
          textColor: "text-white",
        },
      ].map((section, i) => (
        <section
          key={i}
          className="relative min-h-[60vh] flex flex-col items-center justify-center text-center py-16"
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
            className={`relative z-10 px-4 flex flex-col items-center ${section.textColor}`}
          >
            {section.icon}
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {section.title}
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">{section.desc}</p>
            <Link
              to={section.to}
              className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
            >
              {section.btn}
            </Link>
          </motion.div>
        </section>
      ))}

      {/* --- Explore More Section --- */}
      <section className="py-16 bg-[#fdfdfd]">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
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
                  className="h-80 rounded-3xl overflow-hidden shadow-sm group relative flex flex-col"
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
                <Link
                  to={card.to}
                  className="absolute inset-0 z-10"
                  aria-label={`Explore ${card.title}`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section
        ref={contactRef}
        className="py-16 text-center bg-[#fdfdfd]"
        id="contact"
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
          <p className="text-gray-600 max-w-xl mx-auto mb-10">
            Questions or suggestions? We'd love to hear from you.
          </p>

          <motion.form
            ref={form}
            onSubmit={sendEmail}
            className="max-w-xl mx-auto flex flex-col gap-4 p-6 md:p-8 rounded-2xl bg-white border border-gray-200 shadow-lg"
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
