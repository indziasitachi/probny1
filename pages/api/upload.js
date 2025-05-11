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
      console.error('Formidable parsing error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log('Received files:', JSON.stringify(files, null, 2)); // Log the structure of files

    let file = files.file;
    if (Array.isArray(file)) {
      file = file[0];
    }

    if (!file || !file.filepath) {
      console.error('Upload error: file or file.filepath is missing. File object:', JSON.stringify(file, null, 2));
      return res.status(400).json({ error: 'No file uploaded or file path missing' });
    }

    const origName = file.originalFilename || file.newFilename || 'upload'; // Simplified fallback
    const fileName = Date.now() + '-' + origName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = path.join(uploadDir, fileName);

    console.log(`Attempting to rename: ${file.filepath} to ${filePath}`);

    try {
      fs.renameSync(file.filepath, filePath);
      const url = `/icons/uploaded/${fileName}`;
      console.log(`File successfully uploaded: ${url}`);
      res.status(200).json({ url });
    } catch (renameError) {
      console.error('Error renaming file:', renameError);
      console.error(`Details: filepath: ${file.filepath}, target filePath: ${filePath}`);
      res.status(500).json({ error: 'Error processing uploaded file', details: renameError.message });
    }
  });
}
