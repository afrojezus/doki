import {useState, useCallback, useEffect} from "react"
import { Theme, Tooltip } from "@mui/material"
import { withStyles } from "@mui/styles"
import { AuthorModel, FileModel } from "./models"

export const mediaExt = [
    "WEBM", "MP4", "MOV", "M4A", "AVI", "MP3", "WAV", "AAC", "OGG", "FLAC"
]
export const audioExt = [
    "MP3", "WAV", "AAC", "OGG", "FLAC"
]
export const imgExt = [
    "JPG", "BMP", "GIF", "PNG", "JPEG", "WEBP"
]
export const viewable = [...imgExt, ...mediaExt]
export const checkFile = (extArray: Array<string>, file: FileModel | null) => file ? extArray.includes(file.fileURL.split(".")[file.fileURL.split(".").length - 1].toUpperCase()) : false

export const truncate = (str: string, len: number = 10) => str.length > len ? str.substring(0, len) + "..." : str

export const displayFilename = (str: string) => str.split(".")[0].replace("files/", "").replaceAll("-", " ").replaceAll(".", " ").replaceAll("_", " ").replaceAll("(", " (").replaceAll(")", ") ")

export const retrieveAuthorInfo = async (id: number): Promise<AuthorModel> => {
    try {
        const res = await fetch(`api/names/${id}`)
        const json = await res.json() as AuthorModel
        return json
    } catch (error) {
        console.error(error)
        return { name: "Anonymous", creationDate: 0, authorId: "0" }
    }
}

export const LightTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: theme.palette.common.white,
        color: "rgba(0, 0, 0, 0.87)",
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
}))(Tooltip)

export const readURL = (file: File) => new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = e => res((e.target as any).result)
        reader.onerror = e => rej(e)
        reader.readAsText(file)
    })

const shadowKeyUmbraOpacity = 0.2
const shadowKeyPenumbraOpacity = 0.14
const shadowAmbientShadowOpacity = 0.12

export function createShadow(...px: number[]) {
    return [
        `${px[0] + 4}px ${px[1] + 2}px 0px rgba(0,0,0,${shadowKeyUmbraOpacity})`,
        `${px[4] + 2}px ${px[5] + 2}px 0px rgba(0,0,0,${shadowKeyPenumbraOpacity})`,
        `${px[8]}px ${px[9]}px 0px rgba(0,0,0,${shadowAmbientShadowOpacity})`,
    ].join(",")
}