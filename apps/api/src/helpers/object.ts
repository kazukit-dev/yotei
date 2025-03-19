export const omit = <O extends object, Keys extends keyof O>(
  data: O,
  keys: Keys[],
): Omit<O, Keys> => {
  const result = { ...data };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<O, Keys>;
};

export const keys = <T extends object>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};
