import "@esri/calcite-components/components/calcite-tabs";
import "@esri/calcite-components/components/calcite-tab";
import "@esri/calcite-components/components/calcite-tab-nav";
import "@esri/calcite-components/components/calcite-tab-title";
import "@esri/calcite-components/components/calcite-switch";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-shell-panel";

import { use, useState } from "react";

import LotChart from "./LotChart";
import "../index.css";
import { primaryLabelColor } from "../uniqueValues";
import StructureChart from "./StructureChart";
import IsfChart from "./IsfChart";
import ExpropriationList from "./ExpropriationList";
import LotIssueList from "./LotIssueList";
import { MyContext } from "../contexts/MyContext";

function MainChart() {
  const { backgroundcolorSwitch } = use(MyContext);
  const [panelWidth, setPanelWidth] = useState<string>("40%");
  const [panelHeader, setPanelHeader] = useState<string>("Chart");

  const handlePanelCollapse = (event: any) => {
    const collapse_state = event.target.collapsed;

    if (collapse_state) {
      setPanelWidth("50px");
      setPanelHeader("");
    } else {
      setPanelWidth("40%");
      setPanelHeader("Chart");
    }
  };
  return (
    <>
      <calcite-panel
        scale="s"
        slot="panel-end"
        collapsible
        heading={panelHeader}
        // headingLevel={3}
        id="chart-panel"
        collapseDirection="up"
        style={{
          "--calcite-panel-heading-text-color": primaryLabelColor,
          borderStyle: "solid",
          borderRightWidth: 5,
          borderLeftWidth: 5,
          borderBottomWidth: 5,
          borderColor: "#555555",
          width: panelWidth,
          overflowY: "auto",
          display: "block", // without adding display, background will not disappear.
        }}
        onClick={handlePanelCollapse}
      >
        <calcite-tabs
          layout="center"
          scale="m"
          style={{
            backgroundColor: "#2b2b2b",
          }}
        >
          <calcite-tab-nav slot="title-group" id="thetabs">
            <calcite-tab-title className="Land">Land</calcite-tab-title>
            <calcite-tab-title className="Structure">
              Structure
            </calcite-tab-title>
            <calcite-tab-title className="NLO">ISF</calcite-tab-title>
            <calcite-tab-title className="ExproList">
              ExproList
            </calcite-tab-title>
            <calcite-tab-title className="IssueList">
              IssueList
            </calcite-tab-title>
          </calcite-tab-nav>

          {/* CalciteTab: Lot */}
          <calcite-tab
            style={{
              backgroundColor:
                backgroundcolorSwitch === false ? "#2b2b2b" : "white",
            }}
          >
            <LotChart />
          </calcite-tab>

          {/* CalciteTab: Structure */}
          <calcite-tab>
            <StructureChart />
          </calcite-tab>

          {/* CalciteTab: Non-Land Owner */}
          <calcite-tab>
            <IsfChart />
          </calcite-tab>

          {/* CalciteTab: List of Lodts under Expropriation */}
          <calcite-tab>
            <ExpropriationList />
          </calcite-tab>

          {/* CalciteTab: List of Lot issues */}
          <calcite-tab>
            <LotIssueList />
          </calcite-tab>
        </calcite-tabs>
      </calcite-panel>
    </>
  );
}

export default MainChart;
