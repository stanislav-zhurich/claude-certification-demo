from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="To-Do List API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TodoCreate(BaseModel):
    title: str
    description: str = ""
    due_date: Optional[date] = None


class Todo(TodoCreate):
    id: int
    done: bool = False


# Simple in-memory store
todos: dict[int, Todo] = {}
next_id = 1


@app.get("/todos", response_model=list[Todo])
def list_todos():
    return list(todos.values())


@app.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: int):
    todo = todos.get(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@app.post("/todos", response_model=Todo, status_code=201)
def create_todo(payload: TodoCreate):
    global next_id
    todo = Todo(id=next_id, **payload.model_dump())
    todos[todo.id] = todo
    next_id += 1
    return todo


@app.patch("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, done: bool):
    todo = todos.get(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.done = done
    return todo
