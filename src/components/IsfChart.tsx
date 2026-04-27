import { useRef, useState, useEffect, memo, use } from "react";
import { isfLayer } from "../layers";
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
import { ArcgisMap } from "@arcgis/map-components/components/arcgis-map";
import { MyContext } from "../contexts/MyContext";
import {
  colorIsf,
  primaryLabelColor,
  statusIsf,
  statusIsfField,
  statusIsfQuery,
  valueLabelColor,
} from "../uniqueValues";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

/// Draw chart
const IsfChart = memo(() => {
  const arcgisMap = document.querySelector("arcgis-map") as ArcgisMap;
  const {
    contractp,
    landtype,
    landsection,
    updateChartPanelwidth,
    chartPanelwidth,
  } = use(MyContext);

  const new_fontSize = chartPanelwidth / 22.3;
  // const new_valueSize = new_fontSize * 1.55;
  const new_imageSize = chartPanelwidth * 0.03;
  // const new_asofDateSize = chartPanelwidth * 0.032;
  const new_pieSeriesScale = 220;
  const new_pieInnerValueFontSize = "1.2rem";
  const new_pieInnerLabelFontSize = "0.45em";

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [isfData, setIsfData] = useState([
    {
      category: String,
      value: Number,
      sliceSettings: {
        fill: am5.color("#00c5ff"),
      },
    },
  ]);
  const [isfNumber, setIsfNumber] = useState<number>(0);

  const chartID = "isf-pie";

  useEffect(() => {
    queryDefinitionExpression({
      queryExpression: queryExpression({
        contractcp: contractp,
        landtype: landtype,
        landsection: landsection,
      }),
      featureLayer: [isfLayer],
    });

    pieChartStatusData({
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      layer: isfLayer,
      statusList: statusIsf,
      statusColor: colorIsf,
      statusField: statusIsfField,
      statisticType: "count",
    }).then((result: any) => {
      setIsfData(result[0]);
    });

    //--- total number of households
    totalFieldCount({
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      layer: isfLayer,
      idField: statusIsfField,
    }).then((result: any) => {
      setIsfNumber(result);
    });

    zoomToLayer(isfLayer, arcgisMap);
  }, [contractp, landtype, landsection]);

  useEffect(() => {
    // Dispose previously created root element

    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
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
        scale: 1.6,
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
      chart: chart,
      pieSeries: pieSeries,
      legend: legend,
      root: root,
      contractcp: contractp,
      landtype: landtype,
      landsection: landsection,
      status_field: statusIsfField,
      arcgisMap: arcgisMap,
      updateChartPanelwidth: updateChartPanelwidth,
      data: isfData,
      pieSeriesScale: new_pieSeriesScale,
      pieInnerLabel: "FAMILIES",
      pieInnerLabelFontSize: new_pieInnerLabelFontSize,
      pieInnerValueFontSize: new_pieInnerValueFontSize,
      layer: isfLayer,
      statusArray: statusIsfQuery,
      background_color_switch: false,
    });

    return () => {
      root.dispose();
    };
  }, [chartID, isfData]);

  useEffect(() => {
    pieSeriesRef.current?.data.setAll(isfData);
    legendRef.current?.data.setAll(pieSeriesRef.current.dataItems);
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <img
          src="https://EijiGorilla.github.io/Symbols/NLO_Logo.svg"
          alt="Land Logo"
          height={`${new_imageSize}%`}
          width={`${new_imageSize}%`}
          style={{ marginTop: "20px", marginLeft: "20px" }}
        />
        <dl style={{ alignItems: "center", marginRight: "30px" }}>
          <dt
            style={{ color: primaryLabelColor, fontSize: `${new_fontSize}px` }}
          >
            TOTAL FAMILIES
          </dt>
          <dd
            style={{
              color: valueLabelColor,
              fontSize: "1.9rem",
              fontWeight: "bold",
              fontFamily: "calibri",
              lineHeight: "1.2",
              margin: "auto",
            }}
          >
            {thousands_separators(isfNumber)}
          </dd>
        </dl>
      </div>

      <div
        id={chartID}
        style={{
          width: "100%",
          height: "55vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
        }}
      ></div>
    </>
  );
}); // End of lotChartgs

export default IsfChart;
