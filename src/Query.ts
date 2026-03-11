/* eslint-disable react-hooks/rules-of-hooks */
import {
  dateTable,
  handedOverLotLayer,
  isfLayer,
  lotLayer,
  publicLotLayer,
  structureLayer,
} from "./layers";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import * as am5 from "@amcharts/amcharts5";
import {
  statusLotLabel,
  statusIsf,
  statusStructure,
  lotStatusField,
  statusLotQuery,
  statusStructureField,
  statusIsfQuery,
  statusIsfField,
  cpField,
  handedOverField,
  station1Field,
  lotTypeField,
  lot_id_field,
  structureIdField,
  structureRemarksField,
} from "./uniqueValues";

// Query function for lotLayer
export const queryDropdownTypes = (
  contractcp: any,
  landtype: any,
  landsection: any,
) => {
  const qCP = `${cpField} = '` + contractcp + "'";
  const qLandType = `${lotTypeField} = '` + landtype + "'";
  const qCpLandType = qCP + " AND " + qLandType;
  const qLandSection = `${station1Field} = '` + landsection + "'";
  const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;

  return [qCP, qCpLandType, qCpLandTypeSection];
};

export function queryLayersExpression(
  contractcp: any,
  landtype: any,
  landsection: any,
  arcgisMap: any,
) {
  const typeExpression = queryDropdownTypes(contractcp, landtype, landsection);

  if (!contractcp) {
    lotLayer.definitionExpression = "1=1";
    handedOverLotLayer.definitionExpression = "1=1";
    publicLotLayer.definitionExpression = "1=1";
    structureLayer.definitionExpression = "1=1";
    isfLayer.definitionExpression = "1=1";
    // pteLotSubteLayer1.definitionExpression = '1=1';
  } else if (contractcp && !landtype && !landsection) {
    lotLayer.definitionExpression = typeExpression[0];
    handedOverLotLayer.definitionExpression = typeExpression[0];
    publicLotLayer.definitionExpression = typeExpression[0];
    structureLayer.definitionExpression = typeExpression[0];
    isfLayer.definitionExpression = typeExpression[0]; // pteLotSubteLayer1.definitionExpression = qCP;
  } else if (contractcp && landtype && !landsection) {
    lotLayer.definitionExpression = typeExpression[1];
    handedOverLotLayer.definitionExpression = typeExpression[1];
    publicLotLayer.definitionExpression = typeExpression[1];
    structureLayer.definitionExpression = typeExpression[1];
    isfLayer.definitionExpression = typeExpression[1];
    // pteLotSubteLayer1.definitionExpression = qCpLandType;
  } else {
    lotLayer.definitionExpression = typeExpression[2];
    handedOverLotLayer.definitionExpression = typeExpression[2];
    publicLotLayer.definitionExpression = typeExpression[2];
    structureLayer.definitionExpression = typeExpression[2];
    isfLayer.definitionExpression = typeExpression[3];
    // pteLotSubteLayer1.definitionExpression = qCpLandTypeSection;
  }

  zoomToLayer(lotLayer, arcgisMap);
  zoomToLayer(structureLayer, arcgisMap);
  zoomToLayer(isfLayer, arcgisMap);
}

export function queryStatisticsLayer(
  contractcp: any,
  landtype: any,
  landsection: any,
  queryField: any,
) {
  try {
    const typeExpression = queryDropdownTypes(
      contractcp,
      landtype,
      landsection,
    );
    let queryWhere: any;
    if (!contractcp) {
      queryWhere = !queryField ? "1=1" : queryField;
    } else if (contractcp && !landtype && !landsection) {
      queryWhere = !queryField
        ? typeExpression[0]
        : queryField + " AND " + typeExpression[0];
    } else if (contractcp && landtype && !landsection) {
      queryWhere = !queryField
        ? typeExpression[1]
        : queryField + " AND " + typeExpression[1];
    } else {
      queryWhere = !queryField
        ? typeExpression[2]
        : queryField + " AND " + typeExpression[2];
    }

    return queryWhere;
  } catch (error) {
    console.error("Error fetching data from FeatureServer:", error);
  }
}

// Updat date
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
      const final = year < 1990 ? "" : `${month} ${day}, ${year}`;
      return final;
    });
    return dates;
  });
}

// Lot
export async function generateLotData(
  contractcp: any,
  landtype: any,
  landsection: any,
) {
  const total_count = new StatisticDefinition({
    onStatisticField: lotStatusField,
    outStatisticFieldName: "total_count",
    statisticType: "count",
  });

  const query = lotLayer.createQuery();
  query.outFields = [lotStatusField];
  query.outStatistics = [total_count];
  query.orderByFields = [lotStatusField];
  query.groupByFieldsForStatistics = [lotStatusField];
  query.where = queryStatisticsLayer(
    contractcp,
    landtype,
    landsection,
    undefined,
  );

  return lotLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const data = stats.map((result: any) => {
      const attributes = result.attributes;
      const status_id = attributes.StatusNVS3;
      const count = attributes.total_count;
      return Object.assign({
        category: statusLotLabel[status_id - 1],
        value: count,
      });
    });

    const data1: any = [];
    statusLotLabel.map((status: any, index: any) => {
      const find = data.find((emp: any) => emp.category === status);
      const value = find === undefined ? 0 : find?.value;
      const object = {
        category: status,
        value: value,
        sliceSettings: {
          fill: am5.color(statusLotQuery[index].color),
        },
      };
      data1.push(object);
    });
    return data1;
  });
}

export async function generateLotNumber() {
  const total_lot_number = new StatisticDefinition({
    onStatisticField: lot_id_field,
    outStatisticFieldName: "total_lot_number",
    statisticType: "count",
  });

  const ononStatisticFieldValue =
    "CASE WHEN " + lotStatusField + " >=1 THEN 1 ELSE 0 END";
  const total_lot_pie = new StatisticDefinition({
    onStatisticField: ononStatisticFieldValue,
    outStatisticFieldName: "total_lot_pie",
    statisticType: "sum",
  });

  const query = lotLayer.createQuery();
  query.outStatistics = [total_lot_number, total_lot_pie];

  return lotLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features[0].attributes;
    const totalLotNumber = stats.total_lot_number;
    const totalPrivate = stats.total_lot_pie;
    const totalPublic = totalLotNumber - totalPrivate;
    return [totalLotNumber, totalPrivate, totalPublic];
  });
}

// Lot For Permit-to-Enter
export async function generateHandedOver() {
  const total_handedover_lot = new StatisticDefinition({
    onStatisticField: `CASE WHEN ${handedOverField} = 1 THEN 1 ELSE 0 END`,
    outStatisticFieldName: "total_handedover_lot",
    statisticType: "sum",
  });

  const total_lot_N = new StatisticDefinition({
    onStatisticField: lot_id_field,
    outStatisticFieldName: "total_lot_N",
    statisticType: "count",
  });

  const query = lotLayer.createQuery();
  query.outStatistics = [total_handedover_lot, total_lot_N];

  return lotLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features[0].attributes;
    const handedover = stats.total_handedover_lot;
    const totaln = stats.total_lot_N;
    const percent = ((handedover / totaln) * 100).toFixed(0);
    return [percent, handedover];
  });
}

// Structure
export async function generateStructureData(
  contractcp: any,
  landtype: any,
  landsection: any,
) {
  const total_count = new StatisticDefinition({
    onStatisticField: statusStructureField,
    outStatisticFieldName: "total_count",
    statisticType: "count",
  });

  const query = structureLayer.createQuery();
  query.outFields = [statusStructureField];
  query.outStatistics = [total_count];
  query.orderByFields = [statusStructureField];
  query.groupByFieldsForStatistics = [statusStructureField];
  query.where = queryStatisticsLayer(
    contractcp,
    landtype,
    landsection,
    undefined,
  );

  return structureLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const data = stats.map((result: any) => {
      const attributes = result.attributes;
      const status_id = attributes.Status;
      const count = attributes.total_count;
      return Object.assign({
        category: statusStructure[status_id - 1],
        value: count,
      });
    });

    const data1: any = [];
    statusStructure.map((status: any) => {
      const find = data.find((emp: any) => emp.category === status);
      const value = find === undefined ? 0 : find?.value;
      const object = {
        category: status,
        value: value,
      };
      data1.push(object);
    });
    return data1;
  });
}

