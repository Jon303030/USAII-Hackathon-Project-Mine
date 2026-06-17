import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { ensureStorage, pdfRoot, safeFileName } from './storage';

export function parsePageSelection(value: string, totalPages: number) {
  const pages = new Set<number>();

  for (const part of value.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startRaw, endRaw] = trimmed.split('-');
      const start = Number.parseInt(startRaw, 10);
      const end = Number.parseInt(endRaw, 10);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        for (let page = Math.max(1, start); page <= Math.min(totalPages, end); page += 1) {
          pages.add(page - 1);
        }
      }
    } else {
      const page = Number.parseInt(trimmed, 10);
      if (Number.isFinite(page) && page >= 1 && page <= totalPages) {
        pages.add(page - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function saveUploadedPdf(file: File) {
  await ensureStorage();
  const safeName = safeFileName(file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name}.pdf`);
  const bytes = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(pdfRoot, safeName);
  await writeFile(filePath, bytes);
  return safeName;
}

export async function mergePdfs(fileNames: string[]) {
  await ensureStorage();
  const output = await PDFDocument.create();

  for (const fileName of fileNames) {
    const safeName = safeFileName(fileName);
    const bytes = await readFile(path.join(pdfRoot, safeName));
    const source = await PDFDocument.load(bytes);
    const copiedPages = await output.copyPages(source, source.getPageIndices());
    copiedPages.forEach((page) => output.addPage(page));
  }

  const outputName = safeFileName(`merged-${Date.now()}.pdf`);
  await writeFile(path.join(pdfRoot, outputName), await output.save());
  return outputName;
}

export async function extractPages(fileName: string, selection: string) {
  await ensureStorage();
  const safeName = safeFileName(fileName);
  const bytes = await readFile(path.join(pdfRoot, safeName));
  const source = await PDFDocument.load(bytes);
  const pageIndexes = parsePageSelection(selection, source.getPageCount());

  if (pageIndexes.length === 0) {
    throw new Error('No valid pages selected.');
  }

  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(source, pageIndexes);
  copiedPages.forEach((page) => output.addPage(page));

  const outputName = safeFileName(`pages-${selection.replace(/[^0-9,-]/g, '')}-${Date.now()}.pdf`);
  await writeFile(path.join(pdfRoot, outputName), await output.save());
  return outputName;
}

export async function deletePages(fileName: string, selection: string) {
  await ensureStorage();
  const safeName = safeFileName(fileName);
  const bytes = await readFile(path.join(pdfRoot, safeName));
  const source = await PDFDocument.load(bytes);
  const removeIndexes = new Set(parsePageSelection(selection, source.getPageCount()));
  const keepIndexes = source.getPageIndices().filter((index) => !removeIndexes.has(index));

  if (keepIndexes.length === 0) {
    throw new Error('Cannot delete every page.');
  }

  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(source, keepIndexes);
  copiedPages.forEach((page) => output.addPage(page));

  const outputName = safeFileName(`deleted-pages-${Date.now()}.pdf`);
  await writeFile(path.join(pdfRoot, outputName), await output.save());
  return outputName;
}
