    import { z } from 'zod';

    export const registerSchema = z.object({
    email:    z.string().email('Must be a valid email address').transform(v => v.toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password must be 72 characters or fewer'),
    role:     z.enum(['admin','recruiter', 'applicant'], { errorMap: () => ({ message: 'Invalid role' }) }),
    });

    export const loginSchema = z.object({
    email:    z.string().email('Must be a valid email address').transform(v => v.toLowerCase()),
    password: z.string().min(1, 'Password is required').max(1000, 'Password too long'),
    });
    export const refreshSchema = z.object({
    refreshToken: z.string().min(1),
    });

    export const logoutSchema = z.object({
    refreshToken: z.string().min(1),
    });

    export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp:   z.string().length(6).regex(/^\d{6}$/),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

    export type RegisterInput = z.infer<typeof registerSchema>;
    export type LoginInput    = z.infer<typeof loginSchema>;