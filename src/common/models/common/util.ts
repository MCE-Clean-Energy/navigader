import { PandasFrame, RawPandasFrame } from './types';


/**
 * Parses a `RawPandasFrame` into a `PandasFrame`, which involves converting the indexed objects
 * into arrays
 *
 * @param {RawPandasFrame} frame: the pandas frame to parse
 */
export function parsePandasFrame<T extends Record<string, any>> (frame: RawPandasFrame<T>): PandasFrame<T> {
  const frameProps: [keyof T, T[keyof T][]][] = [];
  
  Object.keys(frame).forEach((key: keyof T) => {
    // Sort the keys numerically, not alphabetically
    const orderedIndices = Object.keys(frame[key]).sort((index1, index2) => {
      const numeric1 = +index1;
      const numeric2 = +index2;
      
      if (numeric1 < numeric2) return -1;
      if (numeric2 < numeric1) return 1;
      return 0;
    });
    
    frameProps.push([key, orderedIndices.map(index => frame[key][+index])]);
  });
  
  return frameProps.reduce((parsedFrame, [key, value]) => {
    parsedFrame[key] = value;
    return parsedFrame;
  }, {} as PandasFrame<T>);
}
