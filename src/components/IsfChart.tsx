import { useRef, useState, useEffect, memo, use } from "react";
import { isfLayer } from "../layers";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import Query from "@arcgis/core/rest/support/Query";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import {
  generateIsfData,
  generateIsfNumber,
  thousands_separators,
} from "../Query";

import { cpField, lotTypeField, station1Field } from "../uniqueValues";
import { ArcgisMap } from "@arcgis/map-components/dist/components/arcgis-map";
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

/// Draw chart
const IsfChart = memo(() => {
  const arcgisMap = document.querySelector("arcgis-map") as ArcgisMap;
  const { contractp, landtype, landsection } = use(MyContext);

  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [isfData, SetIsfData] = useState([
    {
      category: String,
      value: Number,
      sliceSettings: {
        fill: am5.color("#00c5ff"),
      },
    },
  ]);
  const [isfNumber, setIsfNumber] = useState();

  const chartID = "isf-pie";

  // Query
  const qCP = `${cpField} = '` + contractp + "'";
  const qLandType = `${lotTypeField} = '` + landtype + "'";
  const qCpLandType = qCP + " AND " + qLandType;
  const qLandSection = `${station1Field} = '` + landsection + "'";
  const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;

  useEffect(() => {
    if (!contractp) {
      isfLayer.definitionExpression = "1=1";
    } else if (contractp && !landtype && !landsection) {
      isfLayer.definitionExpression = qCP;
    } else if (contractp && landtype && !landsection) {
      isfLayer.definitionExpression = qCpLandType;
    } else {
      isfLayer.definitionExpression = qCpLandTypeSection;
    }
  }, [contractp, landtype, landsection]);

  useEffect(() => {
    generateIsfData(contractp, landtype, landsection).then((result: any) => {
      SetIsfData(result);
    });

    // ISF
    generateIsfNumber().then((response: any) => {
      setIsfNumber(response);
    });
  }, [contractp, landtype, landsection]);

  useEffect(() => {
    // Dispose previously created root element

    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      }),
    );
    chartRef.current = chart;

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    const pieSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: "Series",
        categoryField: "category",
        valueField: "value",
        //legendLabelText: "[{fill}]{category}[/]",
        legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
        radius: am5.percent(45), // outer radius
        innerRadius: am5.percent(28),
        scale: 1.6,
      }),
    );
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // values inside a donut
    const inner_label = pieSeries.children.push(
      am5.Label.new(root, {
        text: "[#ffffff]{valueSum}[/]\n[fontSize: 9px; #d3d3d3; verticalAlign: super]FAMILIES[/]",
        fontSize: 17,
        centerX: am5.percent(50),
        centerY: am5.percent(40),
        populateText: true,
        oversizedBehavior: "fit",
        textAlign: "center",
      }),
    );

    pieSeries.onPrivate("width", (width: any) => {
      inner_label.set("maxWidth", width * 0.7);
    });

    // Set slice opacity and stroke color
    pieSeries.slices.template.setAll({
      fillOpacity: 0.9,
      stroke: am5.color("#ffffff"),
      strokeWidth: 0.5,
      strokeOpacity: 1,
      templateField: "sliceSettings",
      toggleKey: "none",
    });

    // Disabling labels and ticksll
    pieSeries.labels.template.set("visible", false);
    pieSeries.ticks.template.set("visible", false);

    // EventDispatcher is disposed at SpriteEventDispatcher...
    // It looks like this error results from clicking events
    pieSeries.slices.template.events.on("click", (ev) => {
      const selected: any = ev.target.dataItem?.dataContext;
      const categorySelect: string = selected.category;

      let highlightSelect: any;

      const query = isfLayer.createQuery();

      arcgisMap?.whenLayerView(isfLayer).then((layerView: any) => {
        //chartLayerView = layerView;

        isfLayer.queryFeatures(query).then(function (results) {
          const RESULT_LENGTH = results.features;
          const ROW_N = RESULT_LENGTH.length;

          const objID = [];
          for (let i = 0; i < ROW_N; i++) {
            const obj = results.features[i].attributes.OBJECTID;
            objID.push(obj);
          }

          const queryExt = new Query({
            objectIds: objID,
          });

          isfLayer.queryExtent(queryExt).then(function (result) {
            if (result.extent) {
              arcgisMap?.goTo(result.extent);
            }
          });

          if (highlightSelect) {
            highlightSelect.remove();
          }
          highlightSelect = layerView.highlight(objID);

          arcgisMap?.view.on("click", function () {
            layerView.filter = new FeatureFilter({
              where: undefined,
            });
            highlightSelect.remove();
          });
        }); // End of queryFeatures

        layerView.filter = new FeatureFilter({
          where: "RELOCATION = '" + categorySelect + "'",
        });
      }); // End of view.whenLayerView
    });

    pieSeries.data.setAll(isfData);

    // Legend
    // https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
      }),
    );
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    // Change the size of legend markers
    legend.markers.template.setAll({
      width: 18,
      height: 18,
    });

    // Change the marker shape
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10,
    });

    // Responsive legend
    // https://www.amcharts.com/docs/v5/tutorials/pie-chart-with-a-legend-with-dynamically-sized-labels/
    // This aligns Legend to Left
    chart.onPrivate("width", function (width: any) {
      const boxWidth = 190; //props.style.width;
      const availableSpace = Math.max(
        width - chart.height() - boxWidth,
        boxWidth,
      );
      //const availableSpace = (boxWidth - valueLabelsWidth) * 0.7
      legend.labels.template.setAll({
        width: availableSpace,
        maxWidth: availableSpace,
      });
    });

    // To align legend items: valueLabels right, labels to left
    // 1. fix width of valueLabels
    // 2. dynamically change width of labels by screen size

    const valueLabelsWidth = 50;

    // Change legend labelling properties
    // To have responsive font size, do not set font size
    legend.labels.template.setAll({
      oversizedBehavior: "truncate",
      fill: am5.color("#ffffff"),
      //textDecoration: "underline"
      //width: am5.percent(200)
      //fontWeight: "300"
    });

    legend.valueLabels.template.setAll({
      textAlign: "right",
      width: valueLabelsWidth,
      fill: am5.color("#ffffff"),
      //fontSize: LEGEND_FONT_SIZE,
    });

    legend.itemContainers.template.setAll({
      // set space between legend items
      paddingTop: 5,
      paddingBottom: 1,
    });

    pieSeries.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartID, isfData]);

  useEffect(() => {
    pieSeriesRef.current?.data.setAll(isfData);
    legendRef.current?.data.setAll(pieSeriesRef.current.dataItems);
  });

  const primaryLabelColor = "#9ca3af";
  const valueLabelColor = "#d1d5db";

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <img
          src="https://EijiGorilla.github.io/Symbols/NLO_Logo.svg"
          alt="Land Logo"
          height={"50px"}
          width={"50px"}
          style={{ marginTop: "20px", marginLeft: "20px" }}
        />
        <dl style={{ alignItems: "center", marginRight: "30px" }}>
          <dt style={{ color: primaryLabelColor, fontSize: "1.1rem" }}>
            TOTAL LOTS
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
          height: "55vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
        }}
      ></div>
    </>
  );
}); // End of lotChartgs

export default IsfChart;
