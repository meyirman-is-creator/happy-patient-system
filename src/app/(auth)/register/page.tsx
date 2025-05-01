"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/useAuth";

interface ApiError {
  message?: string;
  [key: string]: unknown;
}

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
};


export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): { valid: boolean; message?: string } => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone
    ) {
      return {
        valid: false,
        message: "Пожалуйста, заполните все обязательные поля.",
      };
    }

    if (formData.password !== formData.confirmPassword) {
      return {
        valid: false,
        message: "Убедитесь, что оба пароля совпадают.",
      };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm();
    if (!validation.valid) {
      toast({
        title: "Ошибка валидации",
        description: validation.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Преобразуем formData в RegisterData
      const registerData: FormData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName:formData.lastName,
        phone: formData.phone,
        confirmPassword:formData.confirmPassword
      };

      await register.mutateAsync(registerData);
      toast({
        title: "Регистрация успешна",
        description: "Ваш аккаунт создан. Пожалуйста, войдите в систему.",
        variant: "success",
      });
      router.push("/login");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast({
        title: "Ошибка регистрации",
        description: apiError.message || "Произошла ошибка при регистрации.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-[#0A6EFF]/10 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#0A6EFF] flex items-center justify-center mb-4">
            <HeartPulse className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#243352]">
            Создание аккаунта
          </h2>
          <p className="text-[#243352]/70 text-sm">
            Заполните форму для регистрации в системе
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#243352] font-medium">
                Имя
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Иван"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] h-12 pl-4 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#243352] font-medium">
                Фамилия
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Петров"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] h-12 pl-4 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#243352] font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@mail.ru"
              value={formData.email}
              onChange={handleChange}
              required
              className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] h-12 pl-4 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[#243352] font-medium">
              Номер телефона
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone}
              onChange={handleChange}
              required
              className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] h-12 pl-4 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#243352] font-medium">
              Пароль
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] h-12 pl-4 pr-10 rounded-lg"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#243352]/60 hover:text-[#243352] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-[#243352] font-medium"
            >
              Подтвердите пароль
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] h-12 pl-4 rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white font-medium h-12 rounded-lg shadow-md transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Создание аккаунта..." : "Зарегистрироваться"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[#243352]/70">Уже есть аккаунт?</span>{" "}
          <Link
            href="/login"
            className="text-[#0A6EFF] font-medium hover:underline transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}

function HeartPulse(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}
