'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Crown,
  BookOpen,
  Users,
  Shield,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Heart,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const footerLinks = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'AI Technology', href: '/ai-technology' },
    { name: 'Sample Stories', href: '/explore-stories' },
  ],
  resources: [
    { name: 'Writing Tips', href: '/resources/writing-tips' },
    { name: 'Parent Guide', href: '/resources/parent-guide' },
    { name: 'Teacher Resources', href: '/resources/teachers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Help Center', href: '/help' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/about#story' },
    { name: 'Team', href: '/about#team' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press Kit', href: '/press' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'COPPA Compliance', href: '/coppa' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
};

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/mintoons',
    icon: Facebook,
    color: 'hover:text-blue-600',
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/mintoons',
    icon: Twitter,
    color: 'hover:text-blue-400',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/mintoons',
    icon: Instagram,
    color: 'hover:text-pink-600',
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/mintoons',
    icon: Youtube,
    color: 'hover:text-red-600',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/mintoons',
    icon: Github,
    color: 'hover:text-gray-900',
  },
];

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@mintoons.com',
    href: 'mailto:hello@mintoons.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'San Francisco, CA',
    href: 'https://maps.google.com/?q=San+Francisco,+CA',
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center space-x-3 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-yellow-800" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Mintoons
                </div>
                <div className="text-xs text-gray-400">AI Story Platform</div>
              </div>
            </motion.div>

            <motion.p
              className="text-gray-300 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Empowering children to become amazing storytellers through AI collaboration, 
              teacher mentorship, and creative exploration. Join thousands of young writers 
              on their creative journey.
            </motion.p>

            {/* Contact Info */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {contactInfo.map((contact) => (
                <Link
                  key={contact.label}
                  href={contact.href}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group"
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <contact.icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                  <span className="text-sm">{contact.value}</span>
                  {contact.href.startsWith('http') && (
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-purple-400" />
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-400" />
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-400" />
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-yellow-400" />
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <motion.div
        className="border-t border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300">
                Get the latest updates, writing tips, and educational resources.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
              />
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <motion.div
              className="text-gray-400 text-sm text-center md:text-left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="flex items-center justify-center md:justify-start">
                © {currentYear} Mintoons. Made with{' '}
                <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
                for young storytellers.
              </p>
              <p className="mt-1">
                All rights reserved. Committed to child safety and privacy.
              </p>
            </motion.div>

            {/* Social Links */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-colors p-2 rounded-lg hover:bg-gray-800 group`}
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            className="mt-6 pt-6 border-t border-gray-800 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Mintoons is committed to creating a safe, educational environment for children.
              </p>
              <p>
                COPPA compliant • SOC 2 certified • SSL encrypted • 99.9% uptime
              </p>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <span className="flex items-center">
                  <Shield className="w-3 h-3 mr-1 text-green-400" />
                  Secure
                </span>
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1 text-blue-400" />
                  Trusted by 10,000+ families
                </span>
                <span className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1 text-purple-400" />
                  50,000+ stories created
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}