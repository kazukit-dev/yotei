import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Time blocker" },
    { name: "description", content: "Welcome to Time blocker!" },
  ];
};

export default function Index() {
  return <div>Welcome to Time blocker</div>;
}
