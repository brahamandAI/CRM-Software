import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const Register = () => {
  const { register, isAuthenticated, loading, error, clearErrors } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = values;
    await register(userData);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Brahamand CRM</h1>
          <p className="text-gray-500 mt-2">Create a new account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '' 
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <Field
                  type="text"
                  name="name"
                  id="name"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="John Doe"
                />
                <ErrorMessage 
                  name="name" 
                  component="div" 
                  className="mt-1 text-sm text-red-600" 
                />
              </div>

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

              <div className="mb-4">
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

              <div className="mb-6">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="••••••••"
                />
                <ErrorMessage 
                  name="confirmPassword" 
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
                  'Register'
                )}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 