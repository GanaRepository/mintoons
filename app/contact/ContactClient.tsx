'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  Heart,
  Shield,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          role: '',
          subject: '',
          message: '',
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'hello@mintoons.com',
      description: 'Send us an email anytime',
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-6PM EST',
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'San Francisco, CA',
      description: 'United States',
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      icon: Clock,
      title: 'Support Hours',
      details: '24/7 Available',
      description: 'Online chat support',
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  const faqItems = [
    {
      question: 'How does AI story writing work?',
      answer: 'Our AI collaborates with children by responding to their story ideas, helping them develop characters, plot, and dialogue while maintaining their creative voice.'
    },
    {
      question: 'Is Mintoons safe for children?',
      answer: 'Yes! We\'re COPPA compliant with content moderation, parental controls, and secure data handling. All interactions are monitored for safety.'
    },
    {
      question: 'What ages is Mintoons designed for?',
      answer: 'Mintoons is designed for children ages 6-16, with age-appropriate content and difficulty levels that adapt to each child\'s writing ability.'
    },
    {
      question: 'How do teachers provide feedback?',
      answer: 'Teachers can comment on stories using our Google Docs-style commenting system, providing grammar help, creative suggestions, and encouragement.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about Mintoons? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 ${info.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className={`w-6 h-6 ${info.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-gray-900 font-medium mb-1">
                  {info.details}
                </p>
                <p className="text-sm text-gray-600">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a... *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select your role</option>
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="school_admin">School Administrator</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-600">
                  Quick answers to common questions about Mintoons.
                </p>
              </div>

              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                      <MessageSquare className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 ml-8">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Why Choose Mintoons?</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3" />
                    <span>COPPA Compliant & Secure</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3" />
                    <span>Trusted by 1000+ Families</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-3" />
                    <span>Educational Excellence</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 mr-3" />
                    <span>Built for Children</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Writing Amazing Stories?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of young writers discovering the joy of storytelling with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-xl hover:bg-white hover:text-purple-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}