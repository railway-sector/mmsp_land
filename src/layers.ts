import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";

import {
  SimpleMarkerSymbol,
  TextSymbol,
  SimpleLineSymbol,
} from "@arcgis/core/symbols";
import {
  colorIsf,
  colorStructure,
  statusLotLabel,
  statusLotColor,
  statusIsf,
  statusStructure,
  statusIsfLabel,
  statusStructureDemolish,
  statusStructureDemolishLabel,
  statusStructureDemolishColor,
  land_portalItem_id,
  alignment_portalItem_id,
  portal_url,
  lot_layer_title,
  lot_id_field,
  lotStatusField,
  handedOverField,
} from "./uniqueValues";

/* Standalone table for Dates */
export const dateTable = new FeatureLayer({
  portalItem: {
    id: "a084d9cae5234d93b7aa50f7eb782aec",
    portal: portal_url,
  },
});

/* Station Box */
const stationBoxRenderer = new UniqueValueRenderer({
  field: "Layer",
  uniqueValueInfos: [
    {
      value: "U-Shape Retaining Wall",
      symbol: new SimpleFillSymbol({
        color: [104, 104, 104],
        style: "backward-diagonal",
        outline: {
          width: 1,
          color: "black",
        },
      }),
    },
    {
      value: "Cut & Cover Box",
      symbol: new SimpleFillSymbol({
        color: [104, 104, 104],
        style: "backward-diagonal",
        outline: {
          width: 1,
          color: "black",
        },
      }),
    },
    {
      value: "TBM Shaft",
      symbol: new SimpleFillSymbol({
        color: [104, 104, 104],
        style: "backward-diagonal",
        outline: {
          width: 1,
          color: "black",
        },
      }),
    },
    {
      value: "TBM",
      symbol: new SimpleFillSymbol({
        color: [178, 178, 178],
        style: "backward-diagonal",
        outline: {
          width: 0.5,
          color: "black",
        },
      }),
    },
    {
      value: "Station Platform",
      symbol: new SimpleFillSymbol({
        color: [240, 204, 230],
        style: "backward-diagonal",
        outline: {
          width: 0.4,
          color: "black",
        },
      }),
    },
    {
      value: "Station Box",
      symbol: new SimpleFillSymbol({
        color: [0, 0, 0, 0],
        outline: {
          width: 2,
          color: "red",
        },
      }),
    },
    {
      value: "NATM",
      symbol: new SimpleFillSymbol({
        color: [178, 178, 178, 0],
        style: "backward-diagonal",
        outline: {
          width: 0.5,
          color: "grey",
        },
      }),
    },
  ],
});

export const stationBoxLayer = new FeatureLayer({
  portalItem: {
    id: alignment_portalItem_id,
    portal: portal_url,
  },
  layerId: 2,
  renderer: stationBoxRenderer,
  minScale: 150000,
  maxScale: 0,
  title: "Station Box",
  // outFields: ['*'],
  popupEnabled: false,
  elevationInfo: {
    mode: "on-the-ground",
  },
});

const stationBoxRendererOldSenate = new UniqueValueRenderer({
  field: "Layer",
  uniqueValueInfos: [
    {
      value: "Station Platform",
      symbol: new SimpleFillSymbol({
        color: [168, 168, 20],
        style: "solid",
        outline: {
          width: 0.7,
          color: "#6e6e6e",
        },
      }),
    },
    {
      value: "Station Box",
      symbol: new SimpleFillSymbol({
        color: [45, 126, 135, 30],
        style: "solid",
        outline: {
          width: 0.7,
          color: "#6e6e6e",
        },
      }),
    },
  ],
});

export const senateStationBoxOld = new FeatureLayer({
  portalItem: {
    id: "791f47c19d054cf88dd85fa5a4b4c991",
    portal: portal_url,
  },
  layerId: 25,
  renderer: stationBoxRendererOldSenate,
  minScale: 150000,
  maxScale: 0,
  title: "Senate Old Station Box",
  // outFields: ['*'],
  popupEnabled: false,
  elevationInfo: {
    mode: "on-the-ground",
  },
});

/* Land */

const lotLayerUniquValueInfos: any = statusLotLabel.map(
  (status: any, index: any) => {
    return Object.assign({
      value: index + 1,
      label: status,
      symbol: new SimpleFillSymbol({
        color: statusLotColor[index],
      }),
    });
  },
);

