import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loginService from '../services/login';
import LoginForm from '../components/LoginForm';
import Notification from '../components/Notification';
import ErrorNotificaiton from '../components/ErrorNotificaiton';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notification, setNotification] = useState('');
  const [errorNotification, setErrorNotification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to events page
    const loggedUserJSON = window.localStorage.getItem('loggedEventFinderAppUser');
    if (loggedUserJSON) {
      navigate('/events');
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({
        username,
        password,
      });
      window.localStorage.setItem('loggedEventFinderAppUser', JSON.stringify(user));
      setNotification('Successfully logged in!');
      setTimeout(() => {
        navigate('/events');
      }, 1000);
    } catch (exception) {
      setErrorNotification('Wrong credentials');
      setTimeout(() => {
        setErrorNotification('');
      }, 5000);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      await loginService.register({
        username: newUsername,
        password: newPassword,
      });
      setNotification('Successfully registered! Please log in.');
      setNewUsername('');
      setNewPassword('');
      setTimeout(() => {
        setNotification('');
      }, 5000);
    } catch (exception) {
      setErrorNotification('Registration failed. Username might be taken.');
      setTimeout(() => {
        setErrorNotification('');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h3 className="text-center text-xl font-semibold text-gray-900">Register new account</h3>
          <form className="mt-4 space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="new-username" className="sr-only">
                New Username
              </label>
              <input
                id="new-username"
                name="new-username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New Username"
                value={newUsername}
                onChange={({ target }) => setNewUsername(target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="sr-only">
                New Password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
                value={newPassword}
                onChange={({ target }) => setNewPassword(target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Register
              </button>
            </div>
          </form>
        </div>

        {notification && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{notification}</p>
              </div>
            </div>
          </div>
        )}

        {errorNotification && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errorNotification}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 