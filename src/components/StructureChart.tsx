/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef, useState, memo, use } from "react";
import { structureLayer } from "../layers";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import {
  chartRenderer,
  pieChartStatusData,
  queryDefinitionExpression,
  queryExpression,
  thousands_separators,
  totalFieldCount,
  zoomToLayer,
} from "../Query";

import {
  colorStructureHex,
  primaryLabelColor,
  statusStructure,
  statusStructureField,
  statusStructureQuery,
  structureIdField,
  structureRemarksField,
  valueLabelColor,
} from "../uniqueValues";
import { ArcgisMap } from "@arcgis/map-components/components/arcgis-map";
import { MyContext } from "../contexts/MyContext";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

///*** Others */

class MyTheme extends am5.Theme {
  patterns: am5.LinePattern[] | undefined | any;
  currentPattern: number | any | undefined;
  setupDefaultRules() {
    // eslint-disable-next-line prefer-const
    let theme = this;

    const gap = 4;
    const rotation = 135;
    const strokeWidth = 1.1;
    const fillOpacity = 0;
    const width = 10;
    const height = 10;

    const patterns = colorStructureHex.map((color: any) => {
      return Object.assign(
        am5.LinePattern.new(this._root, {
          color: am5.color(color),
          gap: gap,
          rotation: rotation,
          strokeWidth: strokeWidth,
          fillOpacity: fillOpacity,
          width: width,
          height: height,
        }),
      );
    });

    this.patterns = patterns;

    this.currentPattern = 0;
    this.rule("Slice").setAll({
      fillOpacity: 0,
    });

    this.rule("Slice").setup = function (target) {
      target.set("fillPattern", theme.patterns[theme.currentPattern]);
      theme.currentPattern++;
      if (theme.currentPattern === theme.patterns?.length) {
        theme.currentPattern = 0;
      }
    };
  }
}

/// Draw chart
const StructureChart = memo(() => {
  const arcgisMap = document.querySelector("arcgis-map") as ArcgisMap;
  const {
    contractp,
    landtype,
    landsection,
    updateChartPanelwidth,
    chartPanelwidth,
  } = use(MyContext);

  const new_fontSize = chartPanelwidth / 22.3;
  const new_valueSize = new_fontSize * 1.55;
  const new_imageSize = chartPanelwidth * 0.03;
  // const new_asofDateSize = chartPanelwidth * 0.032;
  const new_pieSeriesScale = 220;
  const new_pieInnerValueFontSize = "1.2rem";
  const new_pieInnerLabelFontSize = "0.45em";

  // 1. Structure
  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [structureData, setStructureData] = useState([
    {
      category: String,
      value: Number,
    },
  ]);
  const [structureNumber, setStructureNumber] = useState<number>(0);
  const [strucDemolishedNumber, setStrucDemolishedNumber] = useState<number>(0);
  const [strucNumberForDemolition, setStrucNumberForDemolition] =
    useState<number>(0);
  const [percentDemolished, setPercentDemolished] = useState<number>(0);

  const chartID = "structure-chart";

  useEffect(() => {
    queryDefinitionExpression({
      queryExpression: queryExpression({
        contractcp: contractp,
        landtype: landtype,
        landsection: landsection,
      }),
      featureLayer: [structureLayer],
    });

    //--- chart data
    pieChartStatusData({
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      layer: structureLayer,
      statusList: statusStructure,
      statusColor: colorStructureHex,
      statusField: statusStructureField,
      statisticType: "count",
    }).then((result: any) => {
      setStructureData(result[0]);
    });

    //--- total number of structure
    totalFieldCount({
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      layer: structureLayer,
      idField: structureIdField,
    }).then((result: any) => {
      setStructureNumber(result);
    });

    //--- numbe of demolished structures
    totalFieldCount({
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      layer: structureLayer,
      idField: structureRemarksField,
      queryField: `${structureRemarksField} = 'Demolished'`,
    }).then((result: any) => {
      setStrucDemolishedNumber(result);
    });

    //--- number of structures subject to demolition
    totalFieldCount({
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      layer: structureLayer,
      idField: structureRemarksField,
      queryField: `${structureRemarksField} IS NOT NULL`,
    }).then((result: any) => {
      setStrucNumberForDemolition(result);
    });

    zoomToLayer(structureLayer, arcgisMap);
  }, [contractp, landtype, landsection]);

  useEffect(() => {
    setPercentDemolished(
      Math.round((strucDemolishedNumber / strucNumberForDemolition) * 100),
    );
  }, [structureNumber, strucDemolishedNumber, strucNumberForDemolition]);

  useEffect(() => {
    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
      MyTheme.new(root),
    ]);

    // Create chart
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      }),
    );
    chartRef.current = chart;

    // Create series
    const pieSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: "Series",
        categoryField: "category",
        valueField: "value",
        legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
        radius: am5.percent(45), // outer radius
        innerRadius: am5.percent(28),
        scale: 1.7,
      }),
    );
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // Legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
      }),
    );
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    // Render chart
    chartRenderer({
      chartItem: "structure",
      chart: chart,
      pieSeries: pieSeries,
      legend: legend,
      root: root,
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      status_field: statusStructureField,
      arcgisMap: arcgisMap,
      updateChartPanelwidth: updateChartPanelwidth,
      data: structureData,
      pieSeriesScale: new_pieSeriesScale,
      pieInnerLabel: "STRUCTURES",
      pieInnerLabelFontSize: new_pieInnerLabelFontSize,
      pieInnerValueFontSize: new_pieInnerValueFontSize,
      layer: structureLayer,
      statusArray: statusStructureQuery,
      background_color_switch: false,
    });

    return () => {
      root.dispose();
    };
  }, [chartID, structureData]);

  useEffect(() => {
    pieSeriesRef.current?.data.setAll(structureData);
    legendRef.current?.data.setAll(pieSeriesRef.current.dataItems);
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <img
          src="https://EijiGorilla.github.io/Symbols/House_Logo.svg"
          alt="Land Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
          style={{ marginTop: "10px", marginLeft: "20px" }}
        />
        <dl style={{ alignItems: "center", marginRight: "25px" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            TOTAL STRUCTURES
          </dt>
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${new_valueSize}px`,
              fontWeight: "bold",
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
            }}
          >
            {thousands_separators(structureNumber)}
          </dd>
        </dl>
      </div>
      {/* Structure Chart */}
      <div
        id={chartID}
        style={{
          height: "55vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginBottom: "7%",
        }}
      ></div>

      {/* Demolished number */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <img
          src="https://EijiGorilla.github.io/Symbols/Structure_Demolished.svg"
          alt="Land Logo"
          height={`${new_imageSize}%`}
          width={"55px"}
          style={{ marginTop: "10px", marginLeft: "20px" }}
        />
        <dl style={{ alignItems: "center", marginRight: "35px" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            DEMOLISHED
          </dt>
          <dd
            style={{
              color: valueLabelColor,
              fontSize: `${new_valueSize}px`,
              fontWeight: "bold",
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
            }}
          >
            {percentDemolished}% ({thousands_separators(strucDemolishedNumber)})
          </dd>
        </dl>
      </div>
    </>
  );
}); // End of lotChartgs

export default StructureChart;
