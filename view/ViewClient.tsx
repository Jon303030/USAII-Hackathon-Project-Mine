'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, FileText, FileStack, RefreshCw, Scissors, Search, Trash2, Upload } from 'lucide-react';

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
    setNotice(data.message ?? data.error ?? 'Upload finished');
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
    setNotice(data.message ?? data.error ?? 'Done');
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
          <span>Selected form</span>
          <strong>{selectedReport?.title ?? 'None'}</strong>
        </div>
        <div className="mini-stat accent-green">
          <span>PVC PDFs</span>
          <strong>{files.length}</strong>
        </div>
        <div className="mini-stat accent-amber">
          <span>Merge queue</span>
          <strong>{mergeFiles.length}</strong>
        </div>
      </div>

      <div className="viewer-layout">
        <aside className="viewer-panel library-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Library</span>
              <h2>Forms & PDFs</h2>
            </div>
            <button className="btn" type="button" onClick={refresh} disabled={busy} title="Refresh PDF list">
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="viewer-section">
            <h3>Favorites</h3>
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
              <p className="helper">Save a report in Navigator, then upload or open a PVC PDF.</p>
            ) : null}
          </div>

          <div className="viewer-section">
            <div className="section-head compact">
              <h3>PDF Files</h3>
              <label className="btn" title="Upload PDF attachments">
                <Upload size={18} />
                Upload
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
              <span>Search file</span>
              <span style={{ position: 'relative' }}>
                <Search size={16} style={{ left: 12, position: 'absolute', top: 13, color: 'var(--muted)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 36 }}
                  value={fileFilter}
                  onChange={(event) => setFileFilter(event.target.value)}
                  placeholder="Filter PDF name"
                />
              </span>
            </label>

            <div className="file-list compact">
              {filteredFiles.map((file) => (
                <div className={`file-row compact ${selectedFile === file.name ? 'active' : ''}`} key={file.name}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${file.name} for merge`}
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
              {filteredFiles.length === 0 ? <div className="empty-list">No PDF files in PVC yet.</div> : null}
            </div>
          </div>
        </aside>

        <section className="viewer-main">
          <div className="viewer-titlebar">
            <div>
              <span className="eyebrow">Preview</span>
              <h2>{selectedFile || 'No PDF selected'}</h2>
              <p>{selectedReport?.summary ?? 'Upload a local PDF or open a PVC file to begin.'}</p>
            </div>
            {selectedFile ? (
              <a className="btn primary" href={`/api/pdf/files/${encodeURIComponent(selectedFile)}?download=1`}>
                <Download size={18} />
                Download
              </a>
            ) : (
              <button className="btn primary" type="button" disabled>
                <Download size={18} />
                Download
              </button>
            )}
          </div>

          {notice ? <div className="notice">{notice}</div> : null}

          {pdfUrl ? (
            <iframe className="pdf-frame viewer-frame" src={pdfUrl} title="PDF preview" />
          ) : (
            <div className="pdf-frame viewer-frame empty-pdf">
              <FileText size={52} />
              <strong>No PDF selected</strong>
              <span>Use Upload or choose a PDF from the library.</span>
            </div>
          )}
        </section>

        <aside className="viewer-panel tools-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Tools</span>
              <h2>Page Actions</h2>
            </div>
          </div>

          <div className="tool-stack">
            <label className="field">
              <span>Keep pages</span>
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
              Extract
            </button>

            <label className="field">
              <span>Delete pages</span>
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
              Delete
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
              Merge {mergeFiles.length > 0 ? `(${mergeFiles.length})` : ''}
            </button>
          </div>

          <p className="helper">
            Use page ranges like 1,3-5. New PDFs are saved back into PVC and appear in the library.
          </p>
        </aside>
      </div>
    </div>
  );
}
