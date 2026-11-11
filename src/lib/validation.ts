import { z } from 'zod';

export const phoneRegex = /^[6-9]\d{9}$/;

export const vendorLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid business email address'),
  password: z.string().min(1, 'Password is required'),
});

export const vendorAccountSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().email('Enter a valid business email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const vendorBusinessInfoSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name is required'),
  ownerName: z.string().trim().min(2, 'Owner name is required'),
  phone: z.string().trim().regex(phoneRegex, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().trim().email('Enter a valid email address'),
  addressLine1: z.string().trim().min(3, 'Address Line 1 is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State / Province is required'),
  pincode: z.string().trim().min(5, 'Valid Pincode / ZIP is required'),
});

export function mapZodErrors<T>(
  schema: z.ZodType<T>,
  value: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const parsed = schema.safeParse(value);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join('.') || 'root';
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}

