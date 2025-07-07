import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  Target, 
  Users, 
  Shield, 
  Award, 
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Globe,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

export const metadata: Metadata = {
  title: 'About Mintoons | Our Mission to Empower Young Storytellers',
  description: 'Learn about Mintoons mission to help children become amazing storytellers through AI collaboration, teacher mentorship, and creative exploration in a safe, educational environment.',
  keywords: 'about mintoons, mission, team, children education, creative writing, AI storytelling, child development, educational technology',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'About Mintoons - Empowering Young Storytellers',
    description: 'Discover how Mintoons is revolutionizing creative writing education for children through AI collaboration and teacher mentorship.',
    type: 'website',
    url: 'https://mintoons.com/about',
    images: [
      {
        url: '/images/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About Mintoons - Our Team and Mission',
      },
    ],
    siteName: 'Mintoons',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Mintoons - Empowering Young Storytellers',
    description: 'Learn about our mission to help children become amazing storytellers.',
    images: ['/images/twitter-about.jpg'],
    creator: '@mintoons',
  },
  alternates: {
    canonical: 'https://mintoons.com/about',
  },
};

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Co-Founder',
    bio: 'Former elementary teacher with 15 years of experience. Passionate about combining education with technology.',
    image: '/images/team/sarah.jpg',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
  },
  {
    name: 'Dr. Michael Chen',
    role: 'CTO & Co-Founder',
    bio: 'AI researcher and father of two. Expert in natural language processing and child-safe AI systems.',
    image: '/images/team/michael.jpg',
    linkedin: 'https://linkedin.com/in/michaelchen',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Education',
    bio: 'Curriculum specialist with expertise in creative writing pedagogy and child development.',
    image: '/images/team/emily.jpg',
    linkedin: 'https://linkedin.com/in/emilyrodriguez',
  },
  {
    name: 'James Wilson',
    role: 'Lead AI Engineer',
    bio: 'Machine learning engineer focused on creating safe, educational AI interactions for children.',
    image: '/images/team/james.jpg',
    linkedin: 'https://linkedin.com/in/jameswilson',
  },
];

const values = [
  {
    icon: Shield,
    title: 'Child Safety First',
    description: 'COPPA compliant platform with rigorous safety measures and content moderation.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Heart,
    title: 'Nurturing Creativity',
    description: 'Fostering imagination and creative expression through supportive AI collaboration.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    icon: Users,
    title: 'Human Connection',
    description: 'Real teachers providing meaningful feedback and mentorship to every child.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Target,
    title: 'Educational Excellence',
    description: 'Evidence-based approach to improving writing skills and building confidence.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

const milestones = [
  {
    year: '2023',
    title: 'Mintoons Founded',
    description: 'Started with a simple idea: help children write better stories with AI assistance.',
    icon: Sparkles,
  },
  {
    year: '2023',
    title: 'First 100 Students',
    description: 'Launched beta program with local schools and saw immediate positive results.',
    icon: Users,
  },
  {
    year: '2024',
    title: 'Teacher Program Launch',
    description: 'Introduced mentor feedback system connecting real teachers with student writers.',
    icon: Award,
  },
  {
    year: '2024',
    title: '10,000+ Families',
    description: 'Reached major milestone with families across 25 countries using Mintoons.',
    icon: Globe,
  },
];

const stats = [
  { label: 'Stories Created', value: '50,000+', icon: BookOpen },
  { label: 'Happy Families', value: '10,000+', icon: Heart },
  { label: 'Countries Served', value: '25+', icon: Globe },
  { label: 'Average Improvement', value: '85%', icon: TrendingUp },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Heart className="w-3 h-3 mr-1" />
              Our Story
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Empowering Young Minds to
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {' '}Create Magic
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              At Mintoons, we believe every child has incredible stories to tell. Our mission is to provide 
              the tools, guidance, and inspiration they need to become confident, creative writers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Join Our Community
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#story">
                <Button variant="outline" size="lg">
                  Read Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4 mx-auto">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                It Started with a Simple Question
              </h2>
              <div className="prose text-gray-600 text-lg leading-relaxed">
                <p className="mb-6">
                  <strong>"How can we help children fall in love with writing?"</strong>
                </p>
                <p className="mb-6">
                  As a former elementary teacher, our founder Sarah noticed that many children 
                  struggled with creative writing - not because they lacked imagination, but because 
                  they needed more personalized guidance and encouragement.
                </p>
                <p className="mb-6">
                  When she met Dr. Michael Chen, an AI researcher and father, they realized they 
                  could combine the power of artificial intelligence with human mentorship to create 
                  something special: a platform where children collaborate WITH AI to tell their stories.
                </p>
                <p>
                  Today, Mintoons helps thousands of children discover the joy of storytelling while 
                  developing crucial writing skills that will benefit them throughout their lives.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <Image
                src="/images/about-story.jpg"
                alt="Children engaged in creative writing"
                width={600}
                height={400}
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-purple-500" />
                  Founded in 2023
                </div>
                <div className="font-semibold text-gray-900 mt-1">
                  "Every child deserves to feel like a great storyteller."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our values guide everything we do, from product development to customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={value.title} className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 ${value.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                    <value.icon className={`w-6 h-6 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in our mission to transform children's writing education
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <milestone.icon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className="mr-3">{milestone.year}</Badge>
                    <h3 className="text-xl font-semibold text-gray-900">{milestone.title}</h3>
                  </div>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate educators, technologists, and parents working together to help children 
              discover the joy of storytelling.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={member.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={120}
                    height={120}
                    className="rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Help us empower the next generation of storytellers. Whether you're a parent, teacher, 
            or just someone who believes in the power of creativity, there's a place for you in our community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Your Journey
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <Users className="w-4 h-4 mr-2" />
                Get in Touch
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-purple-100">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              COPPA Compliant
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Educator Approved
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Parent Trusted
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}