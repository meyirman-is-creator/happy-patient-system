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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка данных
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone
    ) {
      toast({
        title: "Отсутствует информация",
        description: "Пожалуйста, заполните все обязательные поля.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Пароли не совпадают",
        description: "Убедитесь, что оба пароля совпадают.",
        variant: "destructive",
      });
      return;
    }

    try {
      await register.mutateAsync(formData);
      toast({
        title: "Регистрация успешна",
        description: "Ваш аккаунт создан. Пожалуйста, войдите в систему.",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Произошла ошибка при регистрации.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-[#0A6EFF]/10">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#0A6EFF] flex items-center justify-center mb-4">
          <HeartPulse className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-1 text-[#243352]">
          Создание аккаунта
        </h2>
        <p className="text-[#243352]/70 text-sm">
          Заполните форму для регистрации в системе
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
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
              className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
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
              className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
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
            className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
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
            className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
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
              className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-[#243352]/60" />
              ) : (
                <Eye className="h-5 w-5 text-[#243352]/60" />
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
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white"
          disabled={register.isLoading}
        >
          {register.isLoading ? "Создание аккаунта..." : "Зарегистрироваться"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="text-[#0A6EFF] font-medium hover:underline"
        >
          Войти
        </Link>
      </div>
    </div>
  );
}

function HeartPulse(props: { className?: string }) {
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
