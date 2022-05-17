import {ColorScheme, MantineColor, MantineProvider} from '@mantine/core';
import {NotificationsProvider} from '@mantine/notifications';
import {AppProps} from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import '../styles.css'
import {GetServerSidePropsContext} from 'next';
import {getCookie} from 'cookies-next';
import {useEffect, useState} from 'react';
import {useColorScheme} from "@mantine/hooks";
import {NextIntlProvider} from "next-intl";

NProgress.configure({showSpinner: false});

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function App(props: AppProps & { colorScheme: ColorScheme, accentColor: MantineColor, locale: string }) {
    const {Component, pageProps} = props;

    const preferredColorScheme = useColorScheme();

    const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme ?? preferredColorScheme);
    const [accentColor, setAccentColor] = useState<MantineColor>(props.accentColor);
    const [locale, setLocale] = useState<string>(props.locale);

    useEffect(() => {
        if (props.accentColor !== accentColor) setAccentColor(props.accentColor);
        if (props.colorScheme !== colorScheme) setColorScheme(props.colorScheme);
        if (props.locale !== locale) setLocale(props.locale);
    }, [props.accentColor, props.colorScheme, props.locale]);

    return (
        <>
            <Head>
                <title>Doki</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>

            <NextIntlProvider messages={pageProps.messages}>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme: colorScheme,
                    primaryColor: accentColor
                }}
            >
                <NotificationsProvider>
                    <Component {...pageProps} />
                </NotificationsProvider>
            </MantineProvider>
            </NextIntlProvider>
        </>
    );
}

App.getInitialProps = ({ctx}: { ctx: GetServerSidePropsContext }) => ({
    colorScheme: getCookie("color-scheme", ctx) || null,
    accentColor: getCookie("accent-color", ctx) || 'blue',
    locale: getCookie("locale", ctx) || "en"
});