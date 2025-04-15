import React from "react";
import { Draggable } from "@hello-pangea/dnd";

const TodoList = ({ todos }) => {
  return (
    <div>
      {todos.map((todo, index) => (
        <Draggable key={todo.id} draggableId={todo.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="task-item"
            >
              {todo.title}
            </div>
          )}
        </Draggable>
      ))}
    </div>
  );
};

export default TodoList;