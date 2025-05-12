/* eslint-env node */
import fs from 'fs';
import path from 'path';

const iconsFilePath = path.join(process.cwd(), 'public', 'icons', 'group_icons.json');

// Helper function to read icons data
const readIconsFile = () => {
  try {
    if (fs.existsSync(iconsFilePath)) {
      const data = fs.readFileSync(iconsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading icons file:', error);
  }
  return {}; // Return empty object if file doesn't exist or error reading
};

// Helper function to write icons data
const writeIconsFile = (data) => {
  try {
    fs.writeFileSync(iconsFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing icons file:', error);
    return false;
  }
};

export default async function handler(req, res) {
  // Basic Auth - Replace with your actual authentication mechanism if needed
  // This is a very basic example and might not be suitable for production
  /*
  const authheader = req.headers.authorization;
  if (!authheader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required.');
  }
  const auth = Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];
  // Replace with your actual admin credentials check
  if (user !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASSWORD) {
     res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
     return res.status(401).send('Authentication failed.');
  }
  */
 // TODO: Add proper authentication/authorization

  if (req.method === 'GET') {
    const iconsData = readIconsFile();
    return res.status(200).json(iconsData);
  } else if (req.method === 'POST') {
    try {
      const newIconsData = req.body; // Expecting the full {id: iconUrl, ...} object
      if (typeof newIconsData !== 'object' || newIconsData === null) {
        return res.status(400).json({ error: 'Invalid data format. Expected an object.' });
      }

      // Optional: Basic validation - ensure values are strings (URLs)
      for (const key in newIconsData) {
        if (typeof newIconsData[key] !== 'string') {
          console.warn(`Invalid value for key ${key}: ${newIconsData[key]}. Removing.`);
          delete newIconsData[key]; // Or handle differently
        }
        // Optionally remove empty strings if they mean "no icon"
        if (newIconsData[key] === '') {
             delete newIconsData[key];
        }
      }


      const success = writeIconsFile(newIconsData);
      if (success) {
        return res.status(200).json({ message: 'Icons saved successfully.' });
      } else {
        return res.status(500).json({ error: 'Failed to save icons file.' });
      }
    } catch (error) {
      console.error('Error processing POST request for icons:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
