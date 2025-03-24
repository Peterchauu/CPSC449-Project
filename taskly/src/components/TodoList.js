import React from "react";
import { Draggable } from "react-beautiful-dnd";

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
              style={{
                padding: "8px",
                margin: "4px",
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
                ...provided.draggableProps.style,
              }}
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