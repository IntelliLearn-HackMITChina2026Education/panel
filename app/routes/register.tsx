import {Button} from "~/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle,} from "~/components/ui/card";
import {Field, FieldDescription, FieldGroup, FieldLabel,} from "~/components/ui/field";
import {Input} from "~/components/ui/input";
import React, {useEffect} from "react";
import {registerService} from "~/services/register-service";
import {useLoaderData, useNavigate} from "react-router";
import type {Route} from "../../.react-router/types/app/routes/+types/register";
import {toast} from "sonner";
import {PasswordInput} from "~/components/ui/password-input";

export async function clientLoader({params}: Route.ClientLoaderArgs) {
    return registerService.isEnabled();
}

export default function Register() {

    const navigate = useNavigate();
    const re = useLoaderData<typeof clientLoader>();

    useEffect(() => {
        if (!re) {
            toast.error("注册服务未启用。联系学校管理员获取更多信息。");
            navigate("/login", {replace: true});
        }
    }, [re, navigate]);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>注册账户</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">名字</FieldLabel>
                                <Input id="name" type="text" autoComplete="name" required/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">电子邮件</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="hone">手机号码</FieldLabel>
                                <Input
                                    id="phone"
                                    type="phone"
                                    autoComplete="tel-national"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">密码</FieldLabel>
                                <PasswordInput id="password" type="password" autoComplete="new-password" required/>
                                <FieldDescription>
                                    至少八个字符长。
                                </FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm-password">
                                    确认密码
                                </FieldLabel>
                                <PasswordInput id="confirm-password" type="password" required/>
                            </Field>
                            <FieldGroup>
                                <Field>
                                    <Button type="submit">注册</Button>
                                    <FieldDescription className="px-6 text-center">
                                        已经有账户? <a href="/login">登录</a>
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}