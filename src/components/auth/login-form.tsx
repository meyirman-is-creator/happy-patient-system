// src/components/auth/login-form.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login({
        username: values.username,
        password: values.password,
      });

      // Redirect based on user role
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-gray-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-[#273441]">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-[#51657A]">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#273441]">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      className="border-gray-300 focus:border-[#007CFF] focus:ring-[#007CFF]"
                      {...field}
                      onChange={(e) => {
                        clearError();
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-[#EF4444]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#273441]">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="border-gray-300 focus:border-[#007CFF] focus:ring-[#007CFF]"
                        {...field}
                        onChange={(e) => {
                          clearError();
                          field.onChange(e);
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[#EF4444]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-[#007CFF] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#007CFF] hover:bg-[#0070E6] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-[#51657A]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#007CFF] hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}