const lotLayerStatusRenderer = new UniqueValueRenderer({
  field: lotStatusField,
  // defaultSymbol: defaultSymbolLot,
  uniqueValueInfos: lotLayerUniquValueInfos,
});

const lotLabel = new LabelClass({
  symbol: new TextSymbol({
    color: "black",
    font: {
      size: 8,
    },
  }),
  // labelPlacement: 'above-center',
  labelExpressionInfo: {
    expression: "$feature.CN",
  },
});

export const lotLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 8,
  outFields: [lot_id_field, lotStatusField],
  title: lot_layer_title,
  labelingInfo: [lotLabel],
  renderer: lotLayerStatusRenderer,
  // popupEnabled: false,
  popupTemplate: {
    title: "<p>{Id}</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "OWNER",
            label: "Land Owner",
          },
          {
            fieldName: "Station1",
          },
          {
            fieldName: "StatusNVS3",
            label: "<p>Status of Land Acquisition</p>",
          },
        ],
      },
    ],
  },
});

/* Public Land */
const publicLotRenderer = new UniqueValueRenderer({
  valueExpression: "When($feature.StatusNVS3 > 0, 'withStatus', 'publicLands')",
  uniqueValueInfos: [
    {
      value: "withStatus",
      symbol: null,
    },
    {
      value: "publicLands",
      symbol: new SimpleFillSymbol({
        color: "#d8cdcdff",
        style: "diagonal-cross",
        outline: {
          width: 1,
          color: "#d8cdcdff",
        },
      }),
    },
  ],
});

export const publicLotLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 8,
  outFields: [lot_id_field, lotStatusField],
  title: "Public Lot",
  labelingInfo: [lotLabel],
  renderer: publicLotRenderer,
  definitionExpression: "StatusNVS3 IS NULL",
  // popupEnabled: false,
  popupTemplate: {
    title: "<p>{Id}: Public Land</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "OWNER",
            label: "Land Owner",
          },
          {
            fieldName: "Station1",
          },
          {
            fieldName: "StatusNVS3",
            label: "<p>Status of Land Acquisition</p>",
          },
        ],
      },
    ],
  },
});

/* Lot boundary only */
const lotLayerBoundaryRenderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    style: "solid",
    outline: {
      color: [110, 110, 110],
      width: 1.5,
    },
  }),
});

const lotLayerBoundaryLabel = new LabelClass({
  symbol: new TextSymbol({
    color: "white",
    font: {
      // autocast as new Font()
      family: "Gill Sans",
      size: 8,
    },
  }),
  // labelPlacement: 'above-center',
  labelExpressionInfo: {
    expression: "$feature.CN",
  },
});

export const lotLayerBoundary = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 8,
  // outFields: ['*'],
  title: "Lot Boundary",
  renderer: lotLayerBoundaryRenderer,
  labelingInfo: [lotLayerBoundaryLabel],
});

/* Handed-Over Lot */
const handedOverRenderer = new UniqueValueRenderer({
  field: handedOverField,
  // defaultSymbol: defaultSymbolLot,
  // uniqueValueInfos: [
  //   {
  //     value: 1,
  //     label: 'Handed-Over',
  //     symbol: new SimpleFillSymbol({
  //       color: '#FF00C5',
  //       style: 'solid',
  //       outline: new SimpleLineSymbol({
  //         color: [110, 110, 110],
  //         width: 0.5,
  //       }),
  //     }),
  //   },
  // ],
  uniqueValueInfos: [
    {
      value: 1,
      label: "Handed-Over",
      symbol: new SimpleFillSymbol({
        color: [0, 255, 255, 0.3], //[0, 255, 255, 0.1], #00ffff
        outline: new SimpleLineSymbol({
          color: "#00ffff",
          width: "4px",
        }),
      }),
    },
  ],
});

export const handedOverLotLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 8,
  // outFields: ['*'],
  // definitionExpression: "HandedOver = 1 AND Type = 'Station'",
  // title: 'Handed-Over (Station)',
  definitionExpression: `${handedOverField} = 1`,
  title: "Handed-Over Lots",
  renderer: handedOverRenderer,
  popupEnabled: false,
});
handedOverLotLayer.listMode = "hide";

/* Handed-Over Subterranean Lot */
// const pteSubterraneanRenderer = new SimpleRenderer({
//   symbol: new SimpleFillSymbol({
//     color: '#FF00C5',
//     style: 'solid',
//     outline: new SimpleLineSymbol({
//       color: [110, 110, 110],
//       width: 0.5,
//     }),
//   }),
// });

// const pteSubterraneanRenderer = new UniqueValueRenderer({
//   field: 'Type',
//   defaultSymbol: defaultSymbolLot,
//   uniqueValueInfos: [
//     {
//       value: 1,
//       label: 'PTE',
//       symbol: new SimpleFillSymbol({
//         color: '#FF00C5',
//         style: 'solid',
//         outline: new SimpleLineSymbol({
//           color: [110, 110, 110],
//           width: 0.5,
//         }),
//       }),
//     },
//   ],
// });

// export const pteLotSubteLayer = new FeatureLayer({
//   portalItem: {
//     id: land_portalItem_id,
//     portal: portal_url,
//   },
//   layerId: 8,
//   definitionExpression: "HandedOver = 1 AND Type = 'Subterranean'",
//   // definitionExpression: "Type = 'Subterranean'",
//   title: 'PTE (Subterranean)',
//   renderer: pteSubterraneanRenderer,
//   popupEnabled: false,
// });

/* Handed-Over Subterranean Lot for PTE summary */
export const pteLotSubteLayer1 = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 8,
  // outFields: ['*'],
  // eslint-disable-next-line no-useless-concat
  definitionExpression: "Type = 'Subterranean'",
});

/* Structure Layer */
const defaultLotSymbolBoundary = new SimpleFillSymbol({
  color: [0, 0, 0, 0],
  style: "solid",
  outline: {
    style: "short-dash",
    color: [215, 215, 158],
    width: 1.5,
  },
});

const structureLayerUniquValueInfos: any = statusStructure.map(
  (status: any, index: any) => {
    return Object.assign({
      value: index + 1,
      label: status,
      symbol: new SimpleFillSymbol({
        color: colorStructure[index],
        style: "backward-diagonal",
        outline: {
          color: "#6e6e6e",
          width: 0.7,
        },
      }),
    });
  },
);

export const structureLayerRenderer = new UniqueValueRenderer({
  field: "Status",
  defaultSymbol: defaultLotSymbolBoundary,
  uniqueValueInfos: structureLayerUniquValueInfos,
});

export const structureLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 9,
  // portalItem: {
  //   id: 'c3755225948646a0b486397768492951',
  // },
  // layerId: 1,
  title: "Existing Structure",
  // outFields: ['*'],
  renderer: structureLayerRenderer,
  popupTemplate: {
    title: "Structure ID: <b>{STRUCTURE_TAG_NO_}</b>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "STATION",
            label: "Station",
          },
          {
            fieldName: "Status",
            label: "<b>Status of Structure</b>",
          },
          {
            fieldName: "LOT_OWNER",
            label: "Lot Owner",
          },
        ],
      },
    ],
  },
});

/* Structure Demolished Layer */
const structureDemolishUniqueValueInfos = statusStructureDemolish.map(
  (status: any, index: any) => {
    return Object.assign({
      value: status,
      label: statusStructureDemolishLabel[index],
      symbol: new SimpleFillSymbol({
        color: statusStructureDemolishColor[index],
        style: "solid",
        outline: {
          color: "#6E6E6E",
          width: 0.7,
        },
      }),
    });
  },
);
const structureDemolishedRenderer = new UniqueValueRenderer({
  field: "REMARKS",
  defaultSymbol: defaultLotSymbolBoundary, // autocasts as new SimpleFillSymbol()
  uniqueValueInfos: structureDemolishUniqueValueInfos,
});

export const structureDemolishedLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 9,
  title: "Demolished Structure",
  // outFields: ['*'],
  renderer: structureDemolishedRenderer,
  popupTemplate: {
    title: "Structure ID: <b>{STRUCTURE_TAG_NO_}</b>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "STATION",
            label: "Station",
          },
          {
            fieldName: "Status",
            label: "<b>Status of Structure</b>",
          },
          {
            fieldName: "LOT_OWNER",
            label: "Lot Owner",
          },
        ],
      },
    ],
  },
});

