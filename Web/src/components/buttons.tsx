import {ActionIcon, Button} from "@mantine/core";
import Link from "next/link";

// defining types to these components are a pain in the ass.
export function LinkAction({href, children, ...props}: any) {
    return <Link href={href} passHref>
        <ActionIcon component="a" {...props}>{children}</ActionIcon>
    </Link>
}

export function LinkButton({href, ...props}: any) {
    return <Link href={href} passHref>
        <Button component="a" {...props}></Button>
    </Link>
}