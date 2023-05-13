import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";
import { api } from "../services/apiClient";
import { setUpAuthAPiClient } from "../services/api";
import { Can } from "../component/Can";

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext);

  useEffect(() => {
    api.get("/me").then((response) => {
      console.log(response);
    });
  }, []);

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <button onClick={signOut}>SignOut</button>
      <Can permissions={['metrics.list']}>
      <div>Métricas</div>

      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setUpAuthAPiClient(ctx as any);
  const response = await apiClient.get("/me");
  return {
    props: {},
  };
});
