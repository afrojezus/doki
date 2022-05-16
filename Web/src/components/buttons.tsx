import {ActionIcon, ActionIconProps, Button, ButtonProps} from "@mantine/core";
import Link from "next/link";

export function LinkAction({href, children, ...props}: ActionIconProps<'button'> & { href: string }) {
    return <Link href={href} passHref>
        <ActionIcon component="a" {...props}>{children}</ActionIcon>
    </Link>
}

export function LinkButton({href, ...props}: ButtonProps<'button'> & { href: string }) {
    return <Link href={href} passHref>
        <Button component="a" {...props}></Button>
    </Link>
}