/* eslint-env node */
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const form = new IncomingForm();
  const uploadDir = path.join(process.cwd(), 'public', 'icons', 'uploaded');
  fs.mkdirSync(uploadDir, { recursive: true });

  form.uploadDir = uploadDir;
  form.keepExtensions = true;
  form.maxFileSize = 5 * 1024 * 1024; // 5MB

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    let file = files.file;
    if (Array.isArray(file)) file = file[0];
    if (!file || !file.filepath) {
      console.error('Upload error: file or file.filepath is missing', file);
      return res.status(400).json({ error: 'No file uploaded or file path missing' });
    }
    const origName = file.originalFilename || file.newFilename || file.filename || 'upload';
    const fileName = Date.now() + '-' + origName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = path.join(uploadDir, fileName);
    fs.renameSync(file.filepath, filePath);
    const url = `/icons/uploaded/${fileName}`;
    res.status(200).json({ url });
  });
}
