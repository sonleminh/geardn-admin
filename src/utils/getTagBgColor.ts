export const getBgColor = (value: string) => {
    switch (value) {
      case 'DISCOUNTED':
        return '#65ab5b';
      case 'BEST_SELLER':
        return '#C11A1A';
      case 'NEW_ARRIVAL':
        return '#007bff';
      case 'SECONDHAND':
        return '#ff9800'; 
      default:
        return '#ccc';
    }
  };