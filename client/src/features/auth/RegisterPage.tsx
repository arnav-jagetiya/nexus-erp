import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthLayout, AuthErrorAlert } from './AuthLayout';
import { cn } from '../../utils/cn';

// Multi-step form schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  requestedRole: z.enum(['SALES', 'WAREHOUSE', 'ACCOUNTS', 'ADMIN'], {
    message: 'Please select a role',
  }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLES = [
  {
    id: 'SALES',
    title: 'Sales',
    description: 'Customer relationships, follow-ups and sales challans.',
  },
  {
    id: 'WAREHOUSE',
    title: 'Warehouse',
    description: 'Inventory, stock movements and product availability.',
  },
  {
    id: 'ACCOUNTS',
    title: 'Accounts',
    description: 'Transactions, confirmed challans and audit visibility.',
  },
  {
    id: 'ADMIN',
    title: 'Administrator',
    description: 'System-wide management and user administration.',
    requiresApproval: true,
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const selectedRole = watch('requestedRole');
  const watchedFields = watch();

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['name', 'email']);
    } else if (step === 2) {
      isValid = await trigger(['requestedRole']);
    } else if (step === 3) {
      isValid = await trigger(['password', 'confirmPassword']);
    }

    if (isValid) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      
      if ('status' in response && response.status === 'PENDING') {
        // Admin requested - no JWT
        setPendingApproval(true);
      } else if ('token' in response) {
        // Normal role - got JWT
        login(response.token, response.user);
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingApproval) {
    return (
      <AuthLayout
        title="Access Request Submitted"
        subtitle="Your Administrator access request is awaiting approval."
        footerLinks={<></>}
      >
        <div className="flex flex-col items-center justify-center p-6 text-center bg-surface-tertiary rounded-lg border border-line-secondary">
          <ShieldAlert className="w-12 h-12 text-brand mb-4" />
          <h3 className="text-sm font-semibold text-content-primary mb-2">Approval Required</h3>
          <p className="text-xs text-content-secondary mb-6">
            Your account has been created, but Administrator privileges require authorization from an existing admin. You will be able to log in once approved.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Return to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Request Access"
      subtitle={
        step === 1 ? 'Step 1: Identity' :
        step === 2 ? 'Step 2: Select Role' :
        step === 3 ? 'Step 3: Security' :
        'Step 4: Review'
      }
      footerLinks={
        <div className="text-xs text-content-tertiary">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:text-brand-hover transition-colors font-medium">
            Sign In
          </Link>
        </div>
      }
    >
      {error && <AuthErrorAlert message={error} />}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              autoComplete="name"
              {...register('name')}
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="you@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />
          </div>
        )}

        {/* Step 2: Role */}
        {step === 2 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setValue('requestedRole', role.id as any, { shouldValidate: true })}
                  className={cn(
                    "relative p-4 rounded-lg border cursor-pointer transition-all duration-200 group flex flex-col gap-1",
                    selectedRole === role.id 
                      ? "border-brand bg-brand/5 shadow-spatial-glow" 
                      : "border-line-secondary bg-surface-primary hover:border-line-primary hover:bg-surface-secondary hover:shadow-spatial-low"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "font-semibold text-sm transition-colors",
                      selectedRole === role.id ? "text-brand" : "text-content-primary"
                    )}>
                      {role.title}
                    </span>
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      selectedRole === role.id ? "border-brand bg-brand" : "border-line-primary bg-transparent"
                    )}>
                      {selectedRole === role.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-content-secondary leading-relaxed pr-6">
                    {role.description}
                  </p>
                  {role.requiresApproval && (
                    <div className="mt-2 flex items-start gap-1.5 text-[10px] font-medium text-brand/80 bg-brand/10 p-2 rounded">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>Administrator access requires approval from an existing administrator.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.requestedRole && (
              <p className="text-xs text-red-500 mt-1">{errors.requestedRole.message}</p>
            )}
          </div>
        )}

        {/* Step 3: Security */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-content-primary transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              helperText={!errors.password ? 'Uppercase, lowercase, number, special character' : undefined}
              autoComplete="new-password"
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:text-content-primary transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 rounded-lg bg-surface-secondary border border-line-secondary flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider mb-0.5">Name</p>
                <p className="text-sm font-medium text-content-primary">{watchedFields.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-sm font-medium text-content-primary">{watchedFields.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-content-tertiary uppercase tracking-wider mb-0.5">Requested Role</p>
                <p className="text-sm font-medium text-brand">{watchedFields.requestedRole}</p>
              </div>
            </div>

            {watchedFields.requestedRole === 'ADMIN' && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-brand/10 border border-brand/20 text-brand">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">
                  You are requesting Administrator access. This request will be placed in a pending state until approved by an existing admin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line-primary">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          )}
          
          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Registration
            </Button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
