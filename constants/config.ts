const GCP_PROJECT_ID = "mirrorlearning-161006";
const ENV = process.env.NEXT_PUBLIC_ENV || "local";

let API_ORIGIN = "";
let SITE_HOST = "";
const SITE_TITLE = "READr Mesh 讀選";
const SITE_DESCRIPTION =
  "在READr Mesh 讀選上瀏覽多元的新聞媒體內容。盡情精選、分享和製作新聞集錦，將你認為有意義的新聞資訊傳播出去。";

switch (ENV) {
  case "local":
    SITE_HOST = "localhost:3000";
    API_ORIGIN = "https://mesh-proxy-server-dev-4g6paft7cq-de.a.run.app";
    break;
  case "dev":
    SITE_HOST = "dev.mmesh.news";
    API_ORIGIN = "https://mesh-proxy-server-dev-4g6paft7cq-de.a.run.app";

    break;

  case "prod":
    SITE_HOST = "www.mmesh.news";
    API_ORIGIN =
      "https://mesh-proxy-server-prod-1075249966777.asia-east1.run.app";

    break;

  default:
    break;
}
const GQL_ENDPOINT = `${API_ORIGIN}/gql`;
const SITE_URL = `https://${SITE_HOST}`;
const SITE_OG_IMAGE = `${SITE_URL}/images/default-og-img.png`;
export {
  GCP_PROJECT_ID,
  GQL_ENDPOINT,
  SITE_OG_IMAGE,
  SITE_URL,
  SITE_TITLE,
  SITE_DESCRIPTION,
};
