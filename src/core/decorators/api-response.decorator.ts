import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';

/**
 * Standard API Response wrapper for Swagger documentation
 */
export const ApiStandardResponse = <TModel extends Type>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: { $ref: getSchemaPath(model) },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
                  path: { type: 'string', example: '/api/v1/users' },
                  version: { type: 'string', example: 'v1' },
                  requestId: { type: 'string', example: 'uuid-here' },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Paginated API Response wrapper for Swagger documentation
 */
export const ApiPaginatedResponse = <TModel extends Type>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number', example: 1 },
                      limit: { type: 'number', example: 10 },
                      total: { type: 'number', example: 100 },
                      totalPages: { type: 'number', example: 10 },
                      hasNext: { type: 'boolean', example: true },
                      hasPrevious: { type: 'boolean', example: false },
                    },
                  },
                },
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string' },
                  path: { type: 'string' },
                  version: { type: 'string' },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Standard error responses bundle
 */
export const ApiErrorResponses = () => {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad Request - Invalid input data',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Invalid or missing authentication',
    }),
    ApiForbiddenResponse({
      description: 'Forbidden - Insufficient permissions',
    }),
    ApiNotFoundResponse({
      description: 'Not Found - Resource does not exist',
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
    }),
  );
};

/**
 * Created response for POST endpoints
 */
export const ApiCreatedStandardResponse = <TModel extends Type>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: { $ref: getSchemaPath(model) },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string' },
                  path: { type: 'string' },
                  version: { type: 'string' },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
