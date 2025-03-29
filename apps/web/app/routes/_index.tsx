import { type MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Time blocker" },
    { name: "description", content: "Welcome to Time blocker!" },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/calendars");
  }, [navigate]);
  return <div />;
}
