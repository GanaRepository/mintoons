'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Play,
  Star,
  CheckCircle,
  Zap,
  Shield,
  Heart,
  TrendingUp,
  MessageCircle,
  PenTool,
  Brain,
  Target,
  Clock,
  Crown,
  ChevronDown,
  Quote,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

const features = [
  {
    icon: Brain,
    title: 'AI Collaboration',
    description: 'Work WITH AI, not just use it. Our AI responds to your ideas and helps you grow as a writer.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Users,
    title: 'Teacher Mentorship',
    description: 'Get personalized feedback from real teachers who help you improve your writing skills.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Watch your writing skills improve with detailed analytics and achievement badges.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Shield,
    title: 'Safe Environment',
    description: 'COPPA compliant platform designed specifically for children with privacy protection.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

const testimonials = [
  {
    name: 'Emma Thompson',
    role: 'Parent of 8-year-old',
    content: "My daughter has written 15 stories already! Her creativity has exploded since joining Mintoons.",
    rating: 5,
    image: '/images/parent1.jpg',
  },
  {
    name: 'Sarah Chen',
    role: 'Elementary Teacher',
    content: "I use Mintoons with my class. The AI collaboration teaches kids to think creatively while writing.",
    rating: 5,
    image: '/images/teacher1.jpg',
  },
  {
    name: 'Michael Roberts',
    role: 'Father of twins (age 10)',
    content: "Both my kids love writing stories now. The AI makes it fun while teachers provide real guidance.",
    rating: 5,
    image: '/images/parent2.jpg',
  },
];

const stats = [
  { label: 'Stories Created', value: '50,000+', icon: BookOpen },
  { label: 'Happy Families', value: '10,000+', icon: Heart },
  { label: 'Teacher Mentors', value: '500+', icon: Users },
  { label: 'Countries', value: '25+', icon: Star },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '50 stories per child',
      'AI story collaboration',
      'Basic progress tracking',
      'PDF story exports',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/register',
    popular: false,
  },
  {
    name: 'Basic',
    price: '$9.99',
    period: 'per month',
    description: 'Great for regular writers',
    features: [
      '100 stories per child',
      'AI story collaboration',
      'Teacher feedback',
      'Advanced progress tracking',
      'PDF & Word exports',
      'Priority support',
    ],
    cta: 'Start Basic',
    href: '/register?plan=basic',
    popular: true,
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: 'per month',
    description: 'Best for serious young writers',
    features: [
      '200 stories per child',
      'AI story collaboration',
      'Teacher feedback',
      'Advanced analytics',
      'Multiple export formats',
      'AI illustrations',
      'Priority support',
    ],
    cta: 'Start Premium',
    href: '/register?plan=premium',
    popular: false,
  },
];

export default function HomeClient() {
  const { data: session } = useSession();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const featuresY = useTransform(scrollY, [300, 800], [0, -30]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20 sm:py-32">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"
          style={{ y: heroY }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Story Writing Platform
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Where Young Minds
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {' '}Create Magic
                </span>
              </h1>
              
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Help your child become an amazing storyteller through AI collaboration, 
                teacher mentorship, and creative exploration. Join thousands of families 
                on this writing adventure!
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {session ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Start Free Today
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsVideoPlaying(true)}
                  className="border-purple-200 hover:border-purple-300"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  COPPA compliant
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  No credit card required
                </div>
              </div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <Image
                  src="/images/hero-kids-writing.jpg"
                  alt="Children writing creative stories with AI assistance"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                  priority
                />
                
                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="w-8 h-8 text-yellow-800" />
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4 mx-auto">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        style={{ y: featuresY }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Parents & Teachers Choose Mintoons
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've designed the perfect environment for children to develop their writing skills 
              through AI collaboration and expert guidance.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Story Creation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our proven process helps children create amazing stories while developing their writing skills.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Choose Elements',
                description: 'Select genre, characters, setting, and mood to spark creativity',
                icon: Target,
              },
              {
                step: '2',
                title: 'Collaborate with AI',
                description: 'Write together with our AI assistant that responds to your ideas',
                icon: MessageCircle,
              },
              {
                step: '3',
                title: 'Get Teacher Feedback',
                description: 'Receive personalized comments and suggestions to improve',
                icon: PenTool,
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-yellow-800">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Families Are Saying
            </h2>
            <p className="text-xl text-gray-600">
              Hear from parents and teachers who've seen amazing results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-purple-300 mb-4" />
                    <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="rounded-full mr-4"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade as your child's writing journey grows. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href={plan.href}>
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-600 mb-4">
              Need a plan for schools or larger families?
            </p>
            <Link href="/contact">
              <Button variant="outline">
                Contact Sales
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Spark Your Child's Creativity?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of families who are helping their children become amazing storytellers. 
              Start your free journey today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Free Account
                    </Button>
                  </Link>
                  <Link href="/explore-stories">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explore Sample Stories
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-purple-100">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                COPPA Compliant
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Trusted by 10,000+ families
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Setup in 2 minutes
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            className="bg-white rounded-lg max-w-4xl w-full aspect-video"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Replace with actual video embed */}
              <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Mintoons Demo Video</h3>
                  <p className="text-gray-300">See how children create amazing stories with AI assistance</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}