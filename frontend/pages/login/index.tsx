import Header from '@components/header';
import UserLoginForm from '@components/users/UserLoginForm';
import Head from 'next/head';

const Login: React.FC = () => {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Header />
      <main>
        <section className="flex flex-col justify-center">
          <UserLoginForm />
        </section>
      </main>
    </>
  );
};

export default Login;
