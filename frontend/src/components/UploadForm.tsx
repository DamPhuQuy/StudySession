import { useState, useEffect, useRef } from 'react';
import { uploadFile, listSessions, deleteSession, getSession } from '../services/api';
import type { Session } from '../types';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';

interface UploadFormProps {
  onSession: (s: Session) => void;
}

export function UploadForm({ onSession }: UploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch session history on load
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const list = await listSessions();
      setHistory(list);
    } catch (err) {
      console.error('Failed to load sessions history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const validTypes = ['.docx', '.pdf', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      setErrorMsg('Định dạng file không hỗ trợ. Vui lòng chọn .docx, .pdf hoặc .txt');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Kích thước file quá lớn. Vui lòng tải lên file nhỏ hơn 10MB');
      return;
    }

    setErrorMsg(null);
    setUploading(true);
    try {
      const session = await uploadFile(file);
      onSession(session);
    } catch (err) {
      setErrorMsg('Không thể xử lý file. Vui lòng kiểm tra định dạng câu hỏi trong file.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSelectSession = async (id: string) => {
    setUploading(true);
    setErrorMsg(null);
    try {
      const fullSession = await getSession(id);
      onSession(fullSession);
    } catch (err) {
      setErrorMsg('Không thể tải phiên học này.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa phiên học này không?')) return;
    
    try {
      await deleteSession(id);
      setHistory(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Xóa thất bại. Vui lòng thử lại.');
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-slide-up">
      {/* Background decorations */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pulse-glow-bg pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pulse-glow-bg pointer-events-none" />

      {/* Header section */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold tracking-wide border border-brand-500/20 mb-4 uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Nền tảng ôn tập thông minh
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-display bg-gradient-to-r from-white via-brand-100 to-brand-400 bg-clip-text text-transparent mb-4 tracking-tight">
          Study Session Creator
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          Tạo đề trắc nghiệm tương tác tức thì từ tài liệu của bạn. Hỗ trợ các định dạng văn bản phổ biến.
        </p>
      </div>

      {/* Drag & drop upload area */}
      <div className="relative z-10 mb-10">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`glass-panel glass-panel-hover rounded-2xl p-10 flex flex-col items-center justify-center border-dashed border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
            dragActive 
              ? 'border-brand-500 bg-brand-500/10 scale-[0.99] glow-brand' 
              : 'border-brand-500/20'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center py-6">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-brand-500 border-r-brand-500 rounded-full animate-spin" />
              </div>
              <p className="text-brand-400 font-semibold mb-1 text-glow">Đang xử lý tài liệu...</p>
              <p className="text-gray-500 text-xs">Đang trích xuất câu hỏi trắc nghiệm A, B, C, D</p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-brand-500/10 text-brand-400 mb-4 border border-brand-500/20 group-hover:scale-110 transition duration-300">
                <UploadCloud className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Kéo thả file câu hỏi vào đây</h3>
              <p className="text-gray-400 text-sm text-center mb-6 max-w-sm">
                Hoặc <span className="text-brand-400 font-medium hover:underline">duyệt tìm file</span> từ máy tính của bạn
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" /> Microsoft Word (.docx)
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/5">
                  <FileText className="w-3.5 h-3.5 text-red-400" /> PDF Document (.pdf)
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" /> Plain Text (.txt)
                </span>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Session History list */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 font-display text-white">
            <BookOpen className="w-5 h-5 text-brand-400" /> Phiên học tập của bạn
          </h2>
          <span className="text-xs text-gray-500 font-semibold">{history.length} tài liệu đã tạo</span>
        </div>

        {loadingHistory ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="glass-panel rounded-xl p-5 animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-white/5" />
                  <div>
                    <div className="h-4 w-48 bg-white/5 rounded mb-2" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="w-20 h-8 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="glass-panel rounded-xl p-10 text-center border border-white/5">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Chưa có phiên học nào. Hãy tải lên tài liệu đầu tiên!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {history.map(session => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className="glass-panel glass-panel-hover rounded-xl p-4 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <div className="p-2.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/10">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm md:text-base truncate group-hover:text-brand-400 transition">
                      {session.fileName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {formatDate(session.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className="p-2.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-transparent hover:border-red-500/15 transition-all"
                    title="Xóa phiên học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSelectSession(session.id)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-brand-500 text-white font-medium text-xs md:text-sm border border-white/10 hover:border-brand-500 transition-all flex items-center gap-1 group-hover:glow-brand"
                  >
                    Luyện tập <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
