/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef, useState, memo, use } from "react";
import { structureLayer } from "../layers";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import Query from "@arcgis/core/rest/support/Query";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import {
  generateStrucNumber,
  generateStructureData,
  thousands_separators,
} from "../Query";

import { CalciteLabel } from "@esri/calcite-components-react";
import {
  colorStructureHex,
  cpField,
  lotTypeField,
  station1Field,
  statusStructureQuery,
} from "../uniqueValues";
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
class MyTheme extends am5.Theme {
  patterns: am5.LinePattern[] | undefined | any;
  currentPattern: number | any | undefined;
  setupDefaultRules() {
    // let theme: any;

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
        })
      );
    });

    this.patterns = patterns;

    this.currentPattern = 0;
    this.rule("Slice").setAll({
      fillOpacity: 0,
    });

    // this.rule("Slice").setup = function (target: any) {
    //   target?.set("fillPattern", theme?.patterns[theme?.currentPattern]);
    //   theme && theme.currentPattern++;
    //   if (theme?.currentPattern === theme?.patterns?.length) {
    //     if (theme.currentPattern) {
    //       theme.currentPattern = 0;
    //     }
    //   }
    // };
  }
}

/// Draw chart
const StructureChart = memo(() => {
  const arcgisMap = document.querySelector("arcgis-map") as ArcgisMap;
  const { contractp, landtype, landsection } = use(MyContext);

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

  const chartID = "structure-chart";
  const [structureNumber, setStructureNumber] = useState([]);

  const qCP = `${cpField} = '` + contractp + "'";
  const qLandType = `${lotTypeField} = '` + landtype + "'";
  const qCpLandType = qCP + " AND " + qLandType;
  const qLandSection = `${station1Field} = '` + landsection + "'";
  const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;

  useEffect(() => {
    if (!contractp) {
      structureLayer.definitionExpression = "1=1";
    } else if (contractp && !landtype && !landsection) {
      structureLayer.definitionExpression = qCP;
    } else if (contractp && landtype && !landsection) {
      structureLayer.definitionExpression = qCpLandType;
    } else {
      structureLayer.definitionExpression = qCpLandTypeSection;
    }
  }, [contractp, landtype, landsection]);

  useEffect(() => {
    generateStructureData(contractp, landtype, landsection).then(
      (result: any) => {
        setStructureData(result);
      }
    );

    // Structure Number
    generateStrucNumber().then((response: any) => {
      setStructureNumber(response);
    });
  }, [contractp, landtype, landsection]);

  useEffect(() => {
    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
      MyTheme.new(root),
    ]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      })
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
        scale: 2,
      })
    );
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // values inside a donut
    const inner_label = pieSeries.children.push(
      am5.Label.new(root, {
        text: "[#ffffff]{valueSum}[/]\n[fontSize: 7px; #d3d3d3; verticalAlign: super]STRUCTURES[/]",
        fontSize: 15,
        centerX: am5.percent(50),
        centerY: am5.percent(40),
        populateText: true,
        oversizedBehavior: "fit",
        textAlign: "center",
      })
    );

    pieSeries.onPrivate("width", (width: any) => {
      inner_label.set("maxWidth", width * 0.7);
    });

    // Set slice opacity and stroke color
    pieSeries.slices.template.setAll({
      fillOpacity: 0,
      stroke: am5.color("#ffffff"),
      strokeWidth: 0.7,
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
      const find = statusStructureQuery.find(
        (emp: any) => emp.category === categorySelect
      );
      const statusSelect = find?.value;

      let highlightSelect: any;
      const query = structureLayer.createQuery();

      arcgisMap?.whenLayerView(structureLayer).then((layerView: any) => {
        //chartLayerView = layerView;

        structureLayer.queryFeatures(query).then((results: any) => {
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

          structureLayer.queryExtent(queryExt).then(function (result) {
            if (result.extent) {
              arcgisMap?.goTo(result.extent);
            }
          });

          highlightSelect && highlightSelect.remove();

          highlightSelect = layerView.highlight(objID);

          arcgisMap?.view.on("click", function () {
            layerView.filter = new FeatureFilter({
              where: undefined,
            });
            highlightSelect.remove();
          });
        }); // End of queryFeatures

        layerView.filter = new FeatureFilter({
          where: "Status = " + statusSelect,
        });
      }); // End of view.whenLayerVie
    });

    pieSeries.data.setAll(structureData);

    // Legend
    // https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
      })
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
        boxWidth
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
      paddingTop: 1.1,
      paddingBottom: 2,
    });

    pieSeries.appear(1000, 100);

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
      {/* Total Structure Number */}
      <CalciteLabel>TOTAL STRUCTURES</CalciteLabel>
      <CalciteLabel layout="inline">
        <b className="totalLotsNumber">
          {thousands_separators(structureNumber[2])}
          <img
            src="https://EijiGorilla.github.io/Symbols/House_Logo.svg"
            alt="Structure Logo"
            height={"35%"}
            width={"35%"}
            style={{ marginLeft: "155%", display: "flex", marginTop: "-25%" }}
          />
          {/* <div className="totalLotsNumber2">({thousands_separators(structureNumber[2])})</div>{' '} */}
        </b>
      </CalciteLabel>

      {/* Structure Chart */}
      <div
        id={chartID}
        style={{
          height: "50vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginBottom: "10%",
        }}
      ></div>

      {/* Demolished number */}
      <CalciteLabel>DEMOLISHED</CalciteLabel>
      <CalciteLabel layout="inline">
        {structureNumber[1] === 0 ? (
          <b className="DemolishedNumber">
            {structureNumber[0]}% (0)
            <img
              src="https://EijiGorilla.github.io/Symbols/Structure_Demolished.svg"
              alt="Structure Logo"
              height={"15%"}
              width={"15%"}
              style={{ marginLeft: "70%", display: "flex", marginTop: "-10%" }}
            />
          </b>
        ) : (
          <b className="DemolishedNumber">
            {structureNumber[0]}% ({thousands_separators(structureNumber[1])})
            <img
              src="https://EijiGorilla.github.io/Symbols/Structure_Demolished.svg"
              alt="Structure Logo"
              height={"18%"}
              width={"18%"}
              style={{ marginLeft: "70%", display: "flex", marginTop: "-10%" }}
            />
          </b>
        )}
      </CalciteLabel>
    </>
  );
}); // End of lotChartgs

export default StructureChart;
