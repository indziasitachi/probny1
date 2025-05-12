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
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const uploadDir = path.join(process.cwd(), 'public', 'icons', 'uploaded');
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (mkdirError) {
    console.error('Error creating upload directory:', mkdirError);
    return res.status(500).json({ error: 'Failed to create upload directory.' });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  // Оборачиваем form.parse в Promise
  await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Formidable parsing error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
        return reject(err); // Отклоняем Promise при ошибке парсинга
      }

      console.log('Received files:', JSON.stringify(files, null, 2));

      let file = files.file;
      if (Array.isArray(file)) {
        file = file[0];
      }

      if (!file || !file.filepath) {
        console.error('Upload error: file or file.filepath is missing. File object:', JSON.stringify(file, null, 2));
        if (!res.headersSent) {
            res.status(400).json({ error: 'No file uploaded or file path missing' });
        }
        return reject(new Error('No file uploaded or file path missing')); // Отклоняем Promise
      }

      const origName = file.originalFilename || file.newFilename || 'upload';
      const fileName = Date.now() + '-' + origName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const newFilepath = path.join(uploadDir, fileName); // Используем новое имя файла для пути

      console.log(`Attempting to rename: ${file.filepath} to ${newFilepath}`);

      try {
        fs.renameSync(file.filepath, newFilepath); // formidable уже сохранил файл с временным именем в uploadDir
        const url = `/icons/uploaded/${fileName}`;
        console.log(`File successfully uploaded: ${url}`);
        if (!res.headersSent) {
            res.status(200).json({ url });
        }
        resolve(); // Успешно разрешаем Promise
      } catch (renameError) {
        console.error('Error renaming file:', renameError);
        console.error(`Details: oldpath: ${file.filepath}, newpath: ${newFilepath}`);
        // Попытка удалить временный файл, если renameSync не удался
        if (file.filepath && fs.existsSync(file.filepath)) {
            try {
                fs.unlinkSync(file.filepath);
            } catch (unlinkErr) {
                console.error('Error deleting temporary file after rename failure:', unlinkErr);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error processing uploaded file', details: renameError.message });
        }
        reject(renameError); // Отклоняем Promise при ошибке переименования
      }
    });
  }).catch(error => {
    // Этот catch нужен, если сам Promise был отклонен (например, form.parse кинул исключение синхронно, хотя это маловероятно)
    // или если reject был вызван без отправки ответа ранее.
    if (!res.headersSent) {
      console.error('Promise rejected in form.parse handling chain, ensuring response is sent:', error.message);
      res.status(500).json({ error: 'Server error during file upload processing.' });
    }
  });
}
