import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const { login, isAuthenticated, loading, error, clearErrors } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    await login(values.email, values.password);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Brahamand CRM</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="you@example.com"
                />
                <ErrorMessage 
                  name="email" 
                  component="div" 
                  className="mt-1 text-sm text-red-600" 
                />
              </div>

              <div className="mb-6">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="••••••••"
                />
                <ErrorMessage 
                  name="password" 
                  component="div" 
                  className="mt-1 text-sm text-red-600" 
                />
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex justify-center"
              >
                {(submitting || loading) ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  'Sign In'
                )}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 