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

NProgress.configure({showSpinner: false});

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function App(props: AppProps & { colorScheme: ColorScheme, accentColor: MantineColor }) {
    const {Component, pageProps} = props;

    const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);
    const [accentColor, setAccentColor] = useState<MantineColor>(props.accentColor);

    useEffect(() => {
        if (props.accentColor !== accentColor) setAccentColor(props.accentColor);
        if (props.colorScheme !== colorScheme) setColorScheme(props.colorScheme);
    }, [props.accentColor, props.colorScheme]);

    return (
        <>
            <Head>
                <title>Doki</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>

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
        </>
    );
}

App.getInitialProps = ({ctx}: { ctx: GetServerSidePropsContext }) => ({
    colorScheme: getCookie("color-scheme", ctx) || 'dark',
    accentColor: getCookie("accent-color", ctx) || 'blue'
});