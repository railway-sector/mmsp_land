import { useEffect, useState } from "react";

import { dateUpdate } from "../Query";
import { DropdownData } from "./DropdownContext";

function Header() {
  const [asOfDate, setAsOfDate] = useState(null);

  useEffect(() => {
    dateUpdate().then((response) => {
      setAsOfDate(response);
    });
  }, []);

  return (
    <>
      <header
        slot="header"
        id="header-title"
        style={{
          display: "flex",
          height: "70px",
          padding: "0 1rem",
          borderStyle: "solid",
          borderRightWidth: 5,
          borderLeftWidth: 5,
          borderBottomWidth: 4,
          borderTopWidth: 5,
          borderColor: "#555555",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/Projec_Logo/DOTr_Logo_v2.png"
          alt="DOTr Logo"
          height={"55px"}
          width={"55px"}
          style={{ marginBottom: "auto", marginTop: "auto" }}
        />
        <b className="headerTitle">MMSP LAND</b>
        <div className="date">{!asOfDate ? "" : "As of " + asOfDate}</div>

        {/* Dropdown component */}
        <DropdownData />

        <img
          src="https://EijiGorilla.github.io/Symbols/Projec_Logo/MMSP.png"
          alt="GCR Logo"
          height={"50px"}
          width={"75px"}
          style={{
            marginBottom: "auto",
            marginTop: "auto",
            marginLeft: "auto",
            marginRight: "5rem",
          }}
        />
      </header>
    </>
  );
}

export default Header;