/* ISF Layer */
const isfRendererUniqueValueInfos = statusIsf.map((status: any, index: any) => {
  return Object.assign({
    value: status,
    label: statusIsfLabel[index],
    symbol: new SimpleMarkerSymbol({
      size: 9,
      color: colorIsf[index],
      outline: {
        width: 1.5,
        color: "white",
      },
    }),
  });
});
const isfRenderer = new UniqueValueRenderer({
  field: "RELOCATION",
  uniqueValueInfos: isfRendererUniqueValueInfos,
});

export const isfLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 10,
  title: "ISF (Informal Settlers Families)",
  // outFields: ['*'],
  renderer: isfRenderer,
  labelsVisible: false,
  popupTemplate: {
    title: "<p>{Id}</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "Package",
            label: "CP",
          },
          {
            fieldName: "Station1",
            label: "Station",
          },
          {
            fieldName: "RELOCATION",
            label: "Status",
          },
        ],
      },
    ],
  },
});

/* Construction Boundary */
const ConstructionBoundaryFill = new UniqueValueRenderer({
  field: "MappingBoundary",
  uniqueValueInfos: [
    {
      value: 1,
      label: "",
      symbol: new SimpleFillSymbol({
        // color: [0, 0, 0, 0],
        style: "none",
        outline: {
          width: 2.5,
          color: [255, 255, 255],
          style: "short-dash",
        },
      }),
    },
  ],
});

export const constructionBoundaryLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 4,
  // outFields: ['*'],
  renderer: ConstructionBoundaryFill,
  definitionExpression: "MappingBoundary = 1",
  title: "Construction Boundary",
  elevationInfo: {
    mode: "on-the-ground",
  },
  popupEnabled: false,
});

const senateConstructionBoundaryFillOld = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [148, 57, 38, 30],
    style: "solid",
    outline: {
      width: 1,
      color: "#6e6e6e",
    },
  }),
});

export const senateConstructionBoundaryLayerOld = new FeatureLayer({
  portalItem: {
    id: "791f47c19d054cf88dd85fa5a4b4c991",
    portal: portal_url,
  },
  layerId: 24,
  // outFields: ['*'],
  renderer: senateConstructionBoundaryFillOld,
  title: "Senate Old Construction Boundary",
  elevationInfo: {
    mode: "on-the-ground",
  },
  popupEnabled: false,
});

/* Alignment Line */
export const alignmentLine = new FeatureLayer({
  portalItem: {
    id: alignment_portalItem_id,
    portal: portal_url,
  },
  layerId: 6,
  // outFields: ['*'],
  title: "Alignment",
  popupEnabled: false,
});

/* Segment DPWH */
export const dpwhSegmentLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 2,
  title: "DPWH Segment",
  // outFields: ['*'],
  popupEnabled: false,
});

/* Depot Building */
export const depotBuildingLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 6,
  title: "Depot Building",
  // outFields: ['*'],
  popupEnabled: false,
});

/* BSS Building */
export const bssDepotBuildingLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 7,
  title: "BSS Building",
  // outFields: ['*'],
  popupEnabled: false,
});

/* East Valenzuela */
const evs_station_renderer = new UniqueValueRenderer({
  field: "Layer",
  uniqueValueInfos: [
    {
      value: "Station Building",
      label: "Station Building",
      symbol: new SimpleFillSymbol({
        style: "none",
        outline: {
          style: "long-dash",
          width: 1.5,
          color: [225, 225, 225],
        },
      }),
    },
    {
      value: "Station Plaza",
      label: "Station Plaza",
      symbol: new SimpleFillSymbol({
        color: [60, 175, 153],
        // style: 'cross',
        outline: {
          width: 1,
          color: [225, 225, 225],
        },
      }),
    },
    {
      value: "Cross Road Box",
      label: "Cross Road Box",
      symbol: new SimpleFillSymbol({
        color: [168, 56, 0],
        outline: {
          width: 1,
          color: [225, 225, 225],
        },
      }),
    },
    {
      value: "Platform",
      label: "Platform",
      symbol: new SimpleFillSymbol({
        color: "pink",
        style: "backward-diagonal",
        outline: {
          width: 1,
          color: [225, 225, 225],
          style: "solid",
        },
      }),
    },
  ],
});

