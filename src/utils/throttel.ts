function throttle<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    let timer: NodeJS.Timeout | null = null;
  
    return (...args: Parameters<T>): void => {
      const now = Date.now();
  
      if (now - lastCall >= delay) {
        // If enough time has passed, execute the function immediately
        lastCall = now;
        fn(...args);
      } else if (!timer) {
        // Schedule the next execution after the remaining time
        const remainingTime = delay - (now - lastCall);
  
        timer = setTimeout(() => {
          lastCall = Date.now();
          timer = null;
          fn(...args);
        }, remainingTime);
      }
    };
  }
  
  export default throttle;