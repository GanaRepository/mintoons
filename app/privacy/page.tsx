import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Eye, Lock, Users, FileText, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Mintoons - Protecting Your Child\'s Privacy',
  description: 'Learn how Mintoons protects your child\'s privacy and personal information. We are COPPA compliant and committed to the highest standards of data protection.',
  keywords: 'privacy policy, COPPA compliance, child privacy, data protection, children safety, personal information',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Policy - Mintoons',
    description: 'Protecting your child\'s privacy is our top priority. Learn about our COPPA-compliant privacy practices.',
    type: 'website',
    url: 'https://mintoons.com/privacy',
    siteName: 'Mintoons',
  },
  alternates: {
    canonical: 'https://mintoons.com/privacy',
  },
};

export default function PrivacyPage() {
  const lastUpdated = 'January 15, 2025';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your child's privacy and safety are our highest priorities. Learn how we protect 
              and handle personal information on Mintoons.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Privacy at a Glance
            </h2>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                We are fully COPPA compliant and prioritize children's safety
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                We collect minimal information necessary for the service
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                We never sell or share personal information with third parties
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Parents have full control over their child's account and data
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                All data is encrypted and securely stored
              </li>
            </ul>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-purple-600" />
                1. Introduction
              </h2>
              <p>
                Welcome to Mintoons ("we," "our," or "us"). We operate the Mintoons platform, 
                an AI-powered story writing platform designed specifically for children. This Privacy 
                Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our service.
              </p>
              <p>
                We are committed to protecting the privacy and safety of children who use our platform. 
                Our service is designed to comply with the Children's Online Privacy Protection Act 
                (COPPA) and other applicable privacy laws.
              </p>
            </section>

            {/* COPPA Compliance */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-green-600" />
                2. COPPA Compliance
              </h2>
              <p>
                Mintoons is designed for children under 13 and complies with COPPA requirements:
              </p>
              <ul>
                <li>
                  <strong>Parental Consent:</strong> We obtain verifiable parental consent before 
                  collecting personal information from children under 13.
                </li>
                <li>
                  <strong>Limited Collection:</strong> We collect only the minimum information 
                  necessary to provide our educational services.
                </li>
                <li>
                  <strong>No Behavioral Advertising:</strong> We do not use personal information 
                  for behavioral advertising to children.
                </li>
                <li>
                  <strong>Parental Rights:</strong> Parents can review, delete, or refuse further 
                  collection of their child's information at any time.
                </li>
                <li>
                  <strong>Safe Communication:</strong> All interactions are monitored and moderated 
                  for child safety.
                </li>
              </ul>
            </section>

            {/* Information We Collect */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                3. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Information</h3>
              <ul>
                <li>Name (first name and last initial for children)</li>
                <li>Email address (parent/guardian email for children under 13)</li>
                <li>Age or date of birth</li>
                <li>Username and password</li>
                <li>Parental consent records (for children under 13)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Educational Content</h3>
              <ul>
                <li>Stories written by the child</li>
                <li>Writing preferences and goals</li>
                <li>Progress and assessment data</li>
                <li>Teacher feedback and comments</li>
                <li>AI interaction logs (for service improvement)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Technical Information</h3>
              <ul>
                <li>Device type and operating system</li>
                <li>Browser type and version</li>
                <li>IP address (anonymized for children)</li>
                <li>Usage patterns and feature interactions</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-purple-600" />
                4. How We Use Information
              </h2>
              <p>We use collected information solely for educational purposes:</p>
              <ul>
                <li>Providing personalized writing assistance and feedback</li>
                <li>Tracking educational progress and achievements</li>
                <li>Connecting children with qualified teacher mentors</li>
                <li>Improving our AI writing assistance technology</li>
                <li>Ensuring platform safety and security</li>
                <li>Communicating with parents about their child's progress</li>
                <li>Providing customer support</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 We Do NOT Share Information With:</h3>
              <ul>
                <li>Advertisers or marketing companies</li>
                <li>Data brokers or analytics companies</li>
                <li>Social media platforms</li>
                <li>Any entity for commercial purposes</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Limited Sharing for Educational Purposes:</h3>
              <ul>
                <li>
                  <strong>Teachers/Mentors:</strong> Qualified educators can view assigned student 
                  work to provide feedback
                </li>
                <li>
                  <strong>Parents:</strong> Parents have full access to their child's account and progress
                </li>
                <li>
                  <strong>Service Providers:</strong> Trusted vendors who help us operate the platform 
                  (under strict confidentiality agreements)
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Legal Requirements:</h3>
              <p>
                We may disclose information if required by law, court order, or to protect the 
                safety of children or others.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
              <p>We implement industry-leading security measures:</p>
              <ul>
                <li>SSL/TLS encryption for all data transmission</li>
                <li>AES-256 encryption for stored data</li>
                <li>Regular security audits and penetration testing</li>
                <li>Multi-factor authentication for staff accounts</li>
                <li>Secure cloud infrastructure with redundant backups</li>
                <li>SOC 2 Type II compliance</li>
                <li>Regular staff security training</li>
              </ul>
            </section>

            {/* Parental Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Parental Rights and Controls</h2>
              <p>Parents have comprehensive rights regarding their child's information:</p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Access Rights:</h3>
              <ul>
                <li>View all information collected about your child</li>
                <li>Download your child's stories and progress data</li>
                <li>Review teacher feedback and AI interactions</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Control Rights:</h3>
              <ul>
                <li>Modify or update your child's information</li>
                <li>Control who can provide feedback on your child's work</li>
                <li>Set content preferences and restrictions</li>
                <li>Manage communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.3 Deletion Rights:</h3>
              <ul>
                <li>Delete specific stories or content</li>
                <li>Delete your child's entire account</li>
                <li>Request complete data removal from our systems</li>
              </ul>

              <p className="mt-4">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@mintoons.com" className="text-blue-600 hover:underline">
                  privacy@mintoons.com
                </a>.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
              <ul>
                <li>
                  <strong>Active Accounts:</strong> We retain data while the account is active 
                  and being used for educational purposes
                </li>
                <li>
                  <strong>Inactive Accounts:</strong> Data is automatically deleted after 2 years 
                  of inactivity
                </li>
                <li>
                  <strong>Deleted Accounts:</strong> Data is permanently removed within 30 days 
                  of deletion request
                </li>
                <li>
                  <strong>Legal Requirements:</strong> Some data may be retained longer if required 
                  by law or for safety purposes
                </li>
              </ul>
            </section>

            {/* International Users */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Users</h2>
              <p>
                While Mintoons is based in the United States, we welcome users from around the world. 
                By using our service, you consent to the transfer and processing of information in 
                the United States. We provide the same level of protection to all users regardless 
                of location.
              </p>
              <p>
                For users in the European Union, we comply with GDPR requirements and provide 
                additional rights as required by law.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cookies and Tracking</h2>
              <p>We use minimal tracking technologies:</p>
              <ul>
                <li>
                  <strong>Essential Cookies:</strong> Required for login and basic functionality
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us improve the platform (anonymized for children)
                </li>
                <li>
                  <strong>No Advertising Cookies:</strong> We never use cookies for advertising 
                  or behavioral tracking
                </li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences. Disabling cookies 
                may limit some functionality.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices 
                or legal requirements. We will:
              </p>
              <ul>
                <li>Notify parents via email of any material changes</li>
                <li>Post the updated policy on our website</li>
                <li>Obtain fresh parental consent if required by law</li>
                <li>Provide at least 30 days notice before changes take effect</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-green-600" />
                12. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, 
                please contact us:
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Privacy Team</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@mintoons.com</p>
                  <p><strong>Phone:</strong> 1-800-MINTOONS (1-800-646-8666)</p>
                  <p><strong>Mail:</strong><br />
                    Mintoons Privacy Officer<br />
                    123 Education Avenue<br />
                    San Francisco, CA 94102<br />
                    United States
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  We respond to all privacy inquiries within 48 hours.
                </p>
              </div>
            </section>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Questions About Privacy?</h3>
            <p className="text-purple-100 mb-6">
              Our privacy team is here to help. We're committed to transparency and protecting 
              your child's information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@mintoons.com"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Email Privacy Team
              </a>
              <Link
                href="/contact"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}