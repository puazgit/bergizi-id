// Enterprise Service Result Pattern - Serialization Safe
// src/lib/service-result.ts

interface ValidationError {
  message: string
  path: string[]
  code: string
}

export interface ServiceResult<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
  readonly errors?: ValidationError[]
}

// Enterprise-grade factory functions for serialization safety
export const ServiceResult = {
  success<T>(data: T): ServiceResult<T> {
    return {
      success: true,
      data,
      error: undefined,
      errors: undefined
    }
  },

  error<T>(error: string, errors?: ValidationError[]): ServiceResult<T> {
    return {
      success: false,
      data: undefined,
      error,
      errors
    }
  }
}

// Enterprise utility functions
export function isServiceSuccess<T>(result: ServiceResult<T>): result is ServiceResult<T> & { data: T } {
  return result.success === true
}

export function isServiceError<T>(result: ServiceResult<T>): result is ServiceResult<T> & { error: string } {
  return result.success === false
}