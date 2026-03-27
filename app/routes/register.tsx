import {Button} from "~/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "~/components/ui/field";
import {Input} from "~/components/ui/input";
import React, {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {registerService} from "~/services/register-service";
import {useLoaderData, useNavigate} from "react-router";
import type {Route} from "../../.react-router/types/app/routes/+types/register";
import {toast} from "sonner";
import {PasswordInput} from "~/components/ui/password-input";

export async function clientLoader({params}: Route.ClientLoaderArgs) {
    return registerService.isEnabled();
}

export default function Register() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const re = useLoaderData<typeof clientLoader>();

    useEffect(() => {
        if (!re) {
            toast.error(t('register.disabled_error'));
            navigate("/login", {replace: true});
        }
    }, [re, navigate, t]);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('register.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">{t('register.name')}</FieldLabel>
                                <Input id="name" type="text" autoComplete="name" required/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">{t('register.email')}</FieldLabel>
                                <Input id="email" type="email" autoComplete="email" required/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="phone">{t('register.phone')}</FieldLabel>
                                <Input id="phone" type="tel" autoComplete="tel-national" required/>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">{t('register.password')}</FieldLabel>
                                <PasswordInput id="password" type="password" autoComplete="new-password" required/>
                                <FieldDescription>{t('register.password_hint')}</FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm-password">{t('register.confirm_password')}</FieldLabel>
                                <PasswordInput id="confirm-password" type="password" required/>
                            </Field>
                            <FieldGroup>
                                <Field>
                                    <Button type="submit">{t('register.button')}</Button>
                                    <FieldDescription className="px-6 text-center">
                                        {t('register.have_account', {
                                            link: <a href="/login">{t('register.login_link')}</a>,
                                        })}
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