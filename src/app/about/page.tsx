'use client';

import { motion } from 'framer-motion';
import { Users, Award, Globe, Heart } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Natural Beauty",
      description: "We believe in enhancing your natural beauty with products made from the finest natural ingredients."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Quality Excellence",
      description: "Every product undergoes rigorous testing to ensure the highest quality and safety standards."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Reach",
      description: "Serving customers worldwide with a commitment to sustainability and ethical practices."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "Building strong communities through our network of consultants and satisfied customers."
    }
  ];

  const stats = [
    { number: "50+", label: "Years of Excellence" },
    { number: "60+", label: "Countries Worldwide" },
    { number: "3M+", label: "Happy Customers" },
    { number: "1000+", label: "Premium Products" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#4CAF50] to-[#7E57C2] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Oriflame
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Discover the beauty of nature with our premium cosmetics and wellness products, 
              crafted with love and inspired by Swedish heritage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 1967 in Sweden, Oriflame has been at the forefront of natural beauty 
                innovation for over five decades. Our journey began with a simple vision: to bring 
                the power of nature to beauty enthusiasts around the world.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we continue to honor our Swedish heritage while embracing modern science 
                to create products that celebrate your unique beauty. From skincare to makeup, 
                fragrance to wellness, every Oriflame product is crafted with care and precision.
              </p>
              <p className="text-lg text-gray-600">
                In the Coast Region, we're proud to bring this legacy of excellence to our 
                community, offering not just premium products but also opportunities for 
                personal and professional growth.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#4CAF50]/10 to-[#7E57C2]/10 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#4CAF50] to-[#7E57C2] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">50+ Years</h3>
                  <p className="text-gray-600">of Beauty Innovation</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do, from product development to customer service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#4CAF50] to-[#7E57C2] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that reflect our commitment to excellence and global reach.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#4CAF50] to-[#7E57C2] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Our Beauty Journey
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Discover premium products that celebrate your natural beauty and join a community 
              that values quality, sustainability, and personal growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#4CAF50] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#4CAF50] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}