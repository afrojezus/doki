import { Accordion, AccordionProps, createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
    root: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        borderRadius: theme.radius.sm,
    },

    item: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        border: '1px solid transparent',
        position: 'relative',
        zIndex: 0,
        transition: 'transform 150ms ease',

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        },

        '&[data-active]': {
            transform: 'scale(1.03)',
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
            boxShadow: theme.shadows.md,
            borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],
            borderRadius: theme.radius.md,
            zIndex: 1,
        },
    },

    chevron: {
        '&[data-rotate]': {
            transform: 'rotate(-90deg)',
        },
    },
}));

export const FilledAccordion = (props: AccordionProps<false>) => {
    const { classes } = useStyles();
    return <Accordion {...props} mx="auto"
        sx={{ minWidth: "100%" }}
        variant="filled"
        classNames={classes}
        className={classes.root}>
        {props.children}
    </Accordion>;
};
export default FilledAccordion;