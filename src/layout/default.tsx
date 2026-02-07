import { type ReactNode } from "react";
import Head from "next/head";
import DottedGridBackground from "../components/DottedGridBackground";

interface LayoutProps {
  children: ReactNode;
}

const DefaultLayout = (props: LayoutProps) => {
  const description =
    "Typesdigital is a tech-forward digital studio building high-performing websites and web platforms.";
  const title = "Typesdigital | Digital products for ambitious teams";
  return (
    <div className="flex min-h-screen min-h-screen flex-col bg-gradient-to-b from-[#111827] to-[#0B0F19]">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="twitter:site" content="@typesdigital" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/social.png" />
        <meta name="twitter:image:width" content="1280" />
        <meta name="twitter:image:height" content="640" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://typesdigital.com/" />
        <meta property="og:image" content="/social.png" />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="640" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DottedGridBackground>{props.children}</DottedGridBackground>
    </div>
  );
};

export default DefaultLayout;
