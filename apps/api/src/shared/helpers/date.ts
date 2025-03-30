import dayjs from "./dayjs";

export const between = (target: Date, from: Date, to: Date): boolean => {
  return dayjs(target).isBetween(from, to, "millisecond");
};

type Operator = "=" | ">" | ">=" | "<" | "<=";

export const compare = (target: Date, operator: Operator, value: Date) => {
  switch (operator) {
    case "<":
      return dayjs(target).isBefore(value);
    case "<=":
      return dayjs(target).isSameOrBefore(value);
    case ">":
      return dayjs(target).isAfter(value);
    case ">=":
      return dayjs(target).isSameOrAfter(value);
    case "=":
      return dayjs(target).isSame(value);
  }
};

export const isValidDate = (value: string | number | Date): boolean => {
  if (typeof value === "number" && value < 0) return false;
  return dayjs(new Date(value)).isValid();
};
