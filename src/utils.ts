/**
 * @fileoverview Utility methods.
 */

export interface IRegexMatchObj {
  str: string;
  arr: string[];
}

/** Delays given function by given time (ms). */
export const delay = (ms: number, func = () => {}): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(resolve.bind(null, func), ms);
  });
};

/** Searches given string to find string(s) that matches given RegExp. */
export const findRegexMatches = async (regex: RegExp, str: string,
    callback: (str: string) => any): Promise<IRegexMatchObj> => {
  const matches = str.match(regex);
  const arr: Array<string> = [];

  if (matches?.length) {
    for (const match of matches) {
      const foundStr = match.replace(regex, '$1').trim();
      const replaceStr = await callback(foundStr);
      arr.push(replaceStr);

      // replace entire found string with ''
      str = str.replace(match.replace(regex, '$&'), replaceStr);
    }
  }

  return {str, arr};
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
