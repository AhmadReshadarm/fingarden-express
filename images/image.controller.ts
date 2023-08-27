import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { ImageService } from './image.service';
import multer from './middlewares/multer';
import { ImageDto } from './image.dto';
import { DESTINATION } from './config';
import { Controller, Delete, Get, Middleware, Post } from '../core/decorators';
import { createDestination } from './middlewares/create.destination';
import { isAdmin, isUser, verifyToken } from '../core/middlewares';
import { HttpStatus } from '../core/lib/http-status';
import fs from 'fs';
// import { unlink } from 'node:fs';
@singleton()
@Controller('/images')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Get(':fileName')
  async getImage(req: Request, resp: Response) {
    const { fileName } = req.params;
    try {
      if (!fs.existsSync(`${DESTINATION}/${fileName}`)) {
        await this.imageService.removeImage(fileName);
        resp.status(HttpStatus.NOT_FOUND).json({ message: 'the file your looking for does not exist' });
        return;
      }
      resp.sendFile(fileName, { root: DESTINATION });
    } catch (error: any) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error.message);
    }
  }

  @Get()
  @Middleware([verifyToken, isAdmin])
  async getImages(req: Request, resp: Response) {
    try {
      const images = await this.imageService.getImages();
      resp.status(HttpStatus.OK).json(images);
    } catch (error: any) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error.message);
    }
  }

  @Post()
  @Middleware([verifyToken, isUser, createDestination, multer.array('files')])
  async uploadImages(req: Request, resp: Response) {
    const files: ImageDto[] = (req as any).files ?? [];
    try {
      await this.imageService.uploadImages(files);
      resp.json(files.map(image => image.filename));
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error });
    }
  }

  @Delete(':fileName')
  @Middleware([verifyToken, isAdmin])
  async deleteImage(req: Request, resp: Response) {
    const { fileName } = req.params;
    try {
      await this.imageService.removeImage(fileName);
      fs.unlink(`${DESTINATION}/${fileName}`, err => {
        if (err) {
          resp.status(HttpStatus.NOT_FOUND).json({ message: 'the file your looking for does not exist' });
          return;
        }
        resp.status(HttpStatus.OK).json({ message: 'file removed successfuly' });
      });
    } catch (error: any) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error.message);
    }
  }
}
