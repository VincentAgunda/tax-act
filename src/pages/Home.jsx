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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const heroSlides = [
  {
    img: "/hero-3.jpg",
    title: "Navigate Tax Acts",
    desc: "Your complete resource for tax legislation and news.",
    btn1: { text: "Explore Acts", to: "/acts" },
    btn2: { text: "Latest News", to: "/news" },
  },
  {
    img: "/hero-3.png",
    title: "Compare Versions",
    desc: "Track legislative changes across different versions.",
    btn1: { text: "Compare Now", to: "/compare" },
    btn2: { text: "Learn More", to: "/about" },
  },
  {
    img: "/hero-3.jpg",
    title: "Stay Informed",
    desc: "Get the latest updates about tax laws and policies.",
    btn1: { text: "See News", to: "/news" },
    btn2: { text: "Contact Us", to: "/contact" },
  },
];

const exploreCards = [
  {
    title: "Acts Library",
    desc: "Search and access every act in one place.",
    img: "/hero-3.jpg",
    to: "/acts",
  },
  {
    title: "Compare Tools",
    desc: "Spot changes between different versions quickly.",
    img: "/hero-1.png",
    to: "/compare",
  },
  {
    title: "Tax News",
    desc: "Stay up to date with tax-related policies.",
    img: "/hero-3.png",
    to: "/news",
  },
  {
    title: "Insights",
    desc: "Deep analysis of legislative changes and impacts.",
    img: "/hero-1.png",
    to: "/insights",
  },
];

const Home = () => {
  const [current, setCurrent] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const form = useRef();

  // Hero auto-slide
  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  // Explore More auto-scroll
  const nextCard = () => {
    setCardIndex((prev) => (prev + 1) % exploreCards.length);
  };

  const prevCard = () => {
    setCardIndex((prev) => (prev - 1 + exploreCards.length) % exploreCards.length);
  };

  useEffect(() => {
    const timer = setInterval(nextCard, 5000);
    return () => clearInterval(timer);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", form.current, "YOUR_PUBLIC_KEY")
      .then(() => {
        alert("Message sent successfully!");
        form.current.reset();
      })
      .catch(() => alert("Failed to send message. Please try again."));
  };

  return (
    <div className="bg-black text-white">
      {/* --- Hero Carousel --- */}
      <section className="relative w-full aspect-video overflow-hidden">
        {heroSlides.map((slide, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: i === current ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${slide.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: i === current ? 1 : 0,
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        ))}

        {/* Hero Content */}
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {heroSlides[current].title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            {heroSlides[current].desc}
          </p>
          <div className="flex flex-row justify-center gap-4">
            <Link
              to={heroSlides[current].btn1.to}
              className="bg-white text-black px-6 sm:px-10 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
            >
              {heroSlides[current].btn1.text}
            </Link>
            <Link
              to={heroSlides[current].btn2.to}
              className="bg-transparent border border-white px-6 sm:px-10 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition"
            >
              {heroSlides[current].btn2.text}
            </Link>
          </div>
        </motion.div>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition ${
                i === current ? "bg-white" : "bg-gray-500"
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
          icon: <CompareArrowsIcon fontSize="large" className="mb-4 text-black" />,
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
          className="relative min-h-[70vh] flex flex-col items-center justify-center text-center py-20"
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
            <h2 className="text-4xl md:text-6xl font-bold mb-4">{section.title}</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">{section.desc}</p>
            <Link
              to={section.to}
              className="bg-white text-black px-10 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
            >
              {section.btn}
            </Link>
          </motion.div>
        </section>
      ))}

      {/* --- Explore More Carousel --- */}
      <section className="bg-white text-black py-16 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Explore More
          </h2>

          <div className="relative">
            {/* Track */}
            <motion.div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                width: `${exploreCards.length * 100}%`,
                transform: `translateX(-${(cardIndex * 100) / exploreCards.length}%)`,
              }}
            >
              {exploreCards.map((card, i) => (
                <div
                  key={i}
                  className="w-1/5 sm:w-1/8 md:w-1/10 lg:w-1/12 flex-shrink-0 px-0.5"
                >
                  <div className="rounded-md overflow-hidden shadow group relative aspect-square">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-0.5">
                      <h3 className="text-[8px] font-semibold text-white mb-0.5">{card.title}</h3>
                      <p className="text-gray-200 mb-0.5 text-[8px] leading-tight">{card.desc}</p>
                      <Link
                        to={card.to}
                        className="bg-white text-black px-1 py-0.5 rounded-sm font-medium hover:bg-gray-200 transition text-[8px]"
                      >
                        Learn
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Left Arrow */}
            <button
              onClick={prevCard}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md shadow-lg hover:bg-white text-black rounded-full p-0.5 transition"
            >
              <ArrowBackIosNewIcon style={{ fontSize: "12px" }} />
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextCard}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md shadow-lg hover:bg-white text-black rounded-full p-0.5 transition"
            >
              <ArrowForwardIosIcon style={{ fontSize: "12px" }} />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {exploreCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCardIndex(i)}
                  className={`w-1 h-1 rounded-full transition ${
                    i === cardIndex ? "bg-black" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section className="bg-gray-50 text-black py-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="container mx-auto px-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Get in Touch</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-10">
            Questions or suggestions? We'd love to hear from you.
          </p>
          <form
            ref={form}
            onSubmit={sendEmail}
            className="max-w-xl mx-auto flex flex-col gap-4"
          >
            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              required
              className="w-full p-3 rounded-md bg-white border border-gray-300 focus:ring-2 focus:ring-gray-700"
            />
            <input
              type="email"
              name="user_email"
              placeholder="Your Email"
              required
              className="w-full p-3 rounded-md bg-white border border-gray-300 focus:ring-2 focus:ring-gray-700"
            />
            <textarea
              name="message"
              rows="4"
              placeholder="Your Message"
              required
              className="w-full p-3 rounded-md bg-white border border-gray-300 focus:ring-2 focus:ring-gray-700"
            />
            <button
              type="submit"
              className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition"
            >
              Send Message
            </button>
          </form>
          <div className="flex justify-center gap-6 mt-10 text-gray-600">
            <FacebookIcon className="cursor-pointer hover:text-black" />
            <TwitterIcon className="cursor-pointer hover:text-black" />
            <LinkedInIcon className="cursor-pointer hover:text-black" />
            <InstagramIcon className="cursor-pointer hover:text-black" />
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
