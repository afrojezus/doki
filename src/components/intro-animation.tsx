import { Paper, Title } from "@mantine/core";

export function IntroAnimation({show, styles}) {

    return <Paper id="intro" style={styles} sx={{
        width: "100%",
        height: "100vh",
        zIndex: 10000000,
        position: "fixed",
        display: "flex",
        pointerEvents: "none",
        transition: "all 8s var(--animation-ease)",
        opacity: show ? 1 : 0
    }}>
        <Title className="use-m-font special-vfx-intro" m="auto">doki</Title>
    </Paper>
}