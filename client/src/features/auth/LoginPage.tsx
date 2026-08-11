import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();

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
      setError('Please provide both email and password');
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

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-brand flex items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-wider">NEXUS ERP</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-content-tertiary">
          <span>THEME:</span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-2 py-1 rounded border border-line-primary bg-surface-secondary hover:bg-surface-tertiary text-content-secondary transition-colors"
          >
            {theme.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-surface-secondary border border-line-primary rounded-lg p-8 shadow-md">
          {/* Card Header */}
          <div className="mb-6 text-center">
            <Badge variant="info" className="mb-2">
              Internal Access Portal
            </Badge>
            <h2 className="text-xl font-bold text-content-primary tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-content-secondary mt-1">
              Enter your corporate credentials to access the ERP/CRM system.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded bg-status-danger-bg border border-status-danger/30 text-status-danger text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="user@nexus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
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
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
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

          {/* Demo Account Quick-Fill */}
          <div className="mt-8 pt-6 border-t border-line-primary">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-content-tertiary mb-3 text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@nexus.com', 'Admin@123')}
                className="px-2.5 py-1.5 rounded border border-line-primary bg-surface-primary hover:bg-surface-tertiary text-left text-xs transition-colors"
              >
                <div className="font-semibold text-content-primary text-[11px]">Admin</div>
                <div className="text-[10px] font-mono text-content-tertiary">admin@nexus.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sales@nexus.com', 'Sales@123')}
                className="px-2.5 py-1.5 rounded border border-line-primary bg-surface-primary hover:bg-surface-tertiary text-left text-xs transition-colors"
              >
                <div className="font-semibold text-content-primary text-[11px]">Sales</div>
                <div className="text-[10px] font-mono text-content-tertiary">sales@nexus.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('warehouse@nexus.com', 'Warehouse@123')}
                className="px-2.5 py-1.5 rounded border border-line-primary bg-surface-primary hover:bg-surface-tertiary text-left text-xs transition-colors"
              >
                <div className="font-semibold text-content-primary text-[11px]">Warehouse</div>
                <div className="text-[10px] font-mono text-content-tertiary">warehouse@nexus.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('accounts@nexus.com', 'Accounts@123')}
                className="px-2.5 py-1.5 rounded border border-line-primary bg-surface-primary hover:bg-surface-tertiary text-left text-xs transition-colors"
              >
                <div className="font-semibold text-content-primary text-[11px]">Accounts</div>
                <div className="text-[10px] font-mono text-content-tertiary">accounts@nexus.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-mono text-content-tertiary max-w-6xl w-full mx-auto">
        NEXUS ERP &copy; 2026 &mdash; Built by Arnav Jagetiya
      </div>
    </div>
  );
}
