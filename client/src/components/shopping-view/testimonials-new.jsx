import React from 'react';
import Slider from 'react-slick';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import FeedbackCard from './feedback-card';
import { motion } from 'framer-motion';

// Updated testimonials for a clothing store
const testimonials = [
  {
    name: "Sophia Chen",
    title: "Fashion Enthusiast",
    review:
      "The quality of their clothing is exceptional! Every piece I've purchased has become a staple in my wardrobe. The attention to detail and fit is perfect.",
    image: "https://randomuser.me/api/portraits/women/25.jpg",
  },
  {
    name: "Emma Wilson",
    title: "Loyal Customer",
    review: "I love how their collections are always on-trend yet timeless. The fabrics are comfortable and the styles are versatile enough for both work and weekends.",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
  {
    name: "Olivia Martinez",
    title: "Style Blogger",
    review: "As someone who's very particular about fashion, I'm impressed by their consistent quality and design aesthetic. Their customer service is also outstanding!",
    image: "https://randomuser.me/api/portraits/women/35.jpg",
  },
  {
    name: "Ava Johnson",
    title: "Fashion Consultant",
    review: "The pieces I ordered arrived promptly and exceeded my expectations. The fit is perfect and the materials are high quality. Will definitely shop here again!",
    image: "https://randomuser.me/api/portraits/women/40.jpg",
  },
  {
    name: "Isabella Taylor",
    title: "Regular Shopper",
    review: "Their clothing has transformed my wardrobe. The pieces mix and match beautifully, and I always receive compliments when wearing their designs.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
];

const Testimonials = () => {
  const settings = {
    className: "testimonial-slider",
    infinite: true,
    autoplay: true,
    dots: true,
    autoplaySpeed: 5000,
    slidesToShow: 3,
    nextArrow: <NextIcon />,
    prevArrow: <PrevIcon />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    appendDots: dots => (
      <div>
        <ul className="mt-8"> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="w-3 h-3 mx-1 rounded-full bg-gray-200 hover:bg-gray-400 transition-colors"></div>
    ),
  };

  return (
    <div className='relative'>
      <div className='w-full mx-auto relative pb-16'>
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </Slider>

        {/* Feedback button positioned at the bottom center */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-center mt-8">
          <FeedbackCard />
        </div>
      </div>
    </div>
  );
};

// Modern testimonial card component
const TestimonialCard = ({ testimonial, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 50,
      }}
      className="px-4"
    >
      <div className="bg-white p-8 border border-gray-200 shadow-sm h-full flex flex-col">
        {/* Quote icon */}
        <div className="mb-6 text-gray-300">
          <Quote size={32} />
        </div>

        {/* Review text */}
        <p className="text-gray-600 mb-8 flex-grow leading-relaxed">"{testimonial.review}"</p>

        {/* Customer info */}
        <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
          />
          <div className="ml-4">
            <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
            <p className="text-sm text-gray-500">{testimonial.title}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Previous and Next arrows with updated styling
const PrevIcon = ({ onClick }) => {
  return (
    <button
      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-colors"
      onClick={onClick}
      aria-label="Previous"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
};

const NextIcon = ({ onClick }) => {
  return (
    <button
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-colors"
      onClick={onClick}
      aria-label="Next"
    >
      <ArrowRight className="w-5 h-5" />
    </button>
  );
};

export default Testimonials;