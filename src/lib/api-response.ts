import { NextApiResponse } from 'next';

export interface ApiResponse<T = null> {
  code: number;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
  timestamp: number;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function success<T = null>(
  data: T,
  message: string = 'success',
  code: number = 200
): ApiResponse<T> {
  return {
    code,
    message,
    data,
    timestamp: Date.now(),
    requestId: generateRequestId(),
  };
}

export function created<T = null>(data: T, message: string = '创建成功'): ApiResponse<T> {
  return success(data, message, 201);
}

export function error(
  code: number,
  message: string,
  errors?: Array<{ field: string; message: string }>
): ApiResponse {
  return {
    code,
    message,
    data: null,
    errors,
    timestamp: Date.now(),
    requestId: generateRequestId(),
  };
}

export function badRequest(message: string, errors?: Array<{ field: string; message: string }>): ApiResponse {
  return error(400, message, errors);
}

export function unauthorized(message: string = '请先登录'): ApiResponse {
  return error(401, message);
}

export function forbidden(message: string = '您没有权限执行此操作'): ApiResponse {
  return error(403, message);
}

export function notFound(message: string = '请求的资源不存在'): ApiResponse {
  return error(404, message);
}

export function conflict(message: string = '资源冲突'): ApiResponse {
  return error(409, message);
}

export function unprocessable(message: string): ApiResponse {
  return error(422, message);
}

export function tooManyRequests(message: string = '操作过于频繁，请稍后再试'): ApiResponse {
  return error(429, message);
}

export function serverError(message: string = '服务器开小差了，请稍后重试'): ApiResponse {
  return error(500, message);
}

export function sendResponse<T = null>(
  res: NextApiResponse,
  response: ApiResponse<T>
): void {
  res.status(response.code).json(response);
}

export function sendSuccess<T = null>(
  res: NextApiResponse,
  data: T,
  message: string = 'success',
  code: number = 200
): void {
  sendResponse(res, success(data, message, code));
}

export function sendError(
  res: NextApiResponse,
  code: number,
  message: string,
  errors?: Array<{ field: string; message: string }>
): void {
  sendResponse(res, error(code, message, errors));
}
