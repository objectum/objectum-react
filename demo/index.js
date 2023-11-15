import OrgModel from "./src/models/OrgModel.js";
import TkModel from "./src/models/TkModel.js";
import Access from "./src/models/Access.js";

import fs from "fs";
import {fileURLToPath} from "url";
import {dirname} from "path";

import Proxy from "objectum-proxy";

const config = JSON.parse (fs.readFileSync ("./config.json", "utf8"));
const proxy = new Proxy ();

proxy.register ("org", OrgModel);
//proxy.register ("tk", TkModel);
//proxy.register (Access);

proxy.start ({config, path: "/api", __dirname: config.rootDir});
