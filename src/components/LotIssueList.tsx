/* eslint-disable @typescript-eslint/no-unused-expressions */
import { use, useEffect, useState } from "react";
import { lotLayer } from "../layers";
import Query from "@arcgis/core/rest/support/Query";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-list";
import "@esri/calcite-components/dist/components/calcite-list-item";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-action";
import "@esri/calcite-components/dist/components/calcite-avatar";
import "@esri/calcite-components/dist/components/calcite-action-bar";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {
  CalciteList,
  CalciteListItem,
  CalciteChip,
  CalciteAvatar,
} from "@esri/calcite-components-react";
import {
  cpField,
  lotIssueListField,
  lotTypeField,
  station1Field,
} from "../uniqueValues";
import { ArcgisMap } from "@arcgis/map-components/dist/components/arcgis-map";
import { MyContext } from "../contexts/MyContext";

// Zoom in to selected lot from expropriation list
let highlightSelect: any;
function resultClickHandler(event: any) {
  const arcgisMap = document.querySelector("arcgis-map") as ArcgisMap;

  const queryExtent = new Query({
    objectIds: [event.target.value],
  });
  lotLayer.queryExtent(queryExtent).then((result: any) => {
    result.extent &&
      arcgisMap?.goTo({
        target: result.extent,
        speedFactor: 2,
        zoom: 17,
      });
  });

  arcgisMap?.whenLayerView(lotLayer).then((layerView: any) => {
    highlightSelect && highlightSelect.remove();
    highlightSelect = layerView.highlight([event.target.value]);

    arcgisMap?.view.on("click", () => {
      layerView.filter = null;
      highlightSelect.remove();
    });
  });
}

const LotIssueList = () => {
  const { contractp, landtype, landsection } = use(MyContext);
  const [exproItem, setExproItem] = useState<undefined | any>([]);

  useEffect(() => {
    // Reset the list
    const query = lotLayer.createQuery();
    const qExpro = `${lotIssueListField} IS NOT NULL`;
    const qCP = `${cpField} = '` + contractp + "'";
    const qLandType = `${lotTypeField} = '` + landtype + "'";
    const qCpLandType = qCP + " AND " + qLandType;
    const qLandSection = `${station1Field} = '` + landsection + "'";
    const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;

    if (!contractp) {
      query.where = qExpro;
    } else if (contractp && !landtype && !landsection) {
      query.where = qExpro + " AND " + qCP;
    } else if (contractp && landtype && !landsection) {
      query.where = qExpro + " AND " + qCpLandType;
    } else {
      query.where = qExpro + " AND " + qCpLandTypeSection;
    }
    // query.outFields = ["*"];

    query.returnGeometry = true;
    lotLayer.queryFeatures(query).then((result: any) => {
      setExproItem && setExproItem([]);

      result.features.map((feature: any, index: any) => {
        const attributes = feature.attributes;
        const lotid = attributes.Id;
        const cp = attributes.Package;
        const landtype = attributes.Type;
        const issue = attributes.Issue;
        const landsection = attributes.Station1;
        const objectid = attributes.OBJECTID;
        const id = index;

        setExproItem((prev: any) => [
          ...prev,
          {
            id: id,
            lotid: lotid,
            cp: cp,
            landtype: landtype,
            issue: issue,
            landsection: landsection,
            objectid: objectid,
          },
        ]);
      });
    });
  }, [contractp, landtype, landsection]);

  return (
    <>
      <CalciteList id="result-list" label="exproListLabel">
        {exproItem && // Extract unique objects from the array
          exproItem
            .filter(
              (ele: any, ind: any) =>
                ind ===
                exproItem.findIndex(
                  (elem: any) => elem.objectid === ele.objectid
                )
            )
            .map((result: any) => {
              return (
                // need 'key' to upper div and inside CalciteListItem
                <CalciteListItem
                  key={result.id}
                  label={result.lotid}
                  description={result.issue}
                  value={result.objectid}
                  selected={undefined}
                  onCalciteListItemSelect={(event: any) =>
                    resultClickHandler(event)
                  }
                >
                  <CalciteChip
                    value={result.cp}
                    slot="content-end"
                    scale="s"
                    id="exproListChip"
                  >
                    <CalciteAvatar
                      full-name={result.landsection}
                      scale="s"
                    ></CalciteAvatar>
                    {result.cp}
                  </CalciteChip>
                </CalciteListItem>
              );
            })}
      </CalciteList>
    </>
  );
};

export default LotIssueList;
