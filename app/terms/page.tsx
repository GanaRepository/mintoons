import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Scale, Shield, Users, AlertTriangle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Mintoons - Platform Usage Guidelines',
  description: 'Read the Terms of Service for Mintoons, outlining the rules and guidelines for using our AI-powered story writing platform safely and responsibly.',
  keywords: 'terms of service, terms of use, platform rules, user agreement, children safety, usage guidelines',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Terms of Service - Mintoons',
    description: 'Understanding the terms and conditions for using Mintoons safely and responsibly.',
    type: 'website',
    url: 'https://mintoons.com/terms',
    siteName: 'Mintoons',
  },
  alternates: {
    canonical: 'https://mintoons.com/terms',
  },
};

export default function TermsPage() {
  const lastUpdated = 'January 15, 2025';
  const effectiveDate = 'January 15, 2025';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <Scale className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These terms outline the rules and guidelines for using Mintoons safely and responsibly. 
              Please read them carefully.
            </p>
            <div className="text-sm text-gray-500 mt-4 space-y-1">
              <p>Last updated: {lastUpdated}</p>
              <p>Effective date: {effectiveDate}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-semibold text-amber-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Important Notice for Parents and Guardians
            </h2>
            <div className="text-amber-800 space-y-2">
              <p>
                <strong>If your child is under 13:</strong> You must read and agree to these terms 
                on behalf of your child before they can use Mintoons.
              </p>
              <p>
                <strong>Parental Supervision:</strong> We recommend parental supervision and involvement 
                in your child's creative writing journey.
              </p>
              <p>
                <strong>Educational Purpose:</strong> Mintoons is designed for educational use to help 
                children develop writing skills in a safe environment.
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Agreement */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-purple-600" />
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using Mintoons ("the Service"), you agree to be bound by these 
                Terms of Service ("Terms"). If you disagree with any part of these terms, 
                you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service, 
                including children under parental supervision.
              </p>
              <p>
                <strong>For Users Under 13:</strong> A parent or legal guardian must agree to these 
                Terms on behalf of the child and is responsible for the child's use of the Service.
              </p>
            </section>

            {/* Description of Service */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                2. Description of Service
              </h2>
              <p>
                Mintoons is an AI-powered story writing platform designed to help children 
                develop their creative writing skills through:
              </p>
              <ul>
                <li>Collaborative story creation with AI assistance</li>
                <li>Feedback and mentorship from qualified teachers</li>
                <li>Progress tracking and educational analytics</li>
                <li>A safe, moderated environment for creative expression</li>
              </ul>
              <p>
                The Service is intended for educational purposes and to foster creativity, 
                critical thinking, and writing skills in children.
              </p>
            </section>

            {/* User Accounts */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
              <ul>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>Parents must provide verifiable consent for children under 13</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must notify us immediately of any unauthorized access</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Account Types</h3>
              <ul>
                <li><strong>Student Accounts:</strong> For children to create and manage stories</li>
                <li><strong>Parent Accounts:</strong> To oversee and manage child accounts</li>
                <li><strong>Mentor Accounts:</strong> For qualified teachers to provide feedback</li>
                <li><strong>Admin Accounts:</strong> For platform management and safety oversight</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Account Termination</h3>
              <p>
                You may terminate your account at any time. We may suspend or terminate accounts 
                that violate these Terms or pose safety risks.
              </p>
            </section>

            {/* Acceptable Use */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-green-600" />
                4. Acceptable Use Policy
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Permitted Uses</h3>
              <ul>
                <li>Creating original stories and creative content</li>
                <li>Participating in educational writing activities</li>
                <li>Receiving and providing constructive feedback</li>
                <li>Using AI assistance for learning and creativity</li>
                <li>Accessing progress tracking and analytics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Prohibited Activities</h3>
              <p>You agree NOT to use the Service to:</p>
              <ul>
                <li>Create content that is harmful, offensive, or inappropriate for children</li>
                <li>Share personal information (addresses, phone numbers, etc.)</li>
                <li>Attempt to contact other users outside the platform</li>
                <li>Upload malicious code or attempt to hack the system</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate others or create false accounts</li>
                <li>Spam, harass, or bully other users</li>
                <li>Use the Service for commercial purposes without permission</li>
                <li>Copy or republish content without proper attribution</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Content Guidelines</h3>
              <p>All content must be:</p>
              <ul>
                <li>Age-appropriate and educational</li>
                <li>Original or properly attributed</li>
                <li>Respectful and inclusive</li>
                <li>Free from violence, discrimination, or harmful themes</li>
                <li>Compliant with copyright and intellectual property laws</li>
              </ul>
            </section>

            {/* Content and Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 User-Generated Content</h3>
              <ul>
                <li>You retain ownership of the stories and content you create</li>
                <li>You grant us a license to host, display, and improve your content</li>
                <li>You are responsible for ensuring your content doesn't infringe on others' rights</li>
                <li>We may remove content that violates our guidelines</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Platform Content</h3>
              <ul>
                <li>Mintoons owns all platform software, AI technology, and educational materials</li>
                <li>You may not copy, modify, or distribute our proprietary content</li>
                <li>Our trademarks and logos are protected intellectual property</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 AI-Generated Content</h3>
              <ul>
                <li>AI suggestions and prompts are tools to assist your creativity</li>
                <li>The combination of your input and AI assistance creates unique content</li>
                <li>You maintain creative ownership of the final stories</li>
              </ul>
            </section>

            {/* Privacy and Safety */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Child Safety</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Privacy Protection</h3>
              <ul>
                <li>We are COPPA compliant and prioritize child privacy</li>
                <li>Our Privacy Policy details how we handle personal information</li>
                <li>Parents have full access to their child's account and data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Safety Measures</h3>
              <ul>
                <li>All content is monitored and moderated</li>
                <li>Communication is limited to educational feedback</li>
                <li>We use advanced safety filters and human oversight</li>
                <li>Suspicious activity is immediately investigated</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.3 Reporting</h3>
              <p>
                Please report any safety concerns, inappropriate content, or violations 
                immediately to <a href="mailto:safety@mintoons.com" className="text-blue-600 hover:underline">safety@mintoons.com</a>.
              </p>
            </section>

            {/* Subscription and Payments */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Subscription and Payments</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Subscription Plans</h3>
              <ul>
                <li>Free tier with limited features available to all users</li>
                <li>Paid subscriptions unlock additional features and story limits</li>
                <li>Pricing and features are subject to change with notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Billing and Cancellation</h3>
              <ul>
                <li>Subscriptions renew automatically unless cancelled</li>
                <li>You can cancel at any time through your account settings</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>Disputed charges should be reported within 30 days</li>
              </ul>
            </section>

            {/* Disclaimers */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Service Availability</h3>
              <ul>
                <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>Maintenance and updates may temporarily affect availability</li>
                <li>We are not liable for service interruptions beyond our control</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.2 Educational Disclaimer</h3>
              <ul>
                <li>Mintoons is a supplementary educational tool, not a replacement for formal education</li>
                <li>AI assistance is designed to guide, not replace, human creativity</li>
                <li>Educational outcomes may vary based on individual engagement</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.3 Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Mintoons shall not be liable for any 
                indirect, incidental, special, or consequential damages arising from your use 
                of the Service.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Termination by User</h3>
              <ul>
                <li>You may terminate your account at any time</li>
                <li>Data will be deleted according to our data retention policy</li>
                <li>Some information may be retained for legal or safety purposes</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.2 Termination by Mintoons</h3>
              <p>We may terminate or suspend accounts that:</p>
              <ul>
                <li>Violate these Terms or our community guidelines</li>
                <li>Pose safety risks to children or other users</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Abuse or misuse the Service</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to These Terms</h2>
              <p>
                We may update these Terms periodically to reflect changes in our Service or 
                legal requirements. We will:
              </p>
              <ul>
                <li>Notify users via email of material changes</li>
                <li>Post updated Terms on our website</li>
                <li>Provide at least 30 days notice before changes take effect</li>
                <li>Obtain fresh consent where required by law</li>
              </ul>
              <p>
                Continued use of the Service after changes take effect constitutes acceptance 
                of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law and Disputes</h2>
              <p>
                These Terms are governed by the laws of the State of California, United States, 
                without regard to conflict of law principles.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the Service will be resolved 
                through binding arbitration, except for matters involving child safety which may 
                be brought in court.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-green-600" />
                12. Contact Information
              </h2>
              <p>
                If you have questions about these Terms, please contact us:
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Legal Team</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> legal@mintoons.com</p>
                  <p><strong>Safety Concerns:</strong> safety@mintoons.com</p>
                  <p><strong>Phone:</strong> 1-800-MINTOONS (1-800-646-8666)</p>
                  <p><strong>Mail:</strong><br />
                    Mintoons Legal Department<br />
                    123 Education Avenue<br />
                    San Francisco, CA 94102<br />
                    United States
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  We respond to all legal inquiries within 48 hours.
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Acknowledgment</h2>
              <p>
                By using Mintoons, you acknowledge that you have read, understood, and agree 
                to be bound by these Terms of Service.
              </p>
              <p>
                <strong>For parents:</strong> By allowing your child to use Mintoons, you 
                acknowledge that you have read these Terms and agree to them on behalf of 
                your child.
              </p>
            </section>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Questions About Our Terms?</h3>
            <p className="text-purple-100 mb-6">
              Our legal team is here to help clarify any questions you may have about using 
              Mintoons safely and responsibly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:legal@mintoons.com"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Legal Team
              </a>
              <Link
                href="/privacy"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Read Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}