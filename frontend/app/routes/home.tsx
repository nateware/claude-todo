import type { Route } from "./+types/home";
import { TodoApp } from "~/components/todos/TodoApp";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo List" },
    { name: "description", content: "A simple todo application" },
  ];
}

export default function Home() {
  return <TodoApp />;
}
