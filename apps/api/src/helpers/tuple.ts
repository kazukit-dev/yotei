export function tuple<T extends [unknown, ...unknown[]]>(...args: T): T {
  return args;
}
