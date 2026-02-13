import { dateTable, isfLayer, lotLayer, structureLayer } from "./layers";
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
  handedOverDateField,
  handedOverYearField,
  station1Field,
  lotTypeField,
  lot_id_field,
  structureIdField,
  structureRemarksField,
} from "./uniqueValues";

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
  contractp: any,
  landtype: any,
  landsection: any,
) {
  const qCP = `${cpField} = '` + contractp + "'";
  const qLandType = `${lotTypeField} = '` + landtype + "'";
  const qCpLandType = qCP + " AND " + qLandType;
  const qLandSection = `${station1Field} = '` + landsection + "'";
  const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;

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

  if (!contractp) {
    query.where = "1=1";
  } else if (contractp && !landtype && !landsection) {
    query.where = qCP;
  } else if (contractp && landtype && !landsection) {
    query.where = qCpLandType;
  } else {
    query.where = qCpLandTypeSection;
  }

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
  query.returnGeometry = true;

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

export async function generateLotProgress(
  yearSelected: any,
  contractp: any,
  landtype: any,
  landsection: any,
) {
  const total_count_handover = new StatisticDefinition({
    onStatisticField: handedOverDateField,
    outStatisticFieldName: "total_count_handover",
    statisticType: "count",
  });

  // console.log(yearSelected, contractp, landtype, landsection);
  // let year;
  const years = Number(yearSelected);

  const query = lotLayer.createQuery();
  query.outStatistics = [total_count_handover];
  const qStatus = `${handedOverDateField} IS NOT NULL`;
  const qYear = `${handedOverYearField} = ` + years;
  const qCP = `${cpField} = '` + contractp + "'";
  const qYearCp = qYear + " AND " + qCP;
  const qLandType = `${lotTypeField} = '` + landtype + "'";
  const qCpLandType = qCP + " AND " + qLandType;
  const qYearCpLandType = qYear + " AND " + qCpLandType;
  const qLandSection = `${station1Field} = '` + landsection + "'";
  const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;
  const qYearCpLandTypeSection = qYear + " AND " + qCpLandTypeSection;

  // When year is undefined,
  if (!years && !contractp) {
    console.log(qStatus);
    query.where = qStatus;
  } else if (!years && contractp && !landtype) {
    query.where = qStatus + " AND " + qCP;
  } else if (!years && contractp && landtype && !landsection) {
    query.where = qStatus + " AND " + qCpLandType;
  } else if (!years && contractp && landtype && landsection) {
    query.where = qStatus + " AND " + qCpLandTypeSection;

    // When year is defined,
  } else if (years && !contractp) {
    query.where = qStatus + " AND " + qYear;
  } else if (years && contractp && !landtype && !landsection) {
    query.where = qStatus + " AND " + qYearCp;
  } else if (years && contractp && landtype && !landsection) {
    query.where = qStatus + " AND " + qYearCpLandType;
  } else if (years && contractp && landtype && landsection) {
    query.where = qStatus + " AND " + qYearCpLandTypeSection;
  }

  query.outFields = [handedOverDateField];
  query.orderByFields = [handedOverDateField];
  query.groupByFieldsForStatistics = [handedOverDateField];

  return lotLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    console.log(stats);
    const data = stats.map((result: any) => {
      const attributes = result.attributes;
      const date = attributes.HandOverDate;
      const count = attributes.total_count_handover;

      // compile in object array
      return Object.assign({
        date: date,
        value: count,
      });
    });

    return data;
  });
}

export async function generateMissingDatesHandedOver(
  yearSelected: any,
  contractp: any,
  landtype: any,
  landsection: any,
) {
  const total_count_handover = new StatisticDefinition({
    onStatisticField: `CASE WHEN ${handedOverField} = 1 THEN 1 ELSE 0 END`,
    outStatisticFieldName: "total_count_handover",
    statisticType: "sum",
  });

  // let year;
  const years = Number(yearSelected);

  const query = lotLayer.createQuery();
  query.outStatistics = [total_count_handover];
  // eslint-disable-next-line no-useless-concat
  const qStatus = `${handedOverDateField} IS NULL`;
  // const qYear = 'HandedOverYear = ' + years;
  const qCP = `${cpField} = '` + contractp + "'";
  const qLandType = `${lotTypeField} = '` + landtype + "'";
  const qCpLandType = qCP + " AND " + qLandType;
  const qLandSection = `${station1Field} = '` + landsection + "'";
  const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;

  // When year is undefined,
  if (!years && !contractp) {
    query.where = qStatus;
  } else if (!years && contractp && !landtype) {
    query.where = qStatus + " AND " + qCP;
  } else if (!years && contractp && landtype && !landsection) {
    query.where = qStatus + " AND " + qCpLandType;
  } else if (!years && contractp && landtype && landsection) {
    query.where = qStatus + " AND " + qCpLandTypeSection;

    // When year is defined,
  } else if (years) {
    query.where = qStatus;
  }

  return lotLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features[0].attributes;
    const value = stats.total_count_handover;
    return value;
  });
}

// Structure
export async function generateStructureData(
  contractp: any,
  landtype: any,
  landsection: any,
) {
  const qCP = `${cpField} = '` + contractp + "'";
  const qLandType = `${lotTypeField} = '` + landtype + "'";
  const qCpLandType = qCP + " AND " + qLandType;
  const qLandSection = `${station1Field} = '` + landsection + "'";
  const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;

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

  if (!contractp) {
    query.where = "1=1";
  } else if (contractp && !landtype && !landsection) {
    query.where = qCP;
  } else if (contractp && landtype && !landsection) {
    query.where = qCpLandType;
  } else {
    query.where = qCpLandTypeSection;
  }

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

// export async function popupStructureData(lotid: any) {
//   const total_count = new StatisticDefinition({
//     onStatisticField: 'OBJECTID',
//     outStatisticFieldName: 'total_count',
//     statisticType: 'count',
//   });
//   const query = structureLayer.createQuery();
//   // query.outFields = [lotIdStructureField];
//   query.outStatistics = [total_count];
//   const query_def = `${lotIdStructureField} = '` + lotid + "'";

//   query.where = query_def;
//   return structureLayer.queryFeatures(query).then((response: any) => {
//     const stats = response.features[0].attributes;
//     const count_structures = stats.total_count;
//     return count_structures;
//   });
// }

// Structure For Permit-to-Enter
export async function generateStrucNumber() {
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
  contractp: any,
  landtype: any,
  landsection: any,
) {
  const qCP = `${cpField} = '` + contractp + "'";
  const qLandType = `${lotTypeField} = '` + landtype + "'";
  const qCpLandType = qCP + " AND " + qLandType;
  const qLandSection = `${station1Field} = '` + landsection + "'";
  const qCpLandTypeSection = qCpLandType + " AND " + qLandSection;

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

  if (!contractp) {
    query.where = "1=1";
  } else if (contractp && !landtype && !landsection) {
    query.where = qCP;
  } else if (contractp && landtype && !landsection) {
    query.where = qCpLandType;
  } else {
    query.where = qCpLandTypeSection;
  }

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

export async function generateIsfNumber() {
  const total_isf = new StatisticDefinition({
    onStatisticField: statusIsfField,
    outStatisticFieldName: "total_isf",
    statisticType: "count",
  });

  const query = isfLayer.createQuery();
  query.outStatistics = [total_isf];
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
