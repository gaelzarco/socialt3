import type { AppType, AppProps } from "next/app";
import Head from "next/head";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { api } from "~/utils/api";
import { Inter } from "next/font/google";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Moxie</title>
        <meta
          name="description"
          content="Blazingly fast, secure, and versatile. Meet the next generation of social media."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThemeProvider enableSystem attribute="class">
        <ClerkProvider {...pageProps}>
          <main
            className={`${customFont.variable} flex h-auto w-screen flex-col content-center items-center justify-center font-sans`}
          >
            <div className="mx-auto w-full max-w-[750px] dark:bg-neutral-900">
              <Component {...pageProps} />
            </div>
          </main>
        </ClerkProvider>
      </ThemeProvider>
    </>
  );
};

export const customFont = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal"],
  variable: "--font-jakartaSans",
});

export default api.withTRPC(MyApp);
