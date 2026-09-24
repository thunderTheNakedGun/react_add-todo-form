import './App.scss';
import { TodoList } from './components/TodoList/TodoList';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { User } from './types/User';
import { TodoWithUserInfo } from './types/TodoWithUserInfo';
import { useState } from 'react';

function getUserById(userId: number): User {
  const userFound: User | undefined = usersFromServer.find(
    user => user.id === userId,
  );

  if (!userFound) {
    throw new Error(`user with id ${userId} not found!`);
  }

  return userFound;
}

const todos: TodoWithUserInfo[] = todosFromServer.map(todo => ({
  ...todo,
  user: getUserById(todo.userId),
}));

const defaultValues = {
  title: '',
  user: '',
};

const getNextTodoId = (): number =>
  Math.max(0, ...todos.map(todo => todo.id)) + 1;

const getUserIdByName = (name: string): number => {
  const id: number | undefined = usersFromServer.find(
    user => user.name === name,
  )?.id;

  if (!id) {
    throw new Error("Unexpected error: could not find selected user's id");
  }

  return id;
};

type FormValues = typeof defaultValues;
type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate({ title, user }: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!title) {
    errors.title = 'Please enter a title';
  }

  if (!user) {
    errors.user = 'Please choose a user';
  }

  return errors;
}

export const App = () => {
  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors = validate(values);

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const newTodo: TodoWithUserInfo = {
      id: getNextTodoId(),
      title: values.title,
      completed: false,
      userId: getUserIdByName(values.user),
      user: getUserById(getUserIdByName(values.user)),
    };

    todos.push(newTodo);

    setValues(defaultValues);
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setValues(currentValues => ({ ...currentValues, [name]: value }));

    setErrors(currentErrors => {
      const copy = { ...currentErrors };

      delete copy[name as keyof FormValues];

      return copy;
    });
  }

  return (
    <div className="App">
      <h1 className="App__title">Add todo form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          {'Title: '}
          <input
            type="text"
            name="title"
            data-cy="titleInput"
            placeholder="Enter a title "
            value={values.title}
            onChange={handleChange}
          />
          {errors.title && (
            <span className="error" data-cy="titleError">
              {errors.title}
            </span>
          )}
        </label>
        <br />
        <label>
          {'User: '}
          <select
            name="user"
            data-cy="userSelect"
            value={values.user}
            onChange={handleChange}
          >
            <option value="" disabled>
              Choose a user
            </option>
            {usersFromServer.map(item => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.user && (
            <span className="error" data-cy="userError">
              {errors.user}
            </span>
          )}
        </label>
        <br />
        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>
      <TodoList todos={todos} />
    </div>
  );
};
