import React, { useState } from "react"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Theme,
} from "@mui/material"

import createStyles from "@mui/styles/createStyles"
import makeStyles from "@mui/styles/makeStyles"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            minWidth: 300,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
        heading: {
            marginBottom: theme.spacing(1)
        }
    }),
)


const Report = ({ open, close }: { open: boolean, close: () => void }) => {
    const classes = useStyles()
    const [reason, setReason] = useState("racism")
    const handleChange = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
        setReason(event.target.value as string)
    }
    return (
        <Dialog open={open} onClose={close}>
            <DialogTitle>Report this file</DialogTitle>
            <DialogContent>
                <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="color-label">What would you like to report this file for?</InputLabel>
                    <Select labelId="color-label" label="What would you like to report this file for?" value={reason}
                        onChange={handleChange}>
                        <MenuItem value={"racism"}>Racism</MenuItem>
                        <MenuItem value={"malware"}>Malware</MenuItem>
                        <MenuItem value={"bad"}>Bad file</MenuItem>
                        <MenuItem value={"illegal"}>Illegal content</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary">Send</Button>
            </DialogActions>
        </Dialog>
    )
}

export default Report