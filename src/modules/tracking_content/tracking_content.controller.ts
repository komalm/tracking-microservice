import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  SerializeOptions,
  Post,
  Body,
  Delete,
  UseInterceptors,
  UseFilters,
  Query, UploadedFile
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateContentTrackingDto } from './dto/tracking-content-create-dto';
import { SearchContentTrackingDto } from './dto/tracking-content-search-dto';
import { TrackingContentService } from './tracking_content.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
//import { AllExceptionsFilter } from 'src/common/utils/exception.filter';
import { TrackingContentImportService } from './tracking_content_import.service'; // 👈 Added this
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('content')
@ApiTags('tracking-content')
export class TrackingContentController {
  constructor(
    private readonly trackingContentService: TrackingContentService,
    private readonly contentImportService: TrackingContentImportService,
  ) {}

 // Start Import Content

 @Post('import')
 
 @UseInterceptors(FileInterceptor('file', {
   storage: diskStorage({
     destination: './uploads',
     filename: (req, file, callback) => {
       callback(null, `${Date.now()}-${file.originalname}`);
     }
   }),
   fileFilter: (req, file, callback) => {
     if (!file.mimetype.includes('csv')) {
       return callback(new Error('Only CSV files are allowed'), false);
     }
     callback(null, true);
   }
 }))

 async importContent(@UploadedFile() file: Express.Multer.File) {
  // console.log('komal');
   const result = await this.contentImportService.importContent(file.path);
   return { message: 'Content import completed', ...result };
 }

 @Post('import-assessment')
 @UseInterceptors(FileInterceptor('file', {
   storage: diskStorage({
     destination: './uploads',
     filename: (req, file, callback) => {
       callback(null, `${Date.now()}-${file.originalname}`);
     }
   }),
   fileFilter: (req, file, callback) => {
     if (!file.mimetype.includes('csv')) {
       return callback(new Error('Only CSV files are allowed'), false);
     }
     callback(null, true);
   }
 }))
 async importAssessment(@UploadedFile() file: Express.Multer.File) {
   if (!file) {
     throw new Error('No file uploaded');
   }
 
   const result = await this.contentImportService.importAssessment(file.path);
   return { message: 'Assessment import completed', ...result };
 }
 
 
 // End Import Content

  // 👈 Added this
  // @Get('import-content/:userId')
  // async importContent(@Param('userId') userId: string) {
  //   return await this.contentImportService.importUserContentConsumption(userId);
  // }

  // @Get('import-csv')
  // async importCsv(@Query('file') file?: string) {
  //   return await this.contentImportService.importUserContentFromCsv(file);
  // }
  

  //Get Content by Id
  //@UseFilters(new AllExceptionsFilter())
  @Get('read/:contentTrackingId')
  @ApiOkResponse({ description: 'Content details fetched successfully' })
  @ApiNotFoundResponse({ description: 'Content Not Found' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseInterceptors(CacheInterceptor)
  public async getContentTrackingDetails(
    @Param('contentTrackingId') contentTrackingId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.trackingContentService.getContentTrackingDetails(
      request,
      contentTrackingId,
      response,
    );
  }

  //Create Content
  //@UseFilters(new AllExceptionsFilter())
  @Post('create')
  @ApiCreatedResponse({
    description: 'Content has been created successfully.',
  })
  @ApiBody({ type: CreateContentTrackingDto })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiConflictResponse({ description: 'Duplicate data.' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async createContentTracking(
    @Req() request: Request,
    @Body() createContentTrackingDto: CreateContentTrackingDto,
    @Res() response: Response,
  ) {
    return this.trackingContentService.createContentTracking(
      request,
      createContentTrackingDto,
      response,
    );
  }

  // Content
  //@UseFilters(new AllExceptionsFilter())
  @Post('search')
  async searchContentTracking(
    @Req() request: Request,
    @Body() searchFilter: any,
    @Res() response: Response,
  ) {
    return this.trackingContentService.searchContentTracking(
      request,
      searchFilter,
      response,
    );
  }

  // Content
  //@UseFilters(new AllExceptionsFilter())
  @Post('search/status')
  async searchStatusContentTracking(
    @Req() request: Request,
    @Body() searchFilter: any,
    @Res() response: Response,
  ) {
    return this.trackingContentService.searchStatusContentTracking(
      request,
      searchFilter,
      response,
    );
  }

  // Course
  //@UseFilters(new AllExceptionsFilter())
  @Post('course/status')
  async searchStatusCourseTracking(
    @Req() request: Request,
    @Body() searchFilter: any,
    @Res() response: Response,
  ) {
    return this.trackingContentService.searchStatusCourseTracking(
      request,
      searchFilter,
      response,
    );
  }

  // Unit
  //@UseFilters(new AllExceptionsFilter())
  @Post('unit/status')
  async searchStatusUnitTracking(
    @Req() request: Request,
    @Body() searchFilter: any,
    @Res() response: Response,
  ) {
    return this.trackingContentService.searchStatusUnitTracking(
      request,
      searchFilter,
      response,
    );
  }

  //Search Content
  //@UseFilters(new AllExceptionsFilter())
  @Post('/list')
  @ApiOkResponse({ description: 'Content data fetch successfully.' })
  @ApiBody({ type: SearchContentTrackingDto })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async searchContentRecords(
    @Req() request: Request,
    @Body() searchContentTrackingDto: SearchContentTrackingDto,
    @Res() response: Response,
  ) {
    return this.trackingContentService.searchContentRecords(
      request,
      searchContentTrackingDto,
      response,
    );
  }

  //Delete Content
  //@UseFilters(new AllExceptionsFilter())
  @Delete('delete/:contentTrackingId')
  @ApiOkResponse({ description: 'Content tracking deleted successfully.' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'Content Not Found.' })
  async deleteContentTracking(
    @Param('contentTrackingId') contentTrackingId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.trackingContentService.deleteContentTracking(
      request,
      contentTrackingId,
      response,
    );
  }

  //Course In Progress
  //@UseFilters(new AllExceptionsFilter())
  @Post('course/inprogress')
  @ApiOkResponse({ description: 'Course In Progress List fetch successfully.' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'User Not Found.' })
  async courseInProgress(
    @Req() request: Request,
    @Body() searchFilter: any,
    @Res() response: Response,
  ) {
    return this.trackingContentService.courseInProgress(
      request,
      searchFilter,
      response,
    );
  }
}
