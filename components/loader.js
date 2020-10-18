import ContentLoader, { Facebook } from "react-content-loader";

const Loader = () => (
  <ContentLoader viewBox="0 0 400 600">
    {/* Only SVG shapes */}
    <rect x="0" y="10" rx="4" ry="4" width="350" height="20" />
    <rect x="0" y="40" rx="3" ry="3" width="300" height="20" />
    <rect x="0" y="80" rx="3" ry="3" width="350" height="20" />

    <rect x="0" y="110" rx="0" ry="3" width="250" height="15" />
    <rect x="0" y="150" rx="0" ry="3" width="250" height="15" />
  </ContentLoader>
);

export default Loader;
