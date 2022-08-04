import { 
  Body, 
  CACHE_MANAGER, 
  Controller, 
  Delete, 
  Get, 
  HttpException, 
  HttpStatus, 
  Inject, 
  Param, 
  Post, 
  Put, 
  Req, 
  UploadedFile, 
  UseGuards, 
  UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../utilities/user.decorator';
import { CreateImageDTO, UpdateImageDTO } from './image.dto';
import { ImageService } from './image.service';
import { User as UserDocument } from '../types/user';
import { FileInterceptor } from '@nestjs/platform-express';
import { Cache } from 'cache-manager';
import { Image } from '../types/image';

@Controller('image')
export class ImageController {
  constructor(
    private imageService: ImageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() image: CreateImageDTO, 
    @User() user: UserDocument, 
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new HttpException("File is required", HttpStatus.BAD_REQUEST);
    }
    
    await this.cacheManager.del('images_' + user._id);

    return this.imageService.create(image, user, file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async get(@User() user: UserDocument) {
    let images = await this.cacheManager.get('images_' + user._id);
    if (images) {
      return images;
    }

    images = await this.imageService.get(user);

    await this.cacheManager.set('images_' + user._id, images, { ttl: 60 * 60 });

    return images;
  }

  @Get(':id')
  async read(@Param('id') id: string) {
    return this.imageService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() image: UpdateImageDTO, @User() user: UserDocument): Promise<Image> {
    const { id: userId } = user;

    await this.cacheManager.del('images_' + user._id);

    return await this.imageService.update(id, image, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string, @User() user: UserDocument): Promise<Image> {
    const { id: userId } = user;
    
    await this.cacheManager.del('images_' + user._id);

    return await this.imageService.delete(id, userId);
  }
}
