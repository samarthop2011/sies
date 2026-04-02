import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { SUBJECTS, CLASSES, SECTIONS, EXAM_TYPES } from '../../utils/helpers';
import { Upload, FileText, Image as ImageIcon, X, CheckCircle, AlertCircle, CloudUpload } from 'lucide-react';

export default function UploadPapers() {
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !examType || !selectedClass || !selectedSection || !subject) {
      setMessage({ type: 'error', text: 'Please fill all fields and select a file' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('examType', examType);
      formData.append('class', selectedClass);
      formData.append('section', selectedSection);
      formData.append('subject', subject);

      await api.post('/papers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ type: 'success', text: 'Paper uploaded successfully!' });
      setTitle('');
      setExamType('');
      setSelectedClass('');
      setSelectedSection('');
      setSubject('');
      removeFile();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const isImage = file?.type?.startsWith('image/');
  const isPDF = file?.type === 'application/pdf';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <CloudUpload className="inline w-7 h-7 mr-2 text-primary-500" />
          Upload Papers
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Upload exam papers as PDF or images for students to view</p>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Paper Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g., Mathematics Unit Test 1 Paper" required id="paper-title" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field" required>
              <option value="">Select</option>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="input-field" required>
              <option value="">Select</option>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Exam Type</label>
            <select value={examType} onChange={e => setExamType(e.target.value)} className="input-field" required>
              <option value="">Select</option>
              {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field" required>
              <option value="">Select</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>File</label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' :
              file ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' :
              'border-gray-300 dark:border-dark-600 hover:border-primary-400'
            }`}
          >
            <input ref={fileInputRef} type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" />
            
            {file ? (
              <div className="flex items-center justify-center gap-3">
                {isPDF ? <FileText className="w-8 h-8 text-red-500" /> : <ImageIcon className="w-8 h-8 text-blue-500" />}
                <div className="text-left">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20">
                  <X className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Drop your file here, or <span className="text-primary-500">browse</span>
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  PDF, JPEG, PNG, WebP (max 10MB)
                </p>
              </>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={uploading}
          className="btn-primary w-full flex items-center justify-center gap-2"
          id="submit-paper"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CloudUpload className="w-5 h-5" />
              Upload Paper
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
