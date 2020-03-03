import Proxy from "objectum-proxy";

import OrgModel from "./src/models/OrgModel.js";
import TkModel from "./src/models/TkModel.js";

import fs from "fs";
import {fileURLToPath} from "url";
import {dirname} from "path";

const __filename = fileURLToPath (import.meta.url);
const __dirname = dirname (__filename);
const config = JSON.parse (fs.readFileSync ("./config.json", "utf8"));
const proxy = new Proxy ();

proxy.register ("org", OrgModel);
proxy.register ("tk", TkModel);

proxy.start ({config, code: "rmp", __dirname});