export const evsLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 1,
  title: "East Valenzuela Station",
  renderer: evs_station_renderer,
  // outFields: ['*'],
  popupEnabled: false,
});

/* NNC Construction boundary (Senate) */
export const senateBoundaryLayer = new FeatureLayer({
  portalItem: {
    id: land_portalItem_id,
    portal: portal_url,
  },
  layerId: 5,
  title: "NCC Property",
  // outFields: ['*'],
  popupEnabled: false,
});

/* Station Layer */
const stationLabels = new LabelClass({
  labelExpressionInfo: { expression: "$feature.Station1" },
  symbol: {
    type: "text",
    color: "black",
    haloColor: "white",
    haloSize: 1,
    font: {
      size: 10,
      weight: "bold",
    },
  },
});

export const stationLayer = new FeatureLayer({
  portalItem: {
    id: alignment_portalItem_id,
    portal: portal_url,
  },
  layerId: 1,
  labelingInfo: [stationLabels],
  title: "Station",
  definitionExpression: "Project = 'MMSP'",
  //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
});
stationLayer.listMode = "hide";

export const creekDivLayer = new FeatureLayer({
  portalItem: {
    id: alignment_portalItem_id,
    portal: portal_url,
  },
  layerId: 3,
  title: "Creek Diversion",
  // outFields: ['*'],
  popupEnabled: false,
});

// Road options at Valenzuela station
export const accessRoadOptionsLayer1 = new FeatureLayer({
  portalItem: {
    id: "13884f85dd674e12a2128131098eaa0f",
    portal: portal_url,
  },
  layerId: 3,
  title: "Access Road Option 1",
  // outFields: ['*'],
  popupEnabled: false,
});

export const accessRoadOptionsLayer2 = new FeatureLayer({
  portalItem: {
    id: "13884f85dd674e12a2128131098eaa0f",
    portal: portal_url,
  },
  layerId: 2,
  title: "Access Road Option 2",
  // outFields: ['*'],
  popupEnabled: false,
});

export const accessRoadOptionsLayer3 = new FeatureLayer({
  portalItem: {
    id: "13884f85dd674e12a2128131098eaa0f",
    portal: portal_url,
  },
  layerId: 1,
  title: "Access Road Option 3",
  // outFields: ['*'],
  popupEnabled: false,
});

export const accessRoadOptionsLayer4 = new FeatureLayer({
  portalItem: {
    id: "13884f85dd674e12a2128131098eaa0f",
    portal: portal_url,
  },
  layerId: 0,
  title: "Access Road Option 4",
  // outFields: ['*'],
  popupEnabled: false,
});

// Group Layer
export const accessRoadOptionsGroupLayer = new GroupLayer({
  title: "Ortigas Station",
  visible: true,
  visibilityMode: "independent",
  layers: [
    accessRoadOptionsLayer4,
    accessRoadOptionsLayer3,
    accessRoadOptionsLayer2,
    accessRoadOptionsLayer1,
  ],
});

export const lotGroupLayer = new GroupLayer({
  title: "Land",
  visible: true,
  visibilityMode: "independent",
  layers: [publicLotLayer, lotLayer],
});

export const evsBoundaryPoGroupLayer = new GroupLayer({
  title: "East Valenzuela Station",
  visible: true,
  visibilityMode: "independent",
  layers: [creekDivLayer, evsLayer],
});

export const boundaryGroupLayer = new GroupLayer({
  title: "Boundary",
  visible: true,
  visibilityMode: "independent",
  layers: [
    senateConstructionBoundaryLayerOld,
    senateStationBoxOld,
    senateBoundaryLayer,
    dpwhSegmentLayer,
    stationBoxLayer,
    constructionBoundaryLayer,
  ],
});

export const depotBuildingsGroupLayer = new GroupLayer({
  title: "Depot Buildings",
  visible: true,
  visibilityMode: "independent",
  layers: [depotBuildingLayer, bssDepotBuildingLayer],
});

export const structuresGroupLayer = new GroupLayer({
  title: "Structures",
  visible: false,
  visibilityMode: "independent",
  layers: [structureLayer, structureDemolishedLayer],
});
