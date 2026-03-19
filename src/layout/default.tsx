import { type ReactNode } from "react";
import Head from "next/head";
import DottedGridBackground from "../components/DottedGridBackground";

interface LayoutProps {
  children: ReactNode;
}

const DefaultLayout = (props: LayoutProps) => {
  const description =
    "SkyVector 3D is a cinematic live-flight dashboard with regional radar views, estimated routes, and an immersive airspace UI.";
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#030712_40%,_#02030a_100%)]">
      <Head>
        <title>SkyVector 3D</title>
        <meta name="description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SkyVector 3D" />
        <meta name="twitter:description" content={description} />
        <meta property="og:title" content="SkyVector 3D" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DottedGridBackground>{props.children}</DottedGridBackground>
    </div>
  );
};

export default DefaultLayout;
