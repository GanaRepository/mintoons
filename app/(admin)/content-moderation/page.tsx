import { Metadata } from 'next';
import ContentModerationClient from './ContentModerationClient';

export const metadata: Metadata = {
  title: 'Content Moderation | Mintoons Admin',
  description: 'Review and moderate flagged content on the platform.',
  keywords: ['content moderation', 'admin', 'flagged content', 'review', 'safety'],
};

export default function ContentModerationPage() {
  return <ContentModerationClient />;
}