import {Box, CloseButton, MultiSelectValueProps, SelectItemProps} from "@mantine/core";
import {forwardRef} from "react";

export function Value({
                   value,
                   label,
                   onRemove,
                   classNames,
                   ...others
               }: MultiSelectValueProps & { value: string }) {
    return (
        <div {...others}>
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    cursor: 'default',
                    alignItems: 'center',
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                    border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[4]}`,
                    paddingLeft: 10,
                    borderRadius: 4,
                })}
            >
                <Box sx={{ lineHeight: 1, fontSize: 12 }}>{label}</Box>
                <CloseButton
                    onMouseDown={onRemove}
                    variant="transparent"
                    size={22}
                    iconSize={14}
                    tabIndex={-1}
                />
            </Box>
        </div>
    );
}

export const Item = forwardRef<HTMLDivElement, SelectItemProps>(({ label, value, ...others }, ref) => {
    return (
        <div ref={ref} {...others}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <div>{label}</div>
            </Box>
        </div>
    );
});

