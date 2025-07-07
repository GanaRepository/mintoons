import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Story from '@/models/Story';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id: storyId } = params;

    // Find the story
    const story = await Story.findById(storyId).populate('userId', 'name age');
    
    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const userRole = session.user.role;
    const userId = session.user.id;

    if (userRole === 'child' && story.userId._id.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Create Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: story.title,
                  bold: true,
                  size: 32,
                  color: "2563EB"
                })
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // Author info
            new Paragraph({
              children: [
                new TextRun({
                  text: `By ${story.userId.name}`,
                  italics: true,
                  size: 24
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),

            // Date
            new Paragraph({
              children: [
                new TextRun({
                  text: `Created on ${new Date(story.createdAt).toLocaleDateString()}`,
                  size: 20,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            }),

            // Story elements section
            new Paragraph({
              children: [
                new TextRun({
                  text: "Story Elements",
                  bold: true,
                  size: 24,
                  color: "7C3AED"
                })
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),

            // Elements list
            new Paragraph({
              children: [
                new TextRun({
                  text: `Genre: ${story.elements.genre.charAt(0).toUpperCase() + story.elements.genre.slice(1)}`,
                  size: 20
                }),
                new TextRun({
                  text: " | ",
                  size: 20,
                  color: "CCCCCC"
                }),
                new TextRun({
                  text: `Setting: ${story.elements.setting.charAt(0).toUpperCase() + story.elements.setting.slice(1)}`,
                  size: 20
                }),
                new TextRun({
                  text: " | ",
                  size: 20,
                  color: "CCCCCC"
                }),
                new TextRun({
                  text: `Character: ${story.elements.character.charAt(0).toUpperCase() + story.elements.character.slice(1)}`,
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Mood: ${story.elements.mood.charAt(0).toUpperCase() + story.elements.mood.slice(1)}`,
                  size: 20
                }),
                new TextRun({
                  text: " | ",
                  size: 20,
                  color: "CCCCCC"
                }),
                new TextRun({
                  text: `Conflict: ${story.elements.conflict.charAt(0).toUpperCase() + story.elements.conflict.slice(1)}`,
                  size: 20
                }),
                new TextRun({
                  text: " | ",
                  size: 20,
                  color: "CCCCCC"
                }),
                new TextRun({
                  text: `Theme: ${story.elements.theme.charAt(0).toUpperCase() + story.elements.theme.slice(1)}`,
                  size: 20
                })
              ],
              spacing: { after: 600 }
            }),

            // Story content section
            new Paragraph({
              children: [
                new TextRun({
                  text: "The Story",
                  bold: true,
                  size: 24,
                  color: "7C3AED"
                })
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 300 }
            }),

            // Story content - split into paragraphs
            ...story.content.split('\n\n').map(paragraph => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: paragraph.trim(),
                    size: 22
                  })
                ],
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED
              })
            ),

            // Stats section
            new Paragraph({
              children: [
                new TextRun({
                  text: "Story Statistics",
                  bold: true,
                  size: 24,
                  color: "7C3AED"
                })
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 600, after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Word Count: ${story.wordCount} words`,
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Reading Time: ${Math.ceil(story.wordCount / 200)} minutes`,
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            // AI Assessment if available
            ...(story.aiAssessment ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "AI Assessment",
                    bold: true,
                    size: 24,
                    color: "7C3AED"
                  })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 300 }
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `Grammar Score: ${story.aiAssessment.grammarScore}/100`,
                    size: 20
                  })
                ],
                spacing: { after: 100 }
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `Creativity Score: ${story.aiAssessment.creativityScore}/100`,
                    size: 20
                  })
                ],
                spacing: { after: 100 }
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `Overall Score: ${story.aiAssessment.overallScore}/100`,
                    size: 20
                  })
                ],
                spacing: { after: 200 }
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: story.aiAssessment.feedback,
                    size: 20,
                    italics: true
                  })
                ],
                spacing: { after: 100 }
              })
            ] : []),

            // Footer
            new Paragraph({
              children: [
                new TextRun({
                  text: "Created with Mintoons - AI-Powered Story Writing Platform",
                  size: 16,
                  color: "888888",
                  italics: true
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 800 }
            })
          ]
        }
      ]
    });

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);

    // Create filename
    const filename = `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}_by_${story.userId.name.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;

    // Return the Word document
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Word export error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export story' },
      { status: 500 }
    );
  }
}