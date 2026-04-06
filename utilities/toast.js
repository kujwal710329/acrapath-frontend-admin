import toast from 'react-hot-toast';

const DEFAULT_OPTIONS = {
  duration: 4000,
};

export function showSuccess(message, opts = {}) {
  return toast.success(message, { ...DEFAULT_OPTIONS, id: message, ...opts });
}

export function showError(message, opts = {}) {
  return toast.error(message, { ...DEFAULT_OPTIONS, id: message, ...opts });
}

export function showInfo(message, opts = {}) {
  return toast(message, { ...DEFAULT_OPTIONS, id: message, ...opts });
}

export function showPromise(promise, {
  loading = 'Processing...',
  success = 'Success',
  error = 'Error',
} = {}) {
  return toast.promise(promise, {
    loading,
    success,
    error,
  });
}

export default {
  showSuccess,
  showError,
  showInfo,
  showPromise,
};
