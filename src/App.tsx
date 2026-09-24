import './App.scss';
import { TodoList } from './components/TodoList/TodoList';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { User } from './types/User';
import { TodoWithUserInfo } from './types/TodoWithUserInfo';

function getUserById(userId: number): User {
  const userFound: User | undefined = usersFromServer.find(
    user => user.id === userId,
  );

  if (!userFound) {
    throw new Error(`user with id ${userId} not found!`);
  }

  return userFound;
}

export const todos: TodoWithUserInfo[] = todosFromServer.map(todo => ({
  ...todo,
  user: getUserById(todo.userId),
}));

export const App = () => (
  <div className="App">
    <h1 className="App__title">Static list of todos</h1>
    <TodoList todos={todos} />
  </div>
);
