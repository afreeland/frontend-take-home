import queryString from "query-string";
import { Search_NPM } from "types/pagination";

const BASE_URL = "https://api.npms.io";

const search = {
  suggestions: (search: Search_NPM) => {
    return `${BASE_URL}/v2/search/suggestions?${queryString.stringify(search)}`;
  },
};

export default { search };
