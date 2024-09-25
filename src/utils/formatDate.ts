export function formatDateToNormal (isoString: string | undefined) {
    return isoString ? new Date(isoString).toISOString().split('T')[0] : '';
  };

  export function formatDateToIOS (date: string | undefined) {
    return date ? new Date(date).toISOString() : '';
  };