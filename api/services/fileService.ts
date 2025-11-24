import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export interface FileUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

export class FileService {
  static async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
  }

  static async uploadFile(file: Express.Multer.File): Promise<FileUploadResult> {
    await this.ensureUploadDir();

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(filepath, file.buffer);

    return {
      filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${filename}`
    };
  }

  static async deleteFile(filename: string): Promise<void> {
    if (!filename) return;
    
    const filepath = path.join(UPLOAD_DIR, filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  }

  static validateImageFile(file: Express.Multer.File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.');
    }

    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB.');
    }

    return true;
  }
}