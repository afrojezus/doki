import { ActionIcon, Button, Card, CardProps } from "@mantine/core";
import Link from "next/link";

// defining types to these components are a pain in the ass.
export function LinkAction({ href, children, ...props }: any) {
    return <Link href={href} passHref>
        <ActionIcon component="a" {...props}>{children}</ActionIcon>
    </Link>;
}

export function LinkButton({ href, ...props }: any) {
    return <Link href={href} passHref>
        <Button component="a" {...props}></Button>
    </Link>;
}

interface Common {
    link: string;
    onClick: () => void;
}

// Wrappers for common elements in need of middle-mouse click functionality
export function TouchableCard({ children, link, onClick, ...props }: CardProps & Common) {
    const auxClick = () => (event: MouseEvent) => {
        event.preventDefault();
        window.open(link);
    };

    return <Card
        component="a"
        onClick={onClick}
        onAuxClick={auxClick}
        {...props}
    >{children}</Card>;
}