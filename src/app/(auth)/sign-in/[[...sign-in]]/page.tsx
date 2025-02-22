// Start of Selection
"use client"

import * as Clerk from "@clerk/elements/common"
import * as SignIn from "@clerk/elements/sign-in"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Logo from "~/images/logo.jpg"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white p-6">
      <Card className="w-full max-w-md shadow-xl rounded-lg">
        <CardHeader className="space-y-4 text-center p-6">
          <div className="w-full flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <Image
                src={Logo}
                alt="LeadBee Logo"
                width={128}
                height={128}
                className="object-contain rounded-md"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-800">
            LeadBee Админка
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <SignIn.Root>
            <SignIn.Step name="start">
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-center text-gray-700">
                  Войдите в аккаунт
                </h1>
                <Clerk.Field name="identifier">
                  <Clerk.Label className="block text-sm font-medium text-gray-700 mb-2">
                    Электронная почта или имя пользователя
                  </Clerk.Label>
                  <Clerk.Input
                    className="bg-white border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-150"
                    placeholder="Введите почту или имя пользователя"
                  />
                  <Clerk.FieldError className="text-red-500 text-xs mt-1" />
                </Clerk.Field>
                <SignIn.Action submit className="w-full">
                  <Button
                    type="submit"
                    className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-150 rounded-lg py-2"
                  >
                    Продолжить
                  </Button>
                </SignIn.Action>
              </div>
            </SignIn.Step>

            <SignIn.Step name="verifications">
              <SignIn.Strategy name="email_code">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-center text-gray-700">
                    Проверьте почту
                  </h1>
                  <p className="text-center text-sm text-gray-600">
                    Мы отправили код на <SignIn.SafeIdentifier />.
                  </p>
                  <Clerk.Field name="code">
                    <Clerk.Label className="block text-sm font-medium text-gray-700 mb-2">
                      Код из письма
                    </Clerk.Label>
                    <Clerk.Input
                      className="bg-white border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-150"
                      placeholder="Введите код"
                    />
                    <Clerk.FieldError className="text-red-500 text-xs mt-1" />
                  </Clerk.Field>
                  <div className="flex flex-col gap-2">
                    <SignIn.Action submit className="w-full">
                      <Button
                        type="submit"
                        className="block  bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-150 rounded-lg py-2"
                      >
                        Продолжить
                      </Button>
                    </SignIn.Action>
                    <SignIn.Action navigate="start">
                      <Button
                        type="button"
                        className="block w-full border border-yellow-500 bg-white text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-150 rounded-lg py-2"
                      >
                        Изменить логин
                      </Button>
                    </SignIn.Action>
                  </div>
                </div>
              </SignIn.Strategy>

              <SignIn.Strategy name="password">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-center text-gray-700">
                    Введите пароль
                  </h1>
                  <Clerk.Field name="password">
                    <Clerk.Label className="block text-sm font-medium text-gray-700 mb-2">
                      Пароль
                    </Clerk.Label>
                    <Clerk.Input
                      type="password"
                      className="bg-white border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-150"
                      placeholder="Введите пароль"
                    />
                    <Clerk.FieldError className="text-red-500 text-xs mt-1" />
                  </Clerk.Field>
                  <div className="flex flex-col gap-2">
                    <SignIn.Action submit className="w-full">
                      <Button
                        type="submit"
                        className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-150 rounded-lg py-2"
                      >
                        Продолжить
                      </Button>
                    </SignIn.Action>
                    <SignIn.Action navigate="forgot-password" className="w-full">
                      <Button
                        type="button"
                        className="block w-full border border-yellow-500 bg-white text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-150 rounded-lg py-2"
                      >
                        Забыли пароль?
                      </Button>
                    </SignIn.Action>
                    <SignIn.Action navigate="start" className="w-full">
                      <Button
                        type="button"
                        className="block w-full border border-yellow-500 bg-white text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-150 rounded-lg py-2"
                      >
                        Изменить логин
                      </Button>
                    </SignIn.Action>
                  </div>
                </div>
              </SignIn.Strategy>

              <SignIn.Strategy name="reset_password_email_code">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-center text-gray-700">
                    Проверьте почту
                  </h1>
                  <p className="text-center text-sm text-gray-600">
                    Мы отправили код на <SignIn.SafeIdentifier />.
                  </p>
                  <Clerk.Field name="code">
                    <Clerk.Label className="block text-sm font-medium text-gray-700 mb-2">
                      Код из письма
                    </Clerk.Label>
                    <Clerk.Input
                      className="bg-white border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-150"
                      placeholder="Введите код"
                    />
                    <Clerk.FieldError className="text-red-500 text-xs mt-1" />
                  </Clerk.Field>
                  <div className="flex flex-col gap-2">
                    <SignIn.Action submit className="w-full">
                      <Button
                        type="submit"
                        className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-150 rounded-lg py-2"
                      >
                        Продолжить
                      </Button>
                    </SignIn.Action>
                    <SignIn.Action navigate="start" className="w-full">
                      <Button
                        type="button"
                        className="block w-full border border-yellow-500 bg-white text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-150 rounded-lg py-2"
                      >
                        Изменить логин
                      </Button>
                    </SignIn.Action>
                  </div>
                </div>
              </SignIn.Strategy>
            </SignIn.Step>

            <SignIn.Step name="forgot-password">
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-center text-gray-700">
                  Забыли пароль?
                </h1>
                <div className="flex flex-col gap-2">
                  <SignIn.SupportedStrategy name="reset_password_email_code">
                    <Button
                      type="button"
                      className="block w-full border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-150 rounded-lg py-2"
                    >
                      Сбросить пароль
                    </Button>
                  </SignIn.SupportedStrategy>
                  <SignIn.Action navigate="previous">
                    <Button
                      type="button"
                      className="block w-full border border-yellow-500 bg-white text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-150 rounded-lg py-2"
                    >
                      Назад
                    </Button>
                  </SignIn.Action>
                  <SignIn.Action navigate="start">
                    <Button
                      type="button"
                      className="block w-full border border-yellow-500 bg-white text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-150 rounded-lg py-2"
                    >
                      Изменить логин
                    </Button>
                  </SignIn.Action>
                </div>
              </div>
            </SignIn.Step>

            <SignIn.Step name="reset-password">
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-center text-gray-700">
                  Сброс пароля
                </h1>
                <Clerk.Field name="password">
                  <Clerk.Label className="block text-sm font-medium text-gray-700 mb-2">
                    Новый пароль
                  </Clerk.Label>
                  <Clerk.Input
                    type="password"
                    className="bg-white border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-150"
                    placeholder="Введите новый пароль"
                  />
                  <Clerk.FieldError className="text-red-500 text-xs mt-1" />
                </Clerk.Field>
                <Clerk.Field name="confirmPassword">
                  <Clerk.Label className="block text-sm font-medium text-gray-700 mb-2">
                    Подтвердите пароль
                  </Clerk.Label>
                  <Clerk.Input
                    type="password"
                    className="bg-white border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-150"
                    placeholder="Подтвердите новый пароль"
                  />
                  <Clerk.FieldError className="text-red-500 text-xs mt-1" />
                </Clerk.Field>
                <div className="flex flex-col gap-2">
                  <SignIn.Action submit className="w-full"  >
                    <Button
                      type="submit"
                      className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-150 rounded-lg py-2"
                    >
                      Сбросить пароль
                    </Button>
                  </SignIn.Action>
                  <SignIn.Action navigate="start" className="w-full">
                    <Button
                      type="button"
                      className="block w-full border border-yellow-500 bg-white text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-150 rounded-lg py-2"
                    >
                      Изменить логин
                    </Button>
                  </SignIn.Action>
                </div>
              </div>
            </SignIn.Step>
          </SignIn.Root>
        </CardContent>
      </Card>
    </div>
  )
}
