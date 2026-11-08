import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Asegurar que exista la carpeta física 'uploads/comprobantes'
const uploadPath = join(process.cwd(), 'uploads', 'comprobantes');
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

@Controller('upload')
export class UploadController {
  @Post('comprobante')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `comprobante-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // Límite de 5 MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Solo se admiten archivos PDF o imágenes (JPG, PNG)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    // Retorna la ruta relativa para ser consumida como estático
    return {
      url: `http://localhost:3000/uploads/comprobantes/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}