import type { FileTreeItem, PackageJsonConfig, ProjectConfig } from "../../types/index.js";
import { getVersion } from "../../config/version-registry.js";

export async function getFormsIntegration(config: ProjectConfig): Promise<{
  pkg: Partial<PackageJsonConfig>;
  files: FileTreeItem[];
}> {
  const isTs = config.language === "typescript";
  const ext = isTs ? "ts" : "js";
  const compExt = isTs ? "tsx" : "jsx";

  const vOpts = {
    preset: config.preset,
    overrides: config.packageOverrides,
    fetchLatest: config.fetchLatest,
  };

  const rhfVer = await getVersion("react-hook-form", vOpts);
  const zodVer = await getVersion("zod", vOpts);
  const resolverVer = await getVersion("@hookform/resolvers", vOpts);

  const pkg: Partial<PackageJsonConfig> = {
    dependencies: {
      "react-hook-form": rhfVer,
      zod: zodVer,
      "@hookform/resolvers": resolverVer,
    },
  };

  const schemaContent = isTs
    ? `import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
`
    : `import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
`;

  const formComponentContent = isTs
    ? `"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from './loginSchema';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm w-full">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
        <input
          type="email"
          {...register('email')}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="admin@devblueprint.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="password"
          {...register('password')}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
`
    : `"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from './loginSchema';

export const LoginForm = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm w-full">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
        <input
          type="email"
          {...register('email')}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="admin@devblueprint.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="password"
          {...register('password')}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
`;

  const files: FileTreeItem[] = [
    {
      path: `src/components/auth/loginSchema.${ext}`,
      content: schemaContent,
    },
    {
      path: `src/components/auth/login-form.${compExt}`,
      content: formComponentContent,
    },
  ];

  return { pkg, files };
}
