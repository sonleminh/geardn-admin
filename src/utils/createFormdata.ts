export const createFormData = (payload: any) => {
    const formData = new FormData();
  
    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        const value = payload[key];
        if (value instanceof File) {
          formData.append(key, value);
        }
        if(Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
          continue;
        }
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.keys(value).forEach((subKey) => {
            const fieldName = `${key}[${subKey}]`;
            if (value[subKey] === undefined || value[subKey].length === 0 || value[subKey] === 0) {
              return;
            }
          formData.append(fieldName, value[subKey]);
          })
        }
        else {
          if (value !== undefined && value !== '') formData.append(key, String(value));
        }
        
      }
    }
    return formData;
  };