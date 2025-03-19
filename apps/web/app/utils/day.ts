import dayjs from "~/libs/dayjs";

export const format = (date: Date, format: string) => {
  return dayjs(date).format(format);
};

export const isSame = (
  d1: Date,
  d2: Date,
  unitType: dayjs.UnitType,
): boolean => {
  return dayjs(d1).isSame(d2, unitType);
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
