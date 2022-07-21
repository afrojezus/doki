import Head from 'next/head';

interface SEOProps {
    description: string;
    title: string;
    siteTitle: string;
    type?: string;
    image?: string;
    video?: string;
    audio?: string;
}

export default function SEO({description, title, siteTitle, type = "website", image = "", video = "", audio = ""}: SEOProps) {
    return <Head>
        <title>{`${title} - ${siteTitle}`}</title>
        <meta name="description" content={description}/>
        <meta property="og:type" content={type}/>
        <meta property="og:title" content={title}/>
        <meta property="og:image" content={image}/>
        <meta property="og:video" content={video}/>
        <meta property="og:audio" content={audio}/>
        <meta property="og:description" content={description}/>
        <meta property="og:site_name" content={siteTitle}/>
        <meta property="twitter:card" content="summary"/>
        <meta property="twitter:creator" content=""/>
        <meta property="twitter:title" content={title}/>
        <meta property="twitter:description" content={description}/>
    </Head>
}