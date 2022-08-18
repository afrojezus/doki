import { ActionIcon, Button, Card, CardProps } from "@mantine/core";
import Link from "next/link";
import { MouseEventHandler } from "react";

// defining types to these components are a pain in the ass.
export function LinkAction({ href, children, ...props }: any) {
    return <Link href={href} passHref>
        <ActionIcon component="a" {...props}>{children}</ActionIcon>
    </Link>;
}

export function LinkButton({ href, ...props }: any) {
    return <TouchableLink link={href}>
        <Button component="a" {...props}></Button>
    </TouchableLink>;
}

interface Common {
    link: string;
    onClick: () => void;
}

// Wrappers for common elements in need of middle-mouse click functionality
export function TouchableCard({ children, link, onClick, ...props }: CardProps & Common) {
    const handleOnClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        return onClick();
    };
    return <Card
        component="a"
        href={link}
        onClick={handleOnClick}
        {...props}
    >{children}</Card>;
}

export const TouchableLink = ({ children, link, ...rest }) => {
    const handleOnClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
    };
    return <a href={link} onClick={handleOnClick}><Link href={link} passHref {...rest}>{children}</Link></a>;
};
