import { useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';  // Import the AuthContext
import './index.css';  // Add custom CSS for better styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();  // Destructure the login function from AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authLogin(email, password);

    } catch (error) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-heading">Welcome Back</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <i className="bi bi-envelope"></i>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <i className="bi bi-lock"></i>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-3">
          <p>
            Don’t have an account?{' '}
            <a href="/register" className="text-primary">Register now</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
