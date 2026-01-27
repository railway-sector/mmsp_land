import Collection from "@arcgis/core/core/Collection";
import ActionButton from "@arcgis/core/support/actions/ActionButton";
const arcgisMap = document.querySelector("arcgis-map");

// Lot
export const lot_id_field = "Id";
export const lot_layer_title = "Acquisition Status";
export const lotStatusField = "StatusNVS3";
export const handedOverField = "HandedOver";
export const handedOverDateField = "HandOverDate";
export const handedOverYearField = "HandedOverYear";
export const cpField = "Package";
export const lotTypeField = "Type";
export const station1Field = "Station1";
export const remarksField = "REMARKS";
export const lotIssueListField = "Issue";
export const statusLotLabel = [
  "Paid",
  "For Payment Processing",
  "For Legal Pass",
  "For Appraisal/Offer to Buy",
  "For Expro",
  "with WOP Fully Turned-over",
  "ROWUA/TUA",
  "Signed ROWUA/TUA",
];

export const statusLotColor = [
  "#70ad47", // Paid
  "#0070ff", // For Payment Processing
  "#ffff00", // For Legal Pass
  "#ffaa00", // For Appraisal/Offer to Buy
  "#ff0000", // For Expro
  "#00734c", // With WOP...
  "#55ff00", // ROWUA/TUA
  "#0D98BA", // Signed ROWUA/TUA
];

export const statusLotQuery = statusLotLabel.map((status, index) => {
  return Object.assign({
    category: status,
    value: index + 1,
    color: statusLotColor[index],
  });
});

// Lot MOA
export const statusLotMoaField = "S_MOA";
export const statusMOA = ["1-NVS", "2-Expropriation", "3-ROWUA"];
export const statusLotMoaQuery = statusMOA.map((status, index) => {
  return Object.assign({
    category: status,
    value: index + 1,
  });
});

// Structure
export const structureIdField = "Id";
export const lotIdStructureField = "LotID";
export const statusStructureField = "Status";
export const structureRemarksField = "REMARKS";
export const statusStructure = [
  "Paid",
  "For Payment Processing",
  "For Legal Pass",
  "For Appraisal/Offer to Buy",
  "For Expro",
  "Quit Claim",
];

export const colorStructure = [
  [112, 173, 71], // Paid #70AD47
  [0, 112, 255], // For Payment Processing #0070FF
  [255, 255, 0], // For Legal Pass #FFFF00
  [255, 170, 0], // For Appraisal/Offer to Compensate #FFAA00
  [255, 0, 0], // For Expro #FF0000
  [0, 115, 76], //Quit Claim #00734C
];

export const colorStructureHex = [
  "#70AD47",
  "#0070FF",
  "#FFFF00",
  "#FFAA00",
  "#FF0000",
  "#00734C",
];

export const statusStructureQuery = statusStructure.map((status, index) => {
  return Object.assign({
    category: status,
    value: index + 1,
    color: colorStructureHex[index],
  });
});

// Structure demolished
export const statusStructureDemolish = ["Demolished", "Not Yet"];
export const statusStructureDemolishLabel = ["Demolished", "Occupied"];
export const statusStructureDemolishColor = ["#FFAA00", "#99A5A2"];

// Structure MOA
export const statusMoaStructure = ["1-NVS", "2-Expropriation", "3-ROWUA"];

// ISF
export const statusIsfField = "RELOCATION";
export const statusIsf = ["UNRELOCATED", "RELOCATED", "SELF-RELOCATED"];
export const statusIsfLabel = ["Unrelocated", "Relocated", "Self-Relocated"];
export const colorIsf = ["#FF0000", "#267300", "#0070ff"];
export const statusIsfQuery = statusIsf.map((status, index) => {
  return Object.assign({
    category: status,
    value: statusIsf[index],
    color: colorIsf[index],
  });
});

// Feautre layer portalItem id:
// ArcGIS Portal portalItem id:------------
// land_structure: '0c172b82ddab44f2bb439542dd75e8ae'
// alignment: '52d4f29105934e3f95f6b39c7e5fba6e'

// AGOL portalItem id:-------------
// land_structure: '6223b2e0805f441a995e6eb72ce16c02'
// alignment: 'b5a8becc6c1a4d4ba093b960fdfe23d8'
export const land_portalItem_id = "0c172b82ddab44f2bb439542dd75e8ae";
export const alignment_portalItem_id = "52d4f29105934e3f95f6b39c7e5fba6e";
export const portal_url = { url: "https://gis.railway-sector.com/portal" };

// Chart and chart label color
export const primaryLabelColor = "#9ca3af";
export const valueLabelColor = "#d1d5db";

// Layter list
export async function defineActions(event) {
  const { item } = event;

  if (item.layer.type !== "group") {
    item.panel = {
      content: "legend",
      open: true,
    };
  }

  item.title === "Existing Structure" ||
  item.title === "Demolished Structure" ||
  item.title === "ISF (Informal Settlers Families)" ||
  item.title === "Senate-DepEd Boundary" ||
  // item.title === 'PTE Subterranean Lots' ||
  // item.title === 'Handed-Over Lots' ||
  item.title === "Structures"
    ? (item.visible = false)
    : (item.visible = true);
}
