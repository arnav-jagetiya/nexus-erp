import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthLayout, BackendUnavailableNotice } from './AuthLayout';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await authApi.forgotPassword(data.email);
      setMessage(response);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Password Recovery"
      subtitle="Enter the email address associated with your NEXUS account to receive reset instructions."
      footerLinks={
        <div className="text-xs text-content-tertiary">
          Remembered your password?{' '}
          <Link to="/login" className="text-brand hover:text-brand-hover transition-colors font-medium">
            Sign In
          </Link>
        </div>
      }
    >
      {message && (
        <div className="p-4 rounded-lg bg-surface-tertiary border border-line-secondary text-sm text-content-primary text-center">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Work Email"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Send Recovery Link
        </Button>
      </form>
    </AuthLayout>
  );
}
