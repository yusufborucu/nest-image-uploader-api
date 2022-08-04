import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../types/user';
import { Image } from '../types/image';
import { CreateImageDTO, UpdateImageDTO } from './image.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel('Image') private imageModel: Model<Image>,
    private cloudinaryService: CloudinaryService,
    @Inject('MAIL_SERVICE') private client: ClientProxy
  ) {}

  async create(imageDTO: CreateImageDTO, user: User, file: Express.Multer.File): Promise<Image> {
    const uploadResult = await this.cloudinaryService.uploadImage(file);
    imageDTO.link = uploadResult.url;
    const image = await this.imageModel.create({
      ...imageDTO,
      owner: user
    });
    await image.save();

    await this.client.emit('image-created', {
      'email': user.email,
      'link': uploadResult.url, 
      'note': imageDTO.note
    });

    return image.populate('owner');
  }

  async get(user: User) {
    let images = await this.imageModel.find({ owner: user._id });
    return images;
  }

  async findById(id: string): Promise<Image> {
    const image = await this.imageModel.findById(id).populate('owner');
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NO_CONTENT);
    }
    return image;
  }

  async update(id: string, imageDTO: UpdateImageDTO, userId: string): Promise<Image> {
    const image = await this.imageModel.findById(id);
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.BAD_REQUEST);
    }
    if (userId != image.owner.toString()) {
      throw new HttpException('You do not own this image', HttpStatus.UNAUTHORIZED);
    }
    await image.updateOne(imageDTO);
    return await this.imageModel.findById(id).populate('owner');
  }

  async delete(id: string, userId: string): Promise<Image> {
    const image = await this.imageModel.findById(id);
    if (userId != image.owner.toString()) {
      throw new HttpException('You do not own this image', HttpStatus.UNAUTHORIZED);
    }

    await image.remove();

    await this.cloudinaryService.deleteImage(image.link);

    return image.populate('owner');
  }
}
