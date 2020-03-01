import fs from "fs";
import express from "express";
import Proxy from "objectum-proxy";

import OrgModel from "./src/models/OrgModel.js";
import TkModel from "./src/models/TkModel.js";
/*
const TOrgProductModel = require ("./src/models/TOrgProductModel");
const MenuModel = require ("./src/models/MenuModel");
const TkModel = require ("./src/models/TkModel");
const MtModel = require ("./src/models/MtModel");
*/

const app = express ();
const config = JSON.parse (fs.readFileSync ("./config.json"));
const proxy = new Proxy ();

proxy.register ("org", OrgModel);
proxy.register ("tk", TkModel);
/*
proxy.register ("t.org.product", TOrgProductModel);
proxy.register ("tk", TkModel);
proxy.register ("menu", MenuModel);
proxy.register ("mt", MtModel);
*/

proxy.start ({app, config, code: "rmp"});