// Structure For Permit-to-Enter
export async function generateStrucNumber(
  contractcp: any,
  landtype: any,
  landsection: any,
) {
  const total_demolished_structure = new StatisticDefinition({
    onStatisticField: `CASE WHEN ${structureRemarksField} = 'Demolished' THEN 1 ELSE 0 END`,
    outStatisticFieldName: "total_demolished_structure",
    statisticType: "sum",
  });

  const total_struc_forDemolished = new StatisticDefinition({
    onStatisticField: `CASE WHEN ${structureRemarksField} IS NOT NULL THEN 1 ELSE 0 END`,
    outStatisticFieldName: "total_struc_forDemolished",
    statisticType: "sum",
  });

  const total_struc_N = new StatisticDefinition({
    onStatisticField: structureIdField,
    outStatisticFieldName: "total_struc_N",
    statisticType: "count",
  });

  const total_pie_structure = new StatisticDefinition({
    onStatisticField: `CASE WHEN ${statusStructureField} >= 1 THEN 1 ELSE 0 END`,
    outStatisticFieldName: "total_pie_structure",
    statisticType: "sum",
  });

  const query = structureLayer.createQuery();

  query.outStatistics = [
    total_demolished_structure,
    total_struc_forDemolished,
    total_struc_N,
    total_pie_structure,
  ];
  query.where = queryStatisticsLayer(
    contractcp,
    landtype,
    landsection,
    undefined,
  );
  return structureLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features[0].attributes;
    const demolished = stats.total_demolished_structure;
    const totalnDemolished = stats.total_struc_forDemolished;
    const totaln = stats.total_struc_N;
    const totalpie = stats.total_pie_structure;
    const percDemolished = Number(
      ((demolished / totalnDemolished) * 100).toFixed(0),
    );
    return [percDemolished, demolished, totaln, totalpie];
  });
}

export async function generateIsfData(
  contractcp: any,
  landtype: any,
  landsection: any,
) {
  const total_count = new StatisticDefinition({
    onStatisticField: statusIsfField,
    outStatisticFieldName: "total_count",
    statisticType: "count",
  });

  const query = isfLayer.createQuery();
  query.outFields = [statusIsfField];
  query.outStatistics = [total_count];
  query.orderByFields = [statusIsfField];
  query.groupByFieldsForStatistics = [statusIsfField];
  query.where = queryStatisticsLayer(
    contractcp,
    landtype,
    landsection,
    undefined,
  );

  return isfLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const data = stats.map((result: any) => {
      const attributes = result.attributes;
      const status_id = attributes.RELOCATION;
      const count = attributes.total_count;
      return Object.assign({
        category: status_id,
        value: count,
      });
    });

    const data1: any = [];
    statusIsf.map((status: any, index: any) => {
      const find = data.find((emp: any) => emp.category === status);
      const value = find === undefined ? 0 : find?.value;
      const object = {
        category: status,
        value: value,
        sliceSettings: {
          fill: am5.color(statusIsfQuery[index].color),
        },
      };
      data1.push(object);
    });
    return data1;
  });
}

export async function generateIsfNumber(
  contractcp: any,
  landtype: any,
  landsection: any,
) {
  const total_isf = new StatisticDefinition({
    onStatisticField: statusIsfField,
    outStatisticFieldName: "total_isf",
    statisticType: "count",
  });

  const query = isfLayer.createQuery();
  query.outStatistics = [total_isf];
  query.where = queryStatisticsLayer(
    contractcp,
    landtype,
    landsection,
    undefined,
  );

  return isfLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features[0].attributes;
    const totalisf = stats.total_isf;

    return totalisf;
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
