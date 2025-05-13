import Header from "@components/header";
import Head from "next/head";

const Home: React.FC = () => {
    return (
        <>
            <Head>Shoppy
                <title>Soppy</title>
                <meta name="description" content="Shoppy app" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header></Header>
            <main>
                <h1>Home</h1>

                <p>
                   Welcome! Buy!
                </p>
            </main>
        </>
    );
};

export default Home;