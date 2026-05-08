/* eslint-disable react-hooks/rules-of-hooks */
import {
  dateTable,
  lotDefaultSymbol,
  lotLayer,
  lotLayerUniquValueInfos,
} from "./layers";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";

//----------------------------------------//
//------ Symbology of lot layer ----------//
//----------------------------------------//
export function updateLotSymbology(new_date_field: any) {
  try {
    const lotLayerRenderer = new UniqueValueRenderer({
      field: new_date_field,
      defaultSymbol: lotDefaultSymbol, // autocasts as new SimpleFillSymbol()
      uniqueValueInfos: lotLayerUniquValueInfos,
    });
    lotLayer.renderer = lotLayerRenderer;
  } catch (error) {
    console.error("Error fetching data from FeatureServer:", error);
  }
}

//----------------------------------------//
//              As of Date                 //
//----------------------------------------//
export async function dateUpdate() {
  const monthList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // For updating date

  const query = dateTable.createQuery();
  query.where = "category = 'Land Acquisition'";

  return dateTable.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const dates = stats.map((result: any) => {
      const date = new Date(result.attributes.date);
      const year = date.getFullYear();
      const month = monthList[date.getMonth()];
      const day = date.getDate();
      const as_of_date = year < 1990 ? "" : `${month} ${day}, ${year}`;
      return [as_of_date, date];
    });
    return dates;
  });
}

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    const num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }
}

export function zoomToLayer(layer: any, view: any) {
  return layer.queryExtent().then((response: any) => {
    view
      ?.goTo(response.extent, {
        //response.extent
        //speedFactor: 2,
      })
      .catch(function (error: any) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });
  });
}
