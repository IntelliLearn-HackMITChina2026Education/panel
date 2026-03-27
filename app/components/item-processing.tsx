import {Item, ItemActions, ItemContent, ItemDescription, ItemTitle} from "~/components/ui/item";
import {Badge} from "~/components/ui/badge";
import {Spinner} from "~/components/ui/spinner";
import {Button} from "./ui/button";
import {useNavigate} from "react-router";

export default function ProcessingItem({name, desc, stat, link}: {
    name: string;
    desc?: string,
    stat: "processing" | "pending"
    link?: string
}) {
    const navigate = useNavigate();
    return (
        <Item className="w-full" variant="outline">
            {link != null ? <ItemActions>
                <Button variant="outline" size="sm" onClick={() => navigate(link)}>
                    查看
                </Button>
            </ItemActions> : null}
            <ItemContent>
                <ItemTitle>
                    <div className="flex flex-wrap gap-2">
                        {name}
                        <Badge
                            className={stat == "processing" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"}>
                            {stat == "processing" ? <Spinner data-icon="inline-end"/> : null}
                            {stat == "processing" ? "处理中" : "等待中"}
                        </Badge>
                    </div>
                </ItemTitle>
                {desc != null ? <ItemDescription>
                    {desc}
                </ItemDescription> : null}
            </ItemContent>
        </Item>
    );
}