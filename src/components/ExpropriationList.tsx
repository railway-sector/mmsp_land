/* eslint-disable @typescript-eslint/no-unused-expressions */
import { use, useEffect, useState } from "react";
import { lotLayer } from "../layers";
import Query from "@arcgis/core/rest/support/Query";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-action";
import "@esri/calcite-components/components/calcite-avatar";
import "@esri/calcite-components/components/calcite-action-bar";
import { lotStatusField } from "../uniqueValues";
import { ArcgisMap } from "@arcgis/map-components/dist/components/arcgis-map";
import { MyContext } from "../contexts/MyContext";
import { queryExpression } from "../Query";

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

const ExpropriationList = () => {
  const { contractp, landtype, landsection } = use(MyContext);
  const [exproItem, setExproItem] = useState<undefined | any>([]);

  useEffect(() => {
    // Reset the list
    const query = lotLayer.createQuery();
    const qExpro = `${lotStatusField} = 5`;
    query.where = queryExpression({
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      queryField: qExpro,
    });

    query.returnGeometry = true;
    lotLayer.queryFeatures(query).then((result: any) => {
      setExproItem && setExproItem([]);
      result.features.map((feature: any, index: any) => {
        const attributes = feature.attributes;
        const lotid = attributes.Id;
        const cp = attributes.Package;
        const landtype = attributes.Type;
        const landowner = attributes.OWNER;
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
            landowner: landowner,
            landsection: landsection,
            objectid: objectid,
          },
        ]);
      });
    });
  }, [contractp, landtype, landsection]);

  return (
    <>
      <calcite-list id="result-list" label="exproListLabel">
        {exproItem && // Extract unique objects from the array
          exproItem
            .filter(
              (ele: any, ind: any) =>
                ind ===
                exproItem.findIndex(
                  (elem: any) => elem.objectid === ele.objectid,
                ),
            )
            .map((result: any) => {
              return (
                // need 'key' to upper div and inside CalciteListItem

                <calcite-list-item
                  key={result.id}
                  label={result.lotid}
                  description={result.landowner}
                  value={result.objectid}
                  selected={undefined}
                  oncalciteListItemSelect={(event: any) =>
                    resultClickHandler(event)
                  }
                  style={{ "--calcite-list-label-text-color": "red" }}
                >
                  <calcite-chip
                    value={result.cp}
                    slot="content-end"
                    scale="s"
                    id="exproListChip"
                    label={""}
                  >
                    <calcite-avatar
                      full-name={result.landsection}
                      scale="s"
                      style={{ marginTop: "3px" }}
                    ></calcite-avatar>
                    <span
                      style={{
                        top: -7,
                        bottom: 1,
                        position: "relative",
                        paddingLeft: "3px",
                      }}
                    >
                      {result.cp}
                    </span>
                  </calcite-chip>
                </calcite-list-item>
              );
            })}
      </calcite-list>
    </>
  );
};

export default ExpropriationList;
