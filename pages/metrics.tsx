import { withSSRAuth } from "../utils/withSSRAuth";
import { setUpAuthAPiClient } from "../services/api";

export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setUpAuthAPiClient(ctx as any);
  const response = await apiClient.get("/me");

  return {
    props: {},
  };
}, {
    permissions: ['metrics.list'],
    roles: ['administrator']
});
