function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null = null;
  
    return (...args: Parameters<T>): void => {
      if (timer) {
        clearTimeout(timer);
      }
  
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }
  
  export default debounce;