import { Button, ButtonGroup, Container, Dialog, DialogActions, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import EditIcon from '@mui/icons-material/Edit';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './TodoApp.css'; // Импортируем CSS для анимации

// Определение типа задачи
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]); // Состояние для хранения списка задач
  const [newTodo, setNewTodo] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false); // Состояние для открытия модального окна
  const [editTodoId, setEditTodoId] = useState<number | null>(null); // ID редактируемой задачи

  // Загрузка задач из Local Storage при первом рендере
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    console.log('Загружаем задачи из Local Storage:', savedTodos); // Лог загрузки
    if (savedTodos) {
      try {
        const parsedTodos: Todo[] = JSON.parse(savedTodos);
        console.log('Парсинг успешен, задачи:', parsedTodos); // Лог успешного парсинга
        setTodos(parsedTodos);
      } catch (error) {
        console.error('Ошибка парсинга задач:', error); // Лог ошибки парсинга
      }
    }
  }, []);

  // Сохранение задач в Local Storage при изменении
  useEffect(() => {
    if (todos.length > 0) {
      console.log('Сохраняем задачи в Local Storage:', todos);
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

 const handleAddTodo = () => {
  if (newTodo.trim()) {
    const newTask: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
    };
    setTodos(prevTodos => [...prevTodos, newTask]);
    setNewTodo(''); // Очищаем поле ввода
    setDialogOpen(false); // Закрываем модальное окно
  }
};

const handleDeleteTodo = (id: number) => {
  setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id)); // Удаление задачи по id
};

const handleToggleCompleted = (id: number) => {
  setTodos(prevTodos => prevTodos.map(todo => 
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
};

const handleFilterChange = (newFilter: 'all' | 'completed' | 'incomplete') => {
  setFilter(newFilter);
};

const handleEditTodo = () => {
  if (editTodoId !== null && newTodo.trim()) {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === editTodoId ? { ...todo, text: newTodo } : todo
      )
    );
    setNewTodo('');
    setDialogOpen(false);
    setEditTodoId(null);
  }
};

const handleDialogOpen = (todo?: Todo) => {
  if (todo) {
    setNewTodo(todo.text);
    setEditTodoId(todo.id); // Устанавливаем ID редактируемой задачи
  } else {
    setNewTodo('');
    setEditTodoId(null); // Обнуляем ID при добавлении новой задачи
  }
  setDialogOpen(true);
};


const handleDialogClose = () => {
  setDialogOpen(false);
  setNewTodo('');
  setEditTodoId(null); // Обнуляем ID при закрытии
};

const filteredTodos = todos.filter(todo => {
  if (filter === 'completed') return todo.completed;
  if (filter === 'incomplete') return !todo.completed;
  return true; // 'all'
});

return (
  <Container maxWidth="sm">
    <Typography variant="h3" align="center" gutterBottom>
      Todo List
    </Typography>
    
    <Button variant="contained" onClick={() => handleDialogOpen()}>Add Task</Button>

    {/* Модальное окно для добавления новой задачи */}
    <Dialog open={dialogOpen} onClose={handleDialogClose}>
      <DialogTitle>{editTodoId ? 'Edit task' : 'Add new task'}</DialogTitle>
      <DialogContent>
        <TextField
          label="New Task"
          variant="outlined"
          fullWidth
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={editTodoId ? handleEditTodo : handleAddTodo} variant="contained" color="primary">{editTodoId ? 'Save' : 'Add'}</Button>
      </DialogActions>
    </Dialog>

    {/* Фильтрация */}
    <ButtonGroup variant="contained" fullWidth sx={{ mt: 2 }}>
      <Button onClick={() => handleFilterChange('all')}>All</Button>
      <Button onClick={() => handleFilterChange('completed')}>Completed</Button>
      <Button onClick={() => handleFilterChange('incomplete')}>Incomplete</Button>
    </ButtonGroup>

    <List>
      <TransitionGroup>
        {filteredTodos.map((todo) => (
          <CSSTransition key={todo.id} timeout={300} classNames="fade">
            <ListItem key={todo.id}>
              <IconButton edge="start" aria-label="toggle completed" onClick={() => handleToggleCompleted(todo.id)} >
                {todo.completed ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
              </IconButton>
              <ListItemText primary={todo.text} sx={{ textDecoration: todo.completed ? 'line-through' : 'none' }}/>
              <IconButton aria-label="edit" onClick={() => handleDialogOpen(todo)}>
                <EditIcon />
              </IconButton>
              <IconButton aria-label="delete" onClick={() => handleDeleteTodo(todo.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </List>

    {/* Сообщение о пустом списке */}
    {filter === 'completed' && filteredTodos.length === 0 && (
        <Typography variant="body1" align="center" sx={{ mt: 2 }}>
          No completed tasks
        </Typography>
      )}
      {filter === 'incomplete' && filteredTodos.length === 0 && (
        <Typography variant="body1" align="center" sx={{ mt: 2 }}>
          No incomplete tasks
        </Typography>
      )}
  </Container>
);
}

export default TodoApp;
