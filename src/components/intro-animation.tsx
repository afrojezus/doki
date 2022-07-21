import { Box, Paper, Title } from "@mantine/core";
import clsx from "clsx";
import { useEffect, useState } from "react";

export function IntroAnimation({show, styles}) {

    return <Paper style={styles} sx={{
        width: "100%",
        height: "100vh",
        zIndex: 10000000,
        position: "fixed",
        display: "flex",
        pointerEvents: "none",
        transition: "all 8s var(--animation-ease)",
        opacity: show ? 1 : 0
    }}>
        <Title className={clsx("use-m-font special-vfx-intro")} m="auto">doki</Title>
    </Paper>
}