import puppeteer from 'puppeteer';
import { formatDate } from '@/utils/helpers';
import { uploadFile } from '@/utils/gridfs';
import { Story, Comment } from '@/types';

interface PDFExportOptions {
  includeComments?: boolean;
  includeAssessments?: boolean;
  theme?: 'classic' | 'modern' | 'playful';
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

interface StoryExportData {
  story: Story;
  comments?: Comment[];
  authorName: string;
  mentorName?: string;
}

// PDF generation service
export class PDFGenerator {
  private static instance: PDFGenerator;
  private browser: puppeteer.Browser | null = null;

  static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async generateStoryPDF(
    storyData: StoryExportData,
    options: PDFExportOptions = {}
  ): Promise<string> {
    await this.initBrowser();
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser for PDF generation');
    }

    const page = await this.browser.newPage();
    
    try {
      const html = this.generateStoryHTML(storyData, options);
      
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        orientation: options.orientation || 'portrait',
        printBackground: true,
        margin: {
          top: '1in',
          right: '0.8in',
          bottom: '1in',
          left: '0.8in'
        },
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(storyData, options),
        footerTemplate: this.getFooterTemplate(),
      });

      // Upload to GridFS
      const filename = `${storyData.story.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      const fileId = await uploadFile(
        Buffer.from(pdfBuffer),
        filename,
        'application/pdf'
      );

      return fileId;
    } finally {
      await page.close();
    }
  }

  async generateBulkPDF(
    storiesData: StoryExportData[],
    options: PDFExportOptions = {}
  ): Promise<string> {
    await this.initBrowser();
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser for PDF generation');
    }

    const page = await this.browser.newPage();
    
    try {
      const html = this.generateBulkHTML(storiesData, options);
      
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        orientation: options.orientation || 'portrait',
        printBackground: true,
        margin: {
          top: '1in',
          right: '0.8in',
          bottom: '1in',
          left: '0.8in'
        },
        displayHeaderFooter: true,
        headerTemplate: this.getBulkHeaderTemplate(storiesData[0], options),
        footerTemplate: this.getFooterTemplate(),
      });

      // Upload to GridFS
      const filename = `Stories_Collection_${Date.now()}.pdf`;
      const fileId = await uploadFile(
        Buffer.from(pdfBuffer),
        filename,
        'application/pdf'
      );

      return fileId;
    } finally {
      await page.close();
    }
  }

  private generateStoryHTML(
    storyData: StoryExportData,
    options: PDFExportOptions
  ): string {
    const theme = this.getThemeStyles(options.theme || 'modern');
    const { story, comments, authorName, mentorName } = storyData;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${story.title}</title>
          <style>
            ${theme}
            ${this.getBaseStyles()}
          </style>
        </head>
        <body>
          <div class="document">
            ${this.generateCoverPage(story, authorName, options)}
            ${this.generateStoryElements(story)}
            ${this.generateStoryContent(story)}
            ${options.includeAssessments ? this.generateAssessmentSection(story) : ''}
            ${options.includeComments && comments ? this.generateCommentsSection(comments, mentorName) : ''}
            ${this.generateFooterInfo(story, authorName)}
          </div>
        </body>
      </html>
    `;
  }

  private generateBulkHTML(
    storiesData: StoryExportData[],
    options: PDFExportOptions
  ): string {
    const theme = this.getThemeStyles(options.theme || 'modern');
    const authorName = storiesData[0]?.authorName || 'Unknown Author';

    const storiesHTML = storiesData.map((storyData, index) => `
      <div class="story-section ${index > 0 ? 'page-break' : ''}">
        ${this.generateStoryContent(storyData.story)}
        ${options.includeAssessments ? this.generateAssessmentSection(storyData.story) : ''}
        ${options.includeComments && storyData.comments ? this.generateCommentsSection(storyData.comments, storyData.mentorName) : ''}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>My Story Collection</title>
          <style>
            ${theme}
            ${this.getBaseStyles()}
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="document">
            ${this.generateCollectionCoverPage(storiesData, authorName, options)}
            ${this.generateTableOfContents(storiesData)}
            ${storiesHTML}
          </div>
        </body>
      </html>
    `;
  }

  private getThemeStyles(theme: string): string {
    const themes = {
      classic: `
        :root {
          --primary-color: #2c3e50;
          --secondary-color: #34495e;
          --accent-color: #e74c3c;
          --background-color: #ffffff;
          --text-color: #2c3e50;
          --border-color: #bdc3c7;
          --font-family: 'Times New Roman', serif;
        }
      `,
      modern: `
        :root {
          --primary-color: #667eea;
          --secondary-color: #764ba2;
          --accent-color: #f093fb;
          --background-color: #ffffff;
          --text-color: #2d3748;
          --border-color: #e2e8f0;
          --font-family: 'Helvetica Neue', Arial, sans-serif;
        }
      `,
      playful: `
        :root {
          --primary-color: #ff6b6b;
          --secondary-color: #4ecdc4;
          --accent-color: #ffe66d;
          --background-color: #fff5f5;
          --text-color: #2d3748;
          --border-color: #fed7d7;
          --font-family: 'Comic Sans MS', cursive, sans-serif;
        }
      `
    };

    return themes[theme as keyof typeof themes] || themes.modern;
  }

  private getBaseStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: var(--font-family);
        color: var(--text-color);
        line-height: 1.6;
        background-color: var(--background-color);
      }

      .document {
        max-width: 100%;
        margin: 0 auto;
        padding: 20px;
      }

      .cover-page {
        text-align: center;
        padding: 60px 20px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: 10px;
        margin-bottom: 40px;
        page-break-after: always;
      }

      .cover-title {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 20px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }

      .cover-author {
        font-size: 1.2em;
        margin-bottom: 10px;
        opacity: 0.9;
      }

      .cover-date {
        font-size: 1em;
        opacity: 0.8;
      }

      .elements-section {
        background-color: var(--background-color);
        border: 2px solid var(--border-color);
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .elements-title {
        color: var(--primary-color);
        font-size: 1.3em;
        font-weight: bold;
        margin-bottom: 15px;
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 5px;
      }

      .elements-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      .element-item {
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 5px;
        border-left: 4px solid var(--primary-color);
      }

      .element-label {
        font-weight: bold;
        color: var(--primary-color);
        margin-bottom: 3px;
      }

      .element-value {
        color: var(--text-color);
      }

      .story-content {
        background-color: var(--background-color);
        padding: 30px;
        margin: 20px 0;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      .story-title {
        color: var(--primary-color);
        font-size: 2em;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
        border-bottom: 3px solid var(--accent-color);
        padding-bottom: 10px;
      }

      .story-text {
        font-size: 1.1em;
        line-height: 1.8;
        text-align: justify;
        text-indent: 30px;
      }

      .story-text p {
        margin-bottom: 15px;
      }

      .assessment-section {
        background: linear-gradient(to right, #f8f9fa, #e9ecef);
        padding: 25px;
        margin: 30px 0;
        border-radius: 10px;
        border: 1px solid var(--border-color);
      }

      .assessment-title {
        color: var(--primary-color);
        font-size: 1.4em;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
      }

      .scores-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 20px;
      }

      .score-card {
        text-align: center;
        padding: 15px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      .score-value {
        font-size: 2em;
        font-weight: bold;
        color: var(--primary-color);
        margin-bottom: 5px;
      }

      .score-label {
        font-size: 0.9em;
        color: var(--text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .feedback-section {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        margin-top: 15px;
      }

      .feedback-text {
        font-style: italic;
        color: var(--text-color);
        margin-bottom: 15px;
      }

      .suggestions-list {
        list-style: none;
        padding: 0;
      }

      .suggestions-list li {
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
        position: relative;
        padding-left: 20px;
      }

      .suggestions-list li:before {
        content: "💡";
        position: absolute;
        left: 0;
      }

      .comments-section {
        background-color: var(--background-color);
        padding: 25px;
        margin: 30px 0;
        border-radius: 10px;
        border: 1px solid var(--border-color);
      }

      .comments-title {
        color: var(--primary-color);
        font-size: 1.4em;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
      }

      .comment-item {
        background-color: white;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 8px;
        border-left: 4px solid var(--accent-color);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color);
      }

      .comment-author {
        font-weight: bold;
        color: var(--primary-color);
      }

      .comment-type {
        background-color: var(--accent-color);
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        text-transform: uppercase;
      }

      .comment-content {
        color: var(--text-color);
        line-height: 1.6;
      }

      .highlighted-text {
        background-color: #fff3cd;
        padding: 2px 4px;
        border-radius: 3px;
        font-style: italic;
        margin-bottom: 10px;
        border-left: 3px solid #ffc107;
        padding-left: 8px;
      }

      .footer-info {
        text-align: center;
        padding: 30px 20px;
        margin-top: 40px;
        border-top: 2px solid var(--border-color);
        color: var(--secondary-color);
        font-size: 0.9em;
      }

      .table-of-contents {
        background-color: var(--background-color);
        padding: 30px;
        margin: 20px 0;
        border-radius: 8px;
        page-break-after: always;
      }

      .toc-title {
        color: var(--primary-color);
        font-size: 1.8em;
        font-weight: bold;
        margin-bottom: 25px;
        text-align: center;
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 10px;
      }

      .toc-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px dotted var(--border-color);
        align-items: center;
      }

      .toc-story-title {
        color: var(--text-color);
        font-weight: 500;
      }

      .toc-page {
        color: var(--primary-color);
        font-weight: bold;
      }

      @media print {
        .page-break {
          page-break-before: always;
        }
        
        .cover-page {
          page-break-after: always;
        }
        
        .table-of-contents {
          page-break-after: always;
        }
      }
    `;
  }

  private generateCoverPage(story: Story, authorName: string, options: PDFExportOptions): string {
    return `
      <div class="cover-page">
        <div class="cover-title">${story.title}</div>
        <div class="cover-author">Written by ${authorName}</div>
        <div class="cover-date">Created on ${formatDate(story.createdAt)}</div>
        <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
          A Mintoons Story Adventure
        </div>
      </div>
    `;
  }

  private generateCollectionCoverPage(storiesData: StoryExportData[], authorName: string, options: PDFExportOptions): string {
    return `
      <div class="cover-page">
        <div class="cover-title">My Story Collection</div>
        <div class="cover-author">Written by ${authorName}</div>
        <div class="cover-date">Generated on ${formatDate(new Date())}</div>
        <div style="margin-top: 20px; font-size: 1.1em;">
          ${storiesData.length} Amazing ${storiesData.length === 1 ? 'Story' : 'Stories'}
        </div>
        <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
          A Mintoons Story Collection
        </div>
      </div>
    `;
  }

  private generateTableOfContents(storiesData: StoryExportData[]): string {
    const tocItems = storiesData.map((storyData, index) => `
      <div class="toc-item">
        <span class="toc-story-title">${storyData.story.title}</span>
        <span class="toc-page">Page ${index + 3}</span>
      </div>
    `).join('');

    return `
      <div class="table-of-contents">
        <div class="toc-title">Table of Contents</div>
        ${tocItems}
      </div>
    `;
  }

  private generateStoryElements(story: Story): string {
    if (!story.elements) return '';

    return `
      <div class="elements-section">
        <div class="elements-title">📚 Story Elements</div>
        <div class="elements-grid">
          <div class="element-item">
            <div class="element-label">Genre:</div>
            <div class="element-value">${story.elements.genre}</div>
          </div>
          <div class="element-item">
            <div class="element-label">Setting:</div>
            <div class="element-value">${story.elements.setting}</div>
          </div>
          <div class="element-item">
            <div class="element-label">Character:</div>
            <div class="element-value">${story.elements.character}</div>
          </div>
          <div class="element-item">
            <div class="element-label">Mood:</div>
            <div class="element-value">${story.elements.mood}</div>
          </div>
          <div class="element-item">
            <div class="element-label">Conflict:</div>
            <div class="element-value">${story.elements.conflict}</div>
          </div>
          <div class="element-item">
            <div class="element-label">Theme:</div>
            <div class="element-value">${story.elements.theme}</div>
          </div>
        </div>
      </div>
    `;
  }

  private generateStoryContent(story: Story): string {
    const paragraphs = story.content.split('\n').filter(p => p.trim()).map(paragraph => 
      `<p>${paragraph}</p>`
    ).join('');

    return `
      <div class="story-content">
        <div class="story-title">${story.title}</div>
        <div class="story-text">
          ${paragraphs}
        </div>
      </div>
    `;
  }

  private generateAssessmentSection(story: Story): string {
    if (!story.assessment) return '';

    const { assessment } = story;
    
    return `
      <div class="assessment-section">
        <div class="assessment-title">📊 Story Assessment</div>
        
        <div class="scores-grid">
          <div class="score-card">
            <div class="score-value">${assessment.grammarScore}</div>
            <div class="score-label">Grammar</div>
          </div>
          <div class="score-card">
            <div class="score-value">${assessment.creativityScore}</div>
            <div class="score-label">Creativity</div>
          </div>
          <div class="score-card">
            <div class="score-value">${assessment.overallScore}</div>
            <div class="score-label">Overall</div>
          </div>
        </div>

        <div class="feedback-section">
          <div class="feedback-text">"${assessment.feedback}"</div>
          
          ${assessment.strengths && assessment.strengths.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <strong>🌟 Strengths:</strong>
              <ul class="suggestions-list">
                ${assessment.strengths.map(strength => `<li>${strength}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${assessment.suggestions && assessment.suggestions.length > 0 ? `
            <div>
              <strong>💡 Suggestions for Improvement:</strong>
              <ul class="suggestions-list">
                ${assessment.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private generateCommentsSection(comments: Comment[], mentorName?: string): string {
    if (!comments || comments.length === 0) return '';

    const commentItems = comments.map(comment => `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-author">${comment.commenterName || mentorName || 'Mentor'}</span>
          <span class="comment-type">${comment.type}</span>
        </div>
        ${comment.highlightedText ? `
          <div class="highlighted-text">
            "${comment.highlightedText}"
          </div>
        ` : ''}
        <div class="comment-content">${comment.content}</div>
      </div>
    `).join('');

    return `
      <div class="comments-section">
        <div class="comments-title">💬 Mentor Feedback</div>
        ${commentItems}
      </div>
    `;
  }

  private generateFooterInfo(story: Story, authorName: string): string {
    const wordCount = story.content.split(/\s+/).length;
    
    return `
      <div class="footer-info">
        <p><strong>Story Statistics:</strong></p>
        <p>Word Count: ${wordCount} | Created: ${formatDate(story.createdAt)} | Author: ${authorName}</p>
        <p style="margin-top: 10px; font-style: italic;">
          Generated with ❤️ by Mintoons - Where imagination meets AI
        </p>
      </div>
    `;
  }

  private getHeaderTemplate(storyData: StoryExportData, options: PDFExportOptions): string {
    return `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 10px 0;">
        <span>${storyData.story.title} - ${storyData.authorName}</span>
      </div>
    `;
  }

  private getBulkHeaderTemplate(storyData: StoryExportData, options: PDFExportOptions): string {
    return `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 10px 0;">
        <span>My Story Collection - ${storyData.authorName}</span>
      </div>
    `;
  }

  private getFooterTemplate(): string {
    return `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 10px 0;">
        <span class="pageNumber"></span> / <span class="totalPages"></span> | Generated by Mintoons
      </div>
    `;
  }
}

// Export functions
export async function generateStoryPDF(
  storyData: StoryExportData,
  options: PDFExportOptions = {}
): Promise<string> {
  const generator = PDFGenerator.getInstance();
  return await generator.generateStoryPDF(storyData, options);
}

export async function generateStoriesPDF(
  storiesData: StoryExportData[],
  options: PDFExportOptions = {}
): Promise<string> {
  const generator = PDFGenerator.getInstance();
  return await generator.generateBulkPDF(storiesData, options);
}

// Word document generation (simplified version)
export async function generateStoryWord(
  storyData: StoryExportData,
  options: PDFExportOptions = {}
): Promise<string> {
  // For Word generation, we'll create an HTML version that can be opened in Word
  // In a production environment, you might want to use a library like docx
  
  const htmlContent = generateWordHTML(storyData, options);
  
  // Upload as .doc file (HTML that Word can open)
  const filename = `${storyData.story.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.doc`;
  const fileId = await uploadFile(
    Buffer.from(htmlContent, 'utf8'),
    filename,
    'application/msword'
  );

  return fileId;
}

function generateWordHTML(storyData: StoryExportData, options: PDFExportOptions): string {
  const { story, comments, authorName } = storyData;
  
  return `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <meta name="ProgId" content="Word.Document">
        <meta name="Generator" content="Microsoft Word 15">
        <meta name="Originator" content="Microsoft Word 15">
        <!--[if !mso]>
        <style>
          v\\:* {behavior:url(#default#VML);}
          o\\:* {behavior:url(#default#VML);}
          w\\:* {behavior:url(#default#VML);}
          .shape {behavior:url(#default#VML);}
        </style>
        <![endif]-->
        <title>${story.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
          .title { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 20pt; }
          .author { font-size: 14pt; text-align: center; margin-bottom: 30pt; }
          .content { text-align: justify; text-indent: 0.5in; }
          .elements { border: 1pt solid black; padding: 10pt; margin: 20pt 0; }
          .assessment { background-color: #f0f0f0; padding: 15pt; margin: 20pt 0; }
          .comments { border-left: 3pt solid blue; padding-left: 10pt; margin: 20pt 0; }
        </style>
      </head>
      <body>
        <div class="title">${story.title}</div>
        <div class="author">By ${authorName}</div>
        
        ${story.elements ? `
          <div class="elements">
            <strong>Story Elements:</strong><br>
            Genre: ${story.elements.genre}<br>
            Setting: ${story.elements.setting}<br>
            Character: ${story.elements.character}<br>
            Mood: ${story.elements.mood}<br>
            Conflict: ${story.elements.conflict}<br>
            Theme: ${story.elements.theme}
          </div>
        ` : ''}
        
        <div class="content">
          ${story.content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')}
        </div>
        
        ${options.includeAssessments && story.assessment ? `
          <div class="assessment">
            <strong>Assessment Scores:</strong><br>
            Grammar: ${story.assessment.grammarScore}/100<br>
            Creativity: ${story.assessment.creativityScore}/100<br>
            Overall: ${story.assessment.overallScore}/100<br><br>
            <strong>Feedback:</strong><br>
            ${story.assessment.feedback}
          </div>
        ` : ''}
        
        ${options.includeComments && comments && comments.length > 0 ? `
          <div class="comments">
            <strong>Mentor Comments:</strong><br>
            ${comments.map(comment => `
              <p><strong>${comment.type}:</strong> ${comment.content}</p>
            `).join('')}
          </div>
        ` : ''}
        
        <hr>
        <p style="text-align: center; font-size: 10pt; color: gray;">
          Generated by Mintoons on ${formatDate(new Date())}
        </p>
      </body>
    </html>
  `;
}

// Cleanup function for browser resources
export async function cleanupPDFResources(): Promise<void> {
  const generator = PDFGenerator.getInstance();
  await generator.closeBrowser();
}

// Error handling wrapper
export async function safeGenerateStoryPDF(
  storyData: StoryExportData,
  options: PDFExportOptions = {}
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    const fileId = await generateStoryPDF(storyData, options);
    return { success: true, fileId };
  } catch (error) {
    console.error('PDF generation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}