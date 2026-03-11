import { sbs_drone_image1, sbs_drone_image2 } from "../layers";
import "@arcgis/map-components/components/arcgis-swipe";

export default function SwipePanel() {
  const arcgisSwipe = document.querySelector("arcgis-swipe");
  const arcgisMap = document.querySelector("arcgis-map");

  arcgisMap?.viewOnReady(() => {
    arcgisSwipe?.leadingLayers?.add(sbs_drone_image1);
    arcgisSwipe?.trailingLayers?.add(sbs_drone_image2);
  });

  return (
    <>
      <arcgis-swipe
        referenceElement="arcgis-map"
        direction="horizontal"
        swipe-position="25"
      ></arcgis-swipe>
    </>
  );
}
