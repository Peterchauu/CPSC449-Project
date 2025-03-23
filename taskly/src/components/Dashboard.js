import React, { useState } from "react";
import TodoList from "./TodoList";

const Dashboard = () => {
  const [todos, setTodos] = useState([
    { id: "1", text: "Task 1" },
    { id: "2", text: "Task 2" },
    { id: "3", text: "Task 3" },
  ]);

  return (
    <div>
      <h1>My Tasks</h1>
      <TodoList todos={todos} setTodos={setTodos} />
    </div>
  );
};

export default Dashboard;