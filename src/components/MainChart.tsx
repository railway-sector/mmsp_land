import "@esri/calcite-components/dist/components/calcite-tabs";
import "@esri/calcite-components/dist/components/calcite-tab";
import "@esri/calcite-components/dist/components/calcite-tab-nav";
import "@esri/calcite-components/dist/components/calcite-tab-title";
import "@esri/calcite-components/dist/components/calcite-switch";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {
  CalciteTab,
  CalciteTabs,
  CalciteTabNav,
  CalciteTabTitle,
  CalciteSwitch,
} from "@esri/calcite-components-react";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import { useState } from "react";

import LotChart from "./LotChart";
import "../index.css";
import "../App.css";
import { primaryLabelColor } from "../uniqueValues";
import StructureChart from "./StructureChart";
import IsfChart from "./IsfChart";
import ExpropriationList from "./ExpropriationList";
import LotIssueList from "./LotIssueList";

function MainChart() {
  const [backgroundColorSwitch, setBackgroundColorSwitch] =
    useState<boolean>(false);
  // const [backgroundColor, setBackgroundColor] = useState<any>("#2b2b2b");
  // const [lotLayerLoaded, setLotLayerLoaded] = useState<any>();
  // const [chartTabName, setChartTabName] = useState("Land");

  // Somehow if you do not add arcgisScene here, the child components (ie., LotChart)
  // will not inherit arcgisScene
  // const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;

  // useEffect(() => {
  //   lotLayer.load().then(() => {
  //     setLotLayerLoaded(lotLayer.loadStatus);
  //   });
  // });

  // useEffect(() => {
  //   backgroundColorSwitch === false
  //     ? setBackgroundColor("#2b2b2b")
  //     : setBackgroundColor("white");
  // }, [backgroundColorSwitch]);

  return (
    <>
      <CalciteTabs
        slot="panel-end"
        layout="center"
        scale="m"
        style={{
          borderStyle: "solid",
          borderRightWidth: 5,
          borderLeftWidth: 5,
          borderBottomWidth: 5,
          // borderTopWidth: 5,
          borderColor: "#555555",
        }}
      >
        <CalciteTabNav
          slot="title-group"
          id="thetabs"
          // onCalciteTabChange={(event: any) =>
          //   setChartTabName(event.srcElement.selectedTitle.className)
          // }
        >
          <CalciteTabTitle class="Land">Land</CalciteTabTitle>
          <CalciteTabTitle class="Structure">Structure</CalciteTabTitle>
          <CalciteTabTitle class="NLO">ISF</CalciteTabTitle>
          <CalciteTabTitle class="ExproList">ExproList</CalciteTabTitle>
          <CalciteTabTitle class="IssueList">IssueList</CalciteTabTitle>
        </CalciteTabNav>

        {/* CalciteTab: Lot */}
        <CalciteTab
          style={{
            backgroundColor:
              backgroundColorSwitch === false ? "#2b2b2b" : "white",
          }}
        >
          <LotChart backgcolorswitch={backgroundColorSwitch} />
          {/* switch white and black background */}
          <div
            style={{
              color:
                backgroundColorSwitch === false ? primaryLabelColor : "black",
              position: "fixed",
              bottom: "5px",
              right: "10px",
              fontSize: "12px",
              marginBottom: "5px",
            }}
          >
            BLK BG{" "}
            <CalciteSwitch
              onCalciteSwitchChange={(event: any) =>
                setBackgroundColorSwitch(event.target.checked)
              }
            ></CalciteSwitch>{" "}
            WHT BG
          </div>
        </CalciteTab>

        {/* CalciteTab: Structure */}
        <CalciteTab>
          <StructureChart />
        </CalciteTab>

        {/* CalciteTab: Non-Land Owner */}
        <CalciteTab>
          <IsfChart />
        </CalciteTab>

        {/* CalciteTab: List of Lots under Expropriation */}
        <CalciteTab>
          <ExpropriationList />
        </CalciteTab>

        {/* CalciteTab: List of Lot issues */}
        <CalciteTab>
          <LotIssueList />
        </CalciteTab>
      </CalciteTabs>
    </>
  );
}

export default MainChart;
