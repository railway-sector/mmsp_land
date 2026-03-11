import "@arcgis/map-components/components/arcgis-time-slider";
import { isfLayer, lotLayer, structureLayer } from "../layers";
import {
  handedOverDateField,
  handedOverField,
  primaryLabelColor,
} from "../uniqueValues";
import { MyContext } from "../contexts/MyContext";
import { use } from "react";
import { generateLotData, queryLayersExpression } from "../Query";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";

export default function Timeslider() {
  const {
    contractp,
    landtype,
    landsection,
    updateStatusdate,
    updateTimesliderstate,
    timesliderstate,
  } = use(MyContext);
  const arcgisMap = document.querySelector("arcgis-map");
  // const timeSlider = document.querySelector("arcgis-time-slider");

  arcgisMap?.viewOnReady(() => {
    arcgisMap?.whenLayerView(lotLayer).then((layerView) => {
      updateTimesliderstate(layerView);
      const timeSlider = document.querySelector("arcgis-time-slider");

      const start = new Date(2020, 9, 24);
      timeSlider.fullTimeExtent = {
        start: start,
        end: new Date(2026, 1, 13),
      };
      timeSlider.stops = {
        interval: {
          value: 1,
          unit: "months",
        },
      };

      reactiveUtils.watch(
        () => timeSlider?.timeExtent,
        (timeExtent) => {
          if (timeExtent) {
            const year = timeExtent.end.getFullYear();
            const month = timeExtent.end.getMonth() + 1;
            const day = timeExtent.end.getDate();
            const new_date = `${year}-${month}-${day}`;

            // layerView.filter = new FeatureFilter({
            //   where: `${handedOverDateField} <= date '${new_date}'`,
            // });

            // lotLayer.definitionExpression = `${handedOverDateField} <= date '${new_date}'`;

            // lotLayer.definitionExpression =
            //   "Status_Date = date' " + new_date + "'";
          }
        },
      );
    });
  });

  return (
    <>
      <span style={{ fontSize: "16px", color: "#d1d5db", margin: "auto" }}>
        Historical Progress on Land Acquisition
      </span>
      <div>
        <arcgis-time-slider
          referenceElement="arcgis-map"
          slot="bottom"
          layout="auto"
          mode="time-window"
        ></arcgis-time-slider>
      </div>
    </>
  );
}
