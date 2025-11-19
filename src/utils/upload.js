import fs from 'fs';
import path from 'path';
const uploadDir = path.join(process.cwd(), 'upload');


async function saveProfilePicture(file, allowedMimes) {
  if (!file) return null;
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }
  const fileName = Date.now() + '_' + file.name;
  const filePath = path.join(uploadDir, fileName);
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(filePath, file.data);
  return `/upload/${fileName}`;
}
