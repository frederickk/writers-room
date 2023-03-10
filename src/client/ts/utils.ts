/**
 * @fileoverview Utility methods.
 */

/** Delays given function by given time (ms). */
export const delay = (ms: number, func = () => {}): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(resolve.bind(null, func), ms);
  });
};

/** Generates random number within given range. */
export const random = (min: number, max: number) => {
  return (min + Math.random() * (max - min));
};

/** Generates random number (give or take) of given value. */
export const randomFlex = (value: number, multiplier = 1) => {
  return value + (value * random(0, multiplier));
};

/** Converts given string to Title Case. */
export const toTitleCase = (str: string) => {
 return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
