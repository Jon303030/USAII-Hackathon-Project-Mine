'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, FileText, FileStack, RefreshCw, Scissors, Search, Trash2, Upload } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

type FavoriteReport = {
  id: string;
  title: string;
  owner: string;
  category: string;
  updatedAt: string;
  status: string;
  summary: string;
};

type PdfFile = {
  name: string;
  size: number;
  updatedAt: string;
  url: string;
  downloadUrl: string;
};

export function ViewClient() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');
  const [favorites, setFavorites] = useState<FavoriteReport[]>([]);
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [selectedReportId, setSelectedReportId] = useState(reportId ?? '');
  const [selectedFile, setSelectedFile] = useState('');
  const [mergeFiles, setMergeFiles] = useState<string[]>([]);
  const [pageInput, setPageInput] = useState('1');
  const [deleteInput, setDeleteInput] = useState('2');
  const [fileFilter, setFileFilter] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedReport = useMemo(
    () => favorites.find((favorite) => favorite.id === selectedReportId) ?? favorites[0],
    [favorites, selectedReportId],
  );

  const pdfUrl = selectedFile ? `/api/pdf/files/${encodeURIComponent(selectedFile)}` : '';

  const filteredFiles = useMemo(() => {
    const query = fileFilter.trim().toLowerCase();
    if (!query) return files;
    return files.filter((file) => file.name.toLowerCase().includes(query));
  }, [fileFilter, files]);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (selectedReport && !selectedReportId) {
      setSelectedReportId(selectedReport.id);
    }
  }, [selectedReport, selectedReportId]);

  async function refresh() {
    const [favoriteResponse, fileResponse] = await Promise.all([fetch('/api/favorites'), fetch('/api/pdf/files')]);
    const favoriteData = await favoriteResponse.json();
    const fileData = await fileResponse.json();
    setFavorites(favoriteData.favorites);
    setFiles(fileData.files);
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    setBusy(true);
    const formData = new FormData();
    selected.forEach((file) => formData.append('files', file));

    const response = await fetch('/api/pdf/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setNotice(data.message ?? data.error ?? t({ en: 'Upload finished', zh: '上传完成' }));
    if (data.uploaded?.[0]) {
      setSelectedFile(data.uploaded[0]);
      setMergeFiles((current) => Array.from(new Set([...current, data.uploaded[0]])));
    }
    setBusy(false);
    await refresh();
  }

  async function postPdfAction(url: string, body: unknown) {
    setBusy(true);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setNotice(data.message ?? data.error ?? t({ en: 'Done', zh: '完成' }));
    setBusy(false);
    await refresh();
    if (data.file?.name) {
      setSelectedFile(data.file.name);
    }
  }

  function toggleMergeFile(fileName: string) {
    setMergeFiles((current) =>
      current.includes(fileName) ? current.filter((name) => name !== fileName) : [...current, fileName],
    );
  }

  return (
    <div className="viewer-dashboard">
      <div className="metric-strip">
        <div className="mini-stat accent-blue">
          <span>{t({ en: 'Selected form', zh: '已选表格' })}</span>
          <strong>{selectedReport?.title ?? t({ en: 'None', zh: '无' })}</strong>
        </div>
        <div className="mini-stat accent-green">
          <span>{t({ en: 'PVC PDFs', zh: 'PVC PDF 文件' })}</span>
          <strong>{files.length}</strong>
        </div>
        <div className="mini-stat accent-amber">
          <span>{t({ en: 'Merge queue', zh: '合并队列' })}</span>
          <strong>{mergeFiles.length}</strong>
        </div>
      </div>

      <div className="viewer-layout">
        <aside className="viewer-panel library-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{t({ en: 'Library', zh: '资料库' })}</span>
              <h2>{t({ en: 'Forms & PDFs', zh: '表格与 PDF' })}</h2>
            </div>
            <button className="btn" type="button" onClick={refresh} disabled={busy} title={t({ en: 'Refresh PDF list', zh: '刷新 PDF 列表' })}>
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="viewer-section">
            <h3>{t({ en: 'Favorites', zh: '收藏' })}</h3>
            <div className="side-list dense">
              {favorites.map((favorite) => (
                <button
                  className={`list-button ${selectedReport?.id === favorite.id ? 'active' : ''}`}
                  key={favorite.id}
                  type="button"
                  onClick={() => setSelectedReportId(favorite.id)}
                >
                  <strong>{favorite.title}</strong>
                  <small>
                    {favorite.category} - {favorite.status}
                  </small>
                </button>
              ))}
            </div>
            {favorites.length === 0 ? (
              <p className="helper">{t({ en: 'Save a report in Navigator, then upload or open a PVC PDF.', zh: '请先在找表格页面收藏表格，然后上传或打开 PVC PDF。' })}</p>
            ) : null}
          </div>

          <div className="viewer-section">
            <div className="section-head compact">
              <h3>{t({ en: 'PDF Files', zh: 'PDF 文件' })}</h3>
              <label className="btn" title={t({ en: 'Upload PDF attachments', zh: '上传 PDF 附件' })}>
                <Upload size={18} />
                {t({ en: 'Upload', zh: '上传' })}
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  style={{ display: 'none' }}
                  onChange={uploadFiles}
                  disabled={busy}
                />
              </label>
            </div>
            <label className="field">
              <span>{t({ en: 'Search file', zh: '搜索文件' })}</span>
              <span style={{ position: 'relative' }}>
                <Search size={16} style={{ left: 12, position: 'absolute', top: 13, color: 'var(--muted)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 36 }}
                  value={fileFilter}
                  onChange={(event) => setFileFilter(event.target.value)}
                  placeholder={t({ en: 'Filter PDF name', zh: '筛选 PDF 名称' })}
                />
              </span>
            </label>

            <div className="file-list compact">
              {filteredFiles.map((file) => (
                <div className={`file-row compact ${selectedFile === file.name ? 'active' : ''}`} key={file.name}>
                  <input
                    type="checkbox"
                    aria-label={t({ en: `Select ${file.name} for merge`, zh: `选择 ${file.name} 进行合并` })}
                    checked={mergeFiles.includes(file.name)}
                    onChange={() => toggleMergeFile(file.name)}
                  />
                  <button className="file-name" type="button" onClick={() => setSelectedFile(file.name)}>
                    <FileText size={18} />
                    <span>{file.name}</span>
                  </button>
                  <span className="file-meta">{Math.ceil(file.size / 1024)} KB</span>
                </div>
              ))}
              {filteredFiles.length === 0 ? <div className="empty-list">{t({ en: 'No PDF files in PVC yet.', zh: 'PVC 里还没有 PDF 文件。' })}</div> : null}
            </div>
          </div>
        </aside>

        <section className="viewer-main">
          <div className="viewer-titlebar">
            <div>
              <span className="eyebrow">{t({ en: 'Preview', zh: '预览' })}</span>
              <h2>{selectedFile || t({ en: 'No PDF selected', zh: '未选择 PDF' })}</h2>
              <p>{selectedReport?.summary ?? t({ en: 'Upload a local PDF or open a PVC file to begin.', zh: '请上传本地 PDF 或打开 PVC 文件开始。' })}</p>
            </div>
            {selectedFile ? (
              <a className="btn primary" href={`/api/pdf/files/${encodeURIComponent(selectedFile)}?download=1`}>
                <Download size={18} />
                {t({ en: 'Download', zh: '下载' })}
              </a>
            ) : (
              <button className="btn primary" type="button" disabled>
                <Download size={18} />
                {t({ en: 'Download', zh: '下载' })}
              </button>
            )}
          </div>

          {notice ? <div className="notice">{notice}</div> : null}

          {pdfUrl ? (
            <iframe className="pdf-frame viewer-frame" src={pdfUrl} title={t({ en: 'PDF preview', zh: 'PDF 预览' })} />
          ) : (
            <div className="pdf-frame viewer-frame empty-pdf">
              <FileText size={52} />
              <strong>{t({ en: 'No PDF selected', zh: '未选择 PDF' })}</strong>
              <span>{t({ en: 'Use Upload or choose a PDF from the library.', zh: '请上传文件，或从资料库选择 PDF。' })}</span>
            </div>
          )}
        </section>

        <aside className="viewer-panel tools-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{t({ en: 'Tools', zh: '工具' })}</span>
              <h2>{t({ en: 'Page Actions', zh: '页面操作' })}</h2>
            </div>
          </div>

          <div className="tool-stack">
            <label className="field">
              <span>{t({ en: 'Keep pages', zh: '保留页码' })}</span>
              <input className="input" value={pageInput} onChange={(event) => setPageInput(event.target.value)} />
            </label>
            <button
              className="btn"
              type="button"
              disabled={busy || !selectedFile}
              onClick={() =>
                postPdfAction('/api/pdf/extract-pages', {
                  fileName: selectedFile,
                  pages: pageInput,
                })
              }
            >
              <Scissors size={18} />
              {t({ en: 'Extract', zh: '抽取' })}
            </button>

            <label className="field">
              <span>{t({ en: 'Delete pages', zh: '删除页码' })}</span>
              <input className="input" value={deleteInput} onChange={(event) => setDeleteInput(event.target.value)} />
            </label>
            <button
              className="btn danger"
              type="button"
              disabled={busy || !selectedFile}
              onClick={() =>
                postPdfAction('/api/pdf/delete-pages', {
                  fileName: selectedFile,
                  pages: deleteInput,
                })
              }
            >
              <Trash2 size={18} />
              {t({ en: 'Delete', zh: '删除' })}
            </button>

            <button
              className="btn primary"
              type="button"
              disabled={busy || mergeFiles.length < 2}
              onClick={() =>
                postPdfAction('/api/pdf/merge', {
                  fileNames: mergeFiles,
                })
              }
            >
              <FileStack size={18} />
              {t({ en: 'Merge', zh: '合并' })} {mergeFiles.length > 0 ? `(${mergeFiles.length})` : ''}
            </button>
          </div>

          <p className="helper">
            {t({
              en: 'Use page ranges like 1,3-5. New PDFs are saved back into PVC and appear in the library.',
              zh: '可以使用 1,3-5 这样的页码范围。新的 PDF 会保存回 PVC，并显示在资料库。',
            })}
          </p>
        </aside>
      </div>
    </div>
  );
}
