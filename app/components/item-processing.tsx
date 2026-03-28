import {Item, ItemActions, ItemContent, ItemDescription, ItemTitle} from "~/components/ui/item";
import {Badge} from "~/components/ui/badge";
import {Spinner} from "~/components/ui/spinner";
import {Button} from "./ui/button";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";

export default function ProcessingItem({
                                           name,
                                           desc,
                                           stat,
                                           link,
                                       }: {
    name: string;
    desc?: string;
    stat: "processing" | "pending" | "completed" | "failed";
    link?: string;
}) {

    if (stat == "completed" || stat === "failed") return null;

    const {t} = useTranslation();
    const navigate = useNavigate();

    const statusText = stat === "processing" ? t('processing.status_processing') : t('processing.status_pending');
    const statusClass =
        stat === "processing"
            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300";

    return (
        <Item className="w-full" variant="outline">
            {link != null && (
                <ItemActions>
                    <Button variant="outline" size="sm" onClick={() => navigate(link)}>
                        {t('processing.view')}
                    </Button>
                </ItemActions>
            )}
            <ItemContent>
                <ItemTitle>
                    <div className="flex flex-wrap gap-2">
                        {name}
                        <Badge className={statusClass}>
                            {stat === "processing" && <Spinner data-icon="inline-end"/>}
                            {statusText}
                        </Badge>
                    </div>
                </ItemTitle>
                {desc != null && <ItemDescription>{desc}</ItemDescription>}
            </ItemContent>
        </Item>
    );
}