import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | Mintoons - Get in Touch',
  description: 'Contact Mintoons for support, feedback, or questions about our AI-powered story writing platform for children.',
  keywords: ['contact', 'support', 'help', 'feedback', 'mintoons', 'children writing'],
  openGraph: {
    title: 'Contact Us | Mintoons',
    description: 'Get in touch with Mintoons for support and feedback',
    type: 'website',
    url: 'https://mintoons.com/contact',
    images: [
      {
        url: 'https://mintoons.com/images/og-contact.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Mintoons',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Mintoons',
    description: 'Get in touch with Mintoons for support and feedback',
    images: ['https://mintoons.com/images/og-contact.jpg'],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}