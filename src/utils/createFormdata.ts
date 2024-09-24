export const createFormData = (payload: any) => {
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
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.keys(value).forEach((subKey) => {
            const fieldName = `${key}[${subKey}]`;
            if (value[subKey] === undefined || value[subKey].length === 0) {
              return;
            }
          formData.append(fieldName, value[subKey]);
          })
        }
        else {
          if (value !== undefined) formData.append(key, String(value));
        }
      }
    }
    return formData;
  };