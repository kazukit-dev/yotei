import type { MetaFunction } from "@remix-run/node";
import { type ClientLoaderFunction, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Time blocker" },
    { name: "description", content: "Welcome to Time blocker!" },
  ];
};

export const clientLoader: ClientLoaderFunction = async () => {
  const data = await fetch("http://localhost:8787/calendars", {
    method: "GET",
  });
  return data.json();
};

export default function Index() {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <div>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}
