export interface NexusErrorDetails {
  field?: string;
  message?: string;
  target?: string;
}

export interface NexusErrorData {
  code: string;
  message: string;
  details?: NexusErrorDetails | NexusErrorDetails[] | string;
}

export interface NexusErrorResponse {
  success: false;
  error: NexusErrorData;
}

/**
 * Extracts a normalized, human-readable error message from an API error response.
 * Safely handles unknown, unexpected, or missing error structures.
 */
export function extractErrorMessage(err: any, fallbackMessage: string = 'An unexpected error occurred. Please try again.'): string {
  const errorData = err?.response?.data?.error as NexusErrorData | undefined;

  if (!errorData) {
    // If it's a network error (no response)
    if (err?.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your connection.';
    }
    // For completely unknown structures, do NOT expose stack traces or raw HTML.
    return fallbackMessage;
  }

  // Handle specific backend error codes explicitly
  switch (errorData.code) {
    case 'CONFLICT':
      return errorData.message || 'This record already exists and cannot be duplicated.';
    case 'INSUFFICIENT_STOCK':
      return errorData.message || 'Insufficient stock available to complete this operation.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'UNAUTHORIZED':
      return 'Your session has expired or you are not logged in. Please log in again.';
    case 'VALIDATION_ERROR':
      return 'Please check the form for invalid fields and try again.';
    case 'NOT_FOUND':
      return errorData.message || 'The requested record could not be found.';
    case 'HAS_DEPENDENT_RECORDS':
      return errorData.message || 'Cannot delete this record because it is referenced by other records.';
    default:
      if (errorData.code === 'INTERNAL_ERROR') {
        return fallbackMessage;
      }
      return errorData.message || fallbackMessage;
  }
}

/**
 * Applies backend validation errors to react-hook-form fields.
 * Returns true if validation errors were found and applied.
 */
export function applyFormErrors(
  err: any,
  setError: (field: string, error: { type: string; message: string }) => void
): boolean {
  const errorData = err?.response?.data?.error as NexusErrorData | undefined;
  
  if (errorData?.code === 'VALIDATION_ERROR' && Array.isArray(errorData.details)) {
    errorData.details.forEach((detail: any) => {
      if (detail.field) {
        setError(detail.field, { type: 'server', message: detail.message });
      }
    });
    return true;
  }
  
  return false;
}
