import { Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsObject,
  IsOptional,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// Custom decorator to check if the object is not empty
function IsNotEmptyObject(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyObject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value && Object.keys(value).length > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} should not be an empty object`;
        },
      },
    });
  };
}
export class setFilters {
  
  @ApiPropertyOptional({
    type: () => String,
    description: "Assessment Tracking Id",
  })
  @Expose()
  @IsUUID(undefined, { message: 'Assessment Tracking Id must be a valid UUID' })
  @IsOptional()
  @IsNotEmpty()
  assessmentTrackingId: string;


  @ApiPropertyOptional({
    type: () => String,
    description: "User Id",
  })
  @Expose()
  @IsUUID(undefined, { message: 'User Id must be a valid UUID' })
  @IsOptional()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    type: () => String,
    description: "Course Id",
  })
  @Expose()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({
    type: () => String,
    description: "Batch Id",
  })
  @Expose()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  batchId: string;

  @ApiPropertyOptional({
    type: () => String,
    description: "Content values",
  })
  @Expose()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  contentId: string;
}

export class paginationDto {
  @ApiProperty({
    type: Number,
    description: "Page Size",
  })
  @Expose()
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  pageSize: number;

  @ApiProperty({
    type: Number,
    description: "Page",
  })
  @Expose()
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  page: number;
}

export class sortDto {
  @ApiProperty({
    type: String,
    description: "Field",
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  field: string;


  @ApiProperty({
    type: String,
    description: "Order",
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  order: string;
}

export class SearchAssessmentTrackingDto {

  @ApiProperty({
    type: setFilters,
    description: "Filters",
  })
  @IsObject()
  @IsNotEmptyObject({ message: 'Filters should not be an empty object' })
  filters: setFilters;

  @ApiProperty({
    type: paginationDto,
    description: "Pagination",
  })
  @IsOptional()
  @IsObject()
  pagination: paginationDto;

  @ApiProperty({
    type: sortDto,
    description: "Ordering",
  })
  @IsOptional()
  @IsObject()
  sort: sortDto;

  constructor(partial: Partial<SearchAssessmentTrackingDto>) {
    Object.assign(this, partial);
  }
}