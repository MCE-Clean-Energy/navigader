/**
 * Creates a function for use with React's `useEffect` hook that will not attempt to perform a state
 * update if the component has unmounted.
 */
export function makeCancelableAsync <T>(
  asyncFn: () => Promise<T>,
  callbackFn: (response: T) => void
) {
  return () => {
    let shouldUpdate = true;

    asyncFn().then((res) => {
      if (shouldUpdate) {
        callbackFn(res);
      }
    });

    // This is called when the component unmounts
    return () => {
      shouldUpdate = false;
    };
  }
}
