import React from "react"
import {Typography} from "@mui/material"
import {useHistory} from "react-router-dom"

const Special = () => {
    const history = useHistory()
    React.useEffect(() => {
        setTimeout(() => {
            if (history.location.pathname.startsWith("/special"))
                history.push("/")
        }, 30000)
    }, [])
    return (
        <>
            <Typography variant="h1" style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontWeight: 700,
                position: "absolute",
                fontSize: "1em",
                opacity: 0,
                animation: "fuck ease 30s"
            }}>o.o</Typography>
        </>
    )
}

export default Special