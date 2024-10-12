import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { isArray } from 'class-validator';

export const createApiResponse = (params: any) => {
  const {status, description, example,type, isArray} = params
  return ApiResponse({
    status: status,
    description: description,
    isArray:isArray,
    type: type,
    schema: {
      example: example,
    },
  });
};
export interface Response {
  status: number;
}
export interface SuccessResponse extends Response {
  data: any;
}
export interface RejectResponse extends Response {
  description: any;
}
export const successResponse = (data:any):SuccessResponse=>{
  return {
    status: 200,
    data: data
  }
}
export const rejectResponse = (status:number,description:any):RejectResponse=>{
  return {
    status: status,
    description: description,
  }
}