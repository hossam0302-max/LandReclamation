import { Eye, FileText, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import type { Attachment } from '../types';
import { openAttachmentInNewTab } from '../utils/attachmentPreview';
import { formatFileSize } from '../utils/status';

interface FileUploadProps {
  value: Attachment | null;
  onChange: (file: Attachment | null) => void;
  error?: string;
  required?: boolean;
}

const ACCEPTED = 'application/pdf,image/png,image/jpeg,image/jpg,image/webp';

export function FileUpload({
  value,
  onChange,
  error,
  required,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED.split(',').includes(file.type) && !file.type.startsWith('image/')) {
      alert('يُسمح فقط بملفات PDF أو الصور');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف يجب ألا يتجاوز 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: String(reader.result),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        تقرير الرفع المساحي
        {required && <span className="text-red-500"> *</span>}
      </label>

      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition hover:bg-primary-light/40 ${
            error ? 'border-red-300 bg-red-50' : 'border-border bg-white'
          }`}
        >
          <Upload className="h-8 w-8 text-primary" />
          <span className="text-sm font-semibold text-slate-700">
            اضغط لرفع ملف PDF أو صورة
          </span>
          <span className="text-xs text-slate-500">الحد الأقصى 5 م.ب</span>
        </button>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-light p-2 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{value.name}</p>
              <p className="text-xs text-slate-500">
                {formatFileSize(value.size)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openAttachmentInNewTab(value)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-water hover:bg-water-light"
            >
              <Eye className="h-3.5 w-3.5" />
              معاينة
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
