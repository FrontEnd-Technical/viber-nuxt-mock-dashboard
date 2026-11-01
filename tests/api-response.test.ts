import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ApiError,
  readApiSuccessResponse,
  toApiError,
  unwrapApiResponse,
} from '../app/utils/api-response.ts'

describe('API response contract', () => {
  it('unwraps data from a successful response envelope', () => {
    const data = { id: 12, name: 'Minh Anh' }

    assert.deepEqual(
      unwrapApiResponse({
        success: true,
        code: 200,
        message: 'OK',
        data,
      }),
      data,
    )
  })

  it('preserves pagination metadata when reading a successful envelope', () => {
    const response = readApiSuccessResponse<{ id: number }[]>({
      success: true,
      code: 200,
      message: 'OK',
      data: [{ id: 12 }],
      meta: { pageNumber: 1, pageSize: 10, totalElements: 11, totalPages: 2 },
    })

    assert.deepEqual(response.data, [{ id: 12 }])
    assert.equal(response.meta?.pageNumber, 1)
    assert.equal(response.meta?.totalPages, 2)
  })

  it('accepts an empty successful response payload', () => {
    assert.equal(
      unwrapApiResponse({
        success: true,
        code: 200,
        message: 'OK',
      }),
      undefined,
    )
  })

  it('throws a typed error for an error envelope', () => {
    assert.throws(
      () => unwrapApiResponse({
        success: false,
        code: 400,
        message: 'Định dạng email không hợp lệ.',
        errorCode: 'INVALID_EMAIL',
        errors: [{ field: 'email', message: 'Email không hợp lệ.' }],
        correlationId: 'corr-123',
      }),
      (error: unknown) => error instanceof ApiError
        && error.statusCode === 400
        && error.errorCode === 'INVALID_EMAIL'
        && error.errors?.[0]?.field === 'email'
        && error.correlationId === 'corr-123'
        && error.message === 'Định dạng email không hợp lệ.',
    )
  })

  it('rejects a response that does not match the envelope contract', () => {
    for (const response of [
      { data: { id: 1 } },
      { success: 'yes', code: 200, message: 'OK', data: {} },
      { success: true, code: 200, message: 'OK', errorCode: 400 },
      { success: false, code: 400, message: 'Bad request', errors: ['invalid'] },
    ]) {
      assert.throws(
        () => unwrapApiResponse(response),
        (error: unknown) => error instanceof ApiError
          && error.errorCode === 'INVALID_API_RESPONSE',
      )
    }
  })

  it('normalizes HTTP error envelopes from fetch failures', () => {
    const error = toApiError({
      message: 'Request failed',
      response: {
        status: 401,
        _data: {
          success: false,
          code: 401,
          message: 'Phiên đăng nhập hết hạn.',
          errorCode: 'TOKEN_EXPIRED',
        },
      },
    })

    assert.equal(error.statusCode, 401)
    assert.equal(error.errorCode, 'TOKEN_EXPIRED')
    assert.equal(error.message, 'Phiên đăng nhập hết hạn.')
  })

  it('uses the response HTTP status for refresh decisions', () => {
    const error = toApiError({
      message: 'Unauthorized',
      response: {
        status: 401,
        _data: {
          success: false,
          code: 400,
          message: 'Token expired.',
          errorCode: 'TOKEN_EXPIRED',
        },
      },
    })

    assert.equal(error.statusCode, 401)
  })
})
