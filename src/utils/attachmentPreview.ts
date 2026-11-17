import type { Attachment } from '../types';

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);/);
  const mime = mimeMatch?.[1] || 'application/octet-stream';
  const isBase64 = header.includes(';base64');

  if (isBase64) {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  return new Blob([decodeURIComponent(data)], { type: mime });
}

/**
 * يفتح المرفق في تبويب جديد ويعرضه مباشرة (صورة أو PDF أو رابط تنزيل).
 */
export function openAttachmentInNewTab(attachment: Attachment): void {
  const blob = dataUrlToBlob(attachment.dataUrl);
  const objectUrl = URL.createObjectURL(blob);
  const isImage = attachment.type.startsWith('image/');
  const isPdf =
    attachment.type === 'application/pdf' ||
    attachment.name.toLowerCase().endsWith('.pdf');

  const previewWindow = window.open('', '_blank');
  if (!previewWindow) {
    // إن حظر المتصفح النافذة، نفتح الرابط مباشرة
    window.open(objectUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const title = attachment.description || attachment.name || 'معاينة المرفق';
  const bodyContent = isImage
    ? `<img src="${objectUrl}" alt="${title}" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);" />`
    : isPdf
      ? `<iframe src="${objectUrl}" title="${title}" style="width:100%;height:calc(100vh - 88px);border:0;border-radius:8px;background:#fff;"></iframe>`
      : `<div style="text-align:center;padding:48px 16px;">
           <p style="margin-bottom:16px;">لا يمكن عرض هذا النوع من الملفات مباشرة داخل الصفحة.</p>
           <a href="${objectUrl}" download="${attachment.name}" style="display:inline-block;background:#006847;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;">تحميل الملف</a>
         </div>`;

  previewWindow.document.write(`<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Cairo, Tahoma, sans-serif;
        background: #F6F8F7;
        color: #1e293b;
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 20px;
        background: #006847;
        color: #fff;
      }
      header h1 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
      }
      header a {
        color: #fff;
        text-decoration: none;
        background: rgba(255,255,255,.15);
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 700;
      }
      main { padding: 16px; }
    </style>
  </head>
  <body>
    <header>
      <h1>${title}</h1>
      <a href="${objectUrl}" download="${attachment.name}">تحميل الملف</a>
    </header>
    <main>${bodyContent}</main>
  </body>
</html>`);
  previewWindow.document.close();

  // تحرير الذاكرة لاحقاً بعد فتح التبويب
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
