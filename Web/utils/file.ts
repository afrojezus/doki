import {File} from "@server/models";

export const videoFormats = [
    "MOV", "WEBM", "MP4", "AVI", "MKV",
];

export const audioFormats = [
    "WAV", "MP3", "OGG", "FLAC", "M4A"
];

export const pictureFormats = [
    "PNG", "JPEG", "JFIF", "GIF", "APNG", "WEBP", "JPG"
];

export const playableFormats = [...videoFormats, ...audioFormats];

export function getExt(file: string) {
    return file.split(".")[file.split(".").length - 1].toUpperCase();
}

export function displayFilename(file: File): string {
    if (file.Title) return file.Title;
    return file.FileURL.split("/")[file.FileURL.split("/").length - 1];
}

export function onlyGetMedia(files: File[]) {
    return files.filter(x => [...playableFormats].includes(getExt(x.FileURL)));
}

export function onlyGetVideo(files: File[]) {
    return files.filter(x => [...videoFormats].includes(getExt(x.FileURL)));
}

export function random(files: File[], filter: (files: File[]) => File[]) {
    return filter(files)[~~(Math.random() * filter(files).length)];
}