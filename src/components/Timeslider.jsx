import "@arcgis/map-components/components/arcgis-time-slider";
import { lotLayer } from "../layers";
import { primaryLabelColor } from "../uniqueValues";

export default function Timeslider() {
  const arcgisMap = document.querySelector("arcgis-map");

  arcgisMap?.viewOnReady(() => {
    arcgisMap?.whenLayerView(lotLayer).then((layerView) => {
      const timeSlider = document.querySelector("arcgis-time-slider");

      const start = new Date(2020, 1, 1);
      timeSlider.fullTimeExtent;
      timeSlider.fullTimeExtent = {
        start: start,
        // end: lotLayer.timeInfo.fullTimeExtent.end,
        end: new Date(2026, 12, 31),
      };
      // timeSlider.fullTimeExtent = lotLayer.timeInfo.fullTimeExtent;

      // timeSlider.playRate = 1;
      timeSlider.tops = {
        interval: lotLayer.timeInfo.interval,
      };
    });
  });

  return (
    <>
      <span style={{ fontSize: "16px", color: "#d1d5db", margin: "auto" }}>
        HANDED-OVER LOTS
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
