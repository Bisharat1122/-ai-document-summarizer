/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  FileUp
} from 'lucide-react';

const WEBHOOK_URL = 'https://homothallic-eugenio-sensationally.ngrok-free.dev/webhook/document-summarizer';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a valid PDF document.');
        setFile(null);
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setErrorMessage('');
      } else {
        setErrorMessage('Please drop a valid PDF document.');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', file.name);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus('success');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
      setErrorMessage('Failed to process document. Please try again later.');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setFile(null);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-dark-surface rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-dark-border backdrop-blur-xl"
        >
          <div className="p-8">
            <header className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-brand/20 rounded-2xl mb-4 border border-brand/30"
              >
                <FileText className="w-8 h-8 text-brand" />
              </motion.div>
              <h1 className="text-2xl font-display font-bold text-white tracking-tight mb-2">
                AI Document Summarizer
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload a PDF and save its AI summary to Google Sheets
              </p>
            </header>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Complete!</h3>
                  <p className="text-slate-400 text-sm mb-8 px-4">
                    Document uploaded successfully. Summary was processed and sent to Google Sheets.
                  </p>
                  <button
                    onClick={resetForm}
                    className="w-full py-3 px-6 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-dark-surface"
                  >
                    Upload Another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`
                      relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all duration-300
                      ${file ? 'border-brand bg-brand/10' : 'border-white/10 hover:border-brand/50 hover:bg-white/5'}
                    `}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                    />
                    
                    <div className="flex flex-col items-center text-center">
                      {file ? (
                        <>
                          <div className="w-12 h-12 bg-brand/30 rounded-xl flex items-center justify-center mb-3 border border-brand/40">
                            <FileUp className="w-6 h-6 text-brand" />
                          </div>
                          <span className="text-sm font-medium text-white truncate max-w-full px-4">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="mt-4 p-1.5 bg-dark-bg/80 rounded-full shadow-sm border border-white/10 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-brand/30">
                            <Upload className="w-6 h-6 text-slate-500 group-hover:text-brand" />
                          </div>
                          <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            PDF documents only
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-start gap-2 p-3 bg-rose-500/10 rounded-xl text-rose-400 text-sm border border-rose-500/20"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{errorMessage}</p>
                    </motion.div>
                  )}

                  {status === 'error' && !errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-start gap-2 p-3 bg-rose-500/10 rounded-xl text-rose-400 text-sm border border-rose-500/20"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>Something went wrong. Please try again.</p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={!file || status === 'uploading'}
                    className={`
                      w-full py-4 px-6 rounded-xl font-bold text-white shadow-xl transition-all duration-300
                      flex items-center justify-center gap-2
                      ${!file || status === 'uploading' 
                        ? 'bg-white/5 text-slate-500 shadow-none cursor-not-allowed border border-white/5' 
                        : 'bg-brand hover:bg-brand-hover active:scale-[0.98] shadow-brand/20'}
                    `}
                  >
                    {status === 'uploading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Summarize Document</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
          
          <footer className="bg-black/20 p-4 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
              Powered by AI & n8n
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
