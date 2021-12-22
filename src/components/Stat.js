import React, {useState, useEffect} from "react";
import Loading from "./Loading";
import PageTitle from "./PageTitle";
import {i18n} from "./../i18n";

export default function Stat ({store}) {
    let [data, setData] = useState ({});
    let [loading, setLoading] = useState (true);

    useEffect (async () => {
        let data = await store.getStat ();
        data.access.sort ((a, b) => a.time > b.time ? 1 : -1);
        data.refreshToken.sort ((a, b) => a.expires > b.expires ? 1 : -1);
        setData (data);
        setLoading (false);
    }, []);

    if (loading) {
        return <Loading container />;
    }
    return <div className="container-fluid">
        <div className="d-flex">
            <div>
                <PageTitle label={`${i18n ("Online")}: ${data.access.length}`} />
                <table className="table table-sm table-bordered bg-white shadow">
                    <tr>
                        <th>{i18n ("Auth")}</th>
                        <th>{i18n ("User")}</th>
                        <th>{i18n ("Role")}</th>
                        <th>{i18n ("Activity")}</th>
                    </tr>
                    {data.access.map (({id, time}, i) => {
                        let o = data.map [id];
                        return <tr key={i}>
                            <td>{o.id}</td>
                            <td>{o.username} {o.userId ? ` (${o.userId})` : ""}</td>
                            <td>{o.roleCode}</td>
                            <td>{new Date (time).toLocaleString ()}</td>
                        </tr>;
                    })}
                </table>
            </div>
            <div className="ml-1">
                <PageTitle label={`${i18n ("Transactions")}: ${data.transaction.length}`} />
                <table className="table table-sm table-bordered bg-white shadow">
                    <tr>
                        <th>{i18n ("Auth")}</th>
                        <th>{i18n ("User")}</th>
                        <th>{i18n ("Role")}</th>
                        <th>{i18n ("Revision")}</th>
                    </tr>
                    {data.transaction.map (({id, revision}, i) => {
                        let o = data.map [id];
                        return <tr key={i}>
                            <td>{o.id}</td>
                            <td>{o.username} {o.userId ? ` (${o.userId})` : ""}</td>
                            <td>{o.roleCode}</td>
                            <td>{revision}</td>
                        </tr>;
                    })}
                </table>
            </div>
            <div className="ml-1">
                <PageTitle label={`refreshToken: ${data.refreshToken.length}`} />
                <table className="table table-sm table-bordered bg-white shadow">
                    <tr>
                        <th>{i18n ("Auth")}</th>
                        <th>{i18n ("User")}</th>
                        <th>{i18n ("Role")}</th>
                        <th>{i18n ("Expires")}</th>
                    </tr>
                    {data.refreshToken.map (({id, expires}, i) => {
                        let o = data.map [id];
                        return <tr key={i}>
                            <td>{o.id}</td>
                            <td>{o.username} {o.userId ? ` (${o.userId})` : ""}</td>
                            <td>{o.roleCode}</td>
                            <td>{new Date (expires).toLocaleString ()}</td>
                        </tr>;
                    })}
                </table>
            </div>
        </div>
    </div>;
};
