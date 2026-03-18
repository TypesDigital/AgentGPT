import { type NextPage } from "next";
import DefaultLayout from "../layout/default";
import ThreePlayground from "../components/ThreePlayground";

const Home: NextPage = () => {
  return (
    <DefaultLayout>
      <ThreePlayground />
    </DefaultLayout>
  );
};

export default Home;
