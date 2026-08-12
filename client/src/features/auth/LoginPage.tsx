import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthLayout, AuthErrorAlert } from './AuthLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      login(response.token, response.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login failed:', err);
      const apiErrorMessage =
        err.response?.data?.error?.message || 'Failed to authenticate. Please verify credentials.';
      setError(apiErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your NEXUS workspace with authorized credentials."
      footerLinks={
        <div className="flex flex-col gap-2">
          <div>
            <Link to="/forgot-password" className="text-brand hover:text-brand-hover transition-colors text-xs font-medium">
              Forgot your password?
            </Link>
          </div>
          <div className="text-xs text-content-tertiary">
            Need an account?{' '}
            <Link to="/register" className="text-brand hover:text-brand-hover transition-colors font-medium">
              Request access
            </Link>
          </div>
        </div>
      }
    >
      {error && <AuthErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Work Email"
          type="email"
          placeholder="user@nexus.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-content-primary transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          }
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-2"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
}
