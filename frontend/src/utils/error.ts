import type { ApiError } from '../types';

export function getApiError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: ApiError } }).response;
    const apiError = response?.data;
    
    if (apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    } else if (apiError?.message) {
      return apiError.message;
    }
  }
  
  return 'An error occured, please make sure your password is 6 characters long';
}