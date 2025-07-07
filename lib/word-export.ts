// File 103: lib/word-export.ts - Word Document Export
import * as docx from 'docx';

export async function generateWordDocument(story: any) {
  const doc = new docx.Document({
    sections: [{
      properties: {},
      children: [
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: story.title,
              bold: true,
              size: 32,
            }),
          ],
          alignment: docx.AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        }),
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `By ${story.author.username}`,
              italics: true,
              size: 24,
            }),
          ],
          alignment: docx.AlignmentType.CENTER,
          spacing: {
            after: 600,
          },
        }),
        ...story.content.split('\n\n').map((paragraph: string) =>
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: paragraph,
                size: 24,
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        ),
      ],
    }],
  });

  return await docx.Packer.toBuffer(doc);
}