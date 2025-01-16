import { uuid } from 'vue-uuid';

export const useCreateUtilities = () => {
  function generateID(item) {
    return item.toLowerCase().replace(/\s/g, "-") + "-" + uuid.v4().slice(0, 8)
  }
  
  function clearObjectValues(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = '';
      }
    }
  }

  function validate(item) {
    const errors = [];
  
    function validateProperty(property, path) {
      if (!property || (typeof property === 'string' && property.trim() === '')) {
        errors.push({ path, message: 'Required' });
      } else if (Array.isArray(property)) {
        property.forEach((item, index) => {
          const itemPath = `${path}[${index}]`;
          validateProperty(item, itemPath);
        });
      } else if (typeof property === 'object') {
        for (const key in property) {
          if (property.hasOwnProperty(key)) {
            const nestedPath = path ? `${path}.${key}` : key;
            validateProperty(property[key], nestedPath);
          }
        }
      }
    }
  
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        const propertyPath = key;
        validateProperty(item[key], propertyPath);
      }
    }
  
    return errors;
  }

  function generateTransactionReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 20;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  
  return {
    generateID,
    clearObjectValues,
    validate,
    generateTransactionReference
  }
}