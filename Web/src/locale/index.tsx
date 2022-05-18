import {createContext} from "react";
import en from "./en.json";
import no from "./no.json";
import ru from "./ru.json";
import ua from "./ua.json";
import de from "./de.json";
import cn from "./cn.json";
import fr from "./fr.json";
import jp from "./jp.json";

export const messages = {en, no, ru, ua, de, cn, fr, jp};

export function getLocale(ctx: {locale: string, messages: any}) {
    return ctx.messages[ctx.locale];
}

export const LocaleContext = createContext({locale: "en", messages});