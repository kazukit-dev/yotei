interface _Exception {
  target_date: Date;
  type: string;
}

interface CancelledException extends _Exception {
  type: "cancelled";
}

interface ModifiedException extends _Exception {
  type: "modified";
}

export type Exception = CancelledException | ModifiedException;
