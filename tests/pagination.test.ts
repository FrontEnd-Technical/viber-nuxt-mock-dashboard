import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isPageSize, PAGE_SIZE_OPTIONS } from '../app/utils/pagination.ts'

describe('pagination options', () => {
  it('provides the supported page sizes', () => {
    assert.deepEqual(PAGE_SIZE_OPTIONS, [10, 30, 50])
  })

  it('accepts only supported page sizes', () => {
    assert.equal(isPageSize(10), true)
    assert.equal(isPageSize(30), true)
    assert.equal(isPageSize(50), true)
    assert.equal(isPageSize(20), false)
    assert.equal(isPageSize('30'), false)
    assert.equal(isPageSize(null), false)
  })
})
