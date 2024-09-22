export const createFormData = (payload: Record<string, unknown>) => {
    const formData = new FormData();
  
    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        const value = payload[key];
        if (value instanceof File) {
          formData.append(key, value);
        }
        if(key === 'tags') {
          formData.append('tags', JSON.stringify(value));
        }
        else {
          if (value !== undefined) formData.append(key, String(value));
        }
      }
    }
    return formData;
  };
  