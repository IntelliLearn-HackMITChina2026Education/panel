import {School} from "lucide-react";
import {useAuth} from "~/contexts/AuthContext";
import {useLoaderData, useLocation, useNavigate} from "react-router";
import {type FormEvent, useEffect, useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator,} from "~/components/ui/field";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";
import {Button} from "~/components/ui/button";
import {Input} from "~/components/ui/input";
import {toast} from "sonner";
import {registerService} from "~/services/register-service";
import type {Route} from "../../.react-router/types/app/routes/+types/register";

export async function clientLoader({params}: Route.ClientLoaderArgs) {
    return registerService.isEnabled();
}

export default function LoginPage() {
    const {t} = useTranslation();
    const {login} = useAuth();
    const registerEnabled = useLoaderData<typeof clientLoader>();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setError("");
        setLoading(true);
        try {
            await login({
                username: data.get("username") as string,
                password: data.get("password") as string,
            });
            navigate(from, {replace: true});
        } catch (err) {
            setError(err instanceof Error ? err.message : t('login.error_general'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (error) toast.error(`${t('login.error_prefix')}: ${error}`);
    }, [error, t]);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-10">
            <div className="flex max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div
                        className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <School className="size-4"/>
                    </div>
                    IntelliLearn
                </a>
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">{t('login.welcome_back')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button variant="outline" type="button" disabled className="w-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"
                                                         viewBox="0 0 48 48">
                                                        <path
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M10.175 27.53c.54.723 1.219.992 2.162.992h1.306c1.215 0 2.2-1.01 2.2-2.256v-.01c0-1.246-.985-2.256-2.2-2.256h-1.44C10.987 24 10 22.989 10 21.742h0c0-1.25.989-2.264 2.207-2.264h1.299c.943 0 1.622.27 2.162.991m14.032-.991c1.618 0 2.92 1.336 2.92 2.996v3.052c0 1.66-1.302 2.996-2.92 2.996h0c-1.62 0-2.922-1.336-2.922-2.996v-3.052c0-1.66 1.303-2.996 2.921-2.996M18.564 27.53c.54.723 1.219.992 2.162.992h1.306c1.215 0 2.2-1.01 2.2-2.256v-.01c0-1.246-.985-2.256-2.2-2.256h-1.44c-1.217 0-2.203-1.011-2.203-2.258h0c0-1.25.988-2.264 2.207-2.264h1.299c.943 0 1.621.27 2.162.991M35.003 24h2.996m-1.498-1.526v3.052"
                                                        />
                                                        <path
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9.5 5.5h29c2.216 0 4 1.784 4 4v29c0 2.216-1.784 4-4 4h-29c-2.216 0-4-1.784-4-4v-29c0-2.216 1.784-4 4-4"
                                                        />
                                                    </svg>
                                                    {t('login.sso')}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('login.sso_tooltip')}</TooltipContent>
                                        </Tooltip>
                                    </Field>
                                    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                        {t('login.or_use')}
                                    </FieldSeparator>
                                    <Field>
                                        <FieldLabel htmlFor="email">{t('login.username_or_email')}</FieldLabel>
                                        <Input id="username" name="username" autoComplete="username" required/>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password">{t('login.password')}</FieldLabel>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? t('login.button_loading') : t('login.button')}
                                        </Button>
                                        {registerEnabled ? (
                                            <FieldDescription
                                                className="text-center flex justify-between items-center p-4">
                                                <div>
                                                    {t('login.no_account')}{" "}
                                                    <a href="/register" className="underline">
                                                        {t('login.register_link')}
                                                    </a>
                                                </div>
                                                <a href="#">{t('login.forgot_password')}</a>
                                            </FieldDescription>
                                        ) : (
                                            <FieldDescription className="text-center">
                                                {t('login.registration_disabled')}{" "}
                                                <a href="#"
                                                   className="ml-auto text-sm underline-offset-4 hover:underline">
                                                    {t('login.forgot_password')}
                                                </a>
                                            </FieldDescription>
                                        )}
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                    <FieldDescription className="px-6 text-center">
                        <Trans
                            i18nKey="common.agree_terms"
                            components={{
                                termsLink: <a href="#" />,
                                privacyLink: <a href="#" />,
                            }}
                            values={{
                                terms: t('common.terms_of_service'),
                                privacy: t('common.privacy_policy'),
                            }}
                        />
                    </FieldDescription>
                </div>
            </div>
        </div>
    );
}