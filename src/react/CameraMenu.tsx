import React, { useState } from "react";
import { moveCameraTo } from "../babylonBridge";

export const submenuData: Record<string, Record<string, string[]>> = {
  "FRONT SIDE": {
    "Lights & Light Covers": [
      "Hazard light is not working",
      "Headlight is not working",
      "Any lights are cracked (leaving a hole or void), missing, or not working properly"
    ],
    "Suspension & Exhaust System": [
      "Loose or hanging objects underneath the vehicle",
      "No,ceable leaning of the vehicle (when parked)"
    ],
    "Electric Vehicle (EV)": [
      "Orange wires are present in the charging port or cable. Warning High Voltage! Do Not Touch!"
    ],
    "Body & Doors": [
      "Items a[ached to the body of the vehicle (for example: bumpers and hood latches) are missing, damaged, loose, unsecure, hanging, or held with a zip-,e,tape, or similar"
    ],
  },
  "DRIVER SIDE": {
    "Back Tire, Wheel, & Rim": ["Tire has insufficient tread (Less than 2/32\ or 1.6mm) on inner most, middle, or outer most tread.", "Tire has objects, cuts, dents, swells, leaks, appears flat, or exposed wire on surface.", "Wheel, wheel nuts, rim, or moun,ng equipment is damaged, cracked, loose, missing, or broken.", "DOT Requirement – Mud Flap is damaged, missing, unsecured or held up with a zip-,e, tape or similar [DOT Only]"],
    "Lights & Light Covers": ["Any lights are cracked (leaving hole or void), missing, or not working properly"],
    "Body & Doors": ["Items attached to the body of the vehicle (for example: side view camera, or cargo steps) are missing, damaged, loose, unsecure, hanging, or held with a zip-tie, tape, or similar", "DOT Requirement – Amazon DOT decal (USDOT2881058) is damaged, missing, excessively dirty, or not visible, or any exis,ng rental provider DOT decals are not covered and are visible. [DOT Only]", "Prime decal is damaged, missing, excessively dirty, or not visible."],
    "Suspension & Exhaust System": ["Ac,ve non-clear fluid leaking on the ground.", "Loose or hanging objects underneath the vehicle.", "Fuel cap is missing or broken [DOT Only]."],
    "EV System": ["Orange wires are present in the charging port or cable. Warning High Voltage! Do Not Touch!", "Charging port cap is missing or broken."],
    "Side Mirrors": ["Side mirror glass is cracked, damaged, or missing.", "Side mirrors are loose, hanging, unsecured, or held up with a zip-,e, tape, or similar.", "Side mirrors cannot be adjusted."],
    "Front Tire, Wheel, & Rim": ["Tire has insufficient tread (Less than 2/32\ or 1.6mm) on inner most, middle, or outer most tread.", "DOT Requirement – Tire has insufficient tread (Less than 4/32\ or 3.2mm) on inner most, middle, or outer most tread [DOT Only].", "Tire has objects, cuts, dents, swells, leaks, appears flat, or exposed wire on surface.", "Wheel, wheel nut, rim, or moun,ng equipment is damaged, cracked, loose, missing, or broken."],
  },
  "BACK SIDE": {
    "Lights & Light Covers": ["Hazard light is not working", "License plate light is not working", "Any lights are cracked (leaving hole or void), missing, or not working properly", "Taillight is not working"],
    "Body & Doors": ["Items attached to the body of the vehicle (for example: bumper, back-up camera, lik gate, or rear step) are missing, damaged, loose, unsecure, hanging, or held with a zip-,e, tape, or similar."],
    "License Plates & Tags": ["License plates or temporary tags are damaged, missing, illegible, or expired."],
    "Suspension & Exhaust System": ["Loose or hanging objects underneath"],
    "EV System": ["Orange wires are present in the charging port or cable. Warning High Voltage! Do Not Touch!"],
  },
  "PASSENGER SIDE": {
    "Side Mirrors": ["Side mirror or window glass is cracked, damaged, or missing", "Side mirrors are loose, hanging, unsecured, or held up with a zip-,e, tape, or similar", "Side mirrors cannot be adjusted"],
    "Front Tire, Wheel, & Rim": ["Tire has insufficient tread (Less than 2/32\ or 1.6mm) on inner most, middle, or outer most tread", "DOT Requirement – Tire has insufficient tread (Less than 4/32\ or 3.2mm) on inner most, middle, or outer most tread [DOT Only]", "Tire has objects, cuts, dents, swells, leaks, appears flat, or exposed wire on surface", "Wheel, wheel nut, rim, or moun,ng equipment is damaged, cracked, loose, missing, or broken"],
    "Lights & Light Covers": ["Any lights are cracked (leaving hole or void), missing, or not working properly"],
    "Body & Doors": ["Items attached to the body of the vehicle (for example: side view camera, or cargo steps) are missing, damaged, loose, unsecure, hanging, or held with a zip-tie, tape, or similar", "DOT Requirement – Amazon DOT decal (USDOT2881058) is damaged, missing, excessively dirty, or not visible, or any exis,ng rental provider DOT decals are not covered and are visible. [DOT Only]", "Prime decal is damaged, missing, excessively dirty, or not visible."],
    "Suspension & Exhaust System": ["Loose or hanging objects underneath the vehicle."],
    "EV system": ["Orange wires are present in the charging port or cable. Warning High Voltage! Do Not Touch!"],
    "Back Tire, Wheel, & Rim": ["Tire has insufficient tread (Less than 2/32\ or 1.6mm) on inner most, middle, or outer most tread.", "Tire has objects, cuts, dents, swells, leaks, appears flat, or exposed wire on surface.","Wheel, wheel nuts, rim, or moun,ng equipment is damaged, cracked, loose, missing, or broken.","DOT Requirement – Mud Flap is damaged, missing, unsecured or held up with a zip-,e, tape or similar [DOT Only]"],
  },
  "IN CAB": {
    "Body & Doors": ["One or more exterior doors (driver, passenger, cargo, or back door) cannot open,close, lock, or unlock properly from the inside of the vehicle.", "Interior sliding door (bulkhead doors) cannot open or close.", "Items a[ached to the body of the vehicle (for example: shelves, floor panels) are missing, damaged, loose, unsecure, hanging, or held with a zip-,e, tape, or similar."],
    "Brakes": ["Foot brake is grinding, vibrates, leaking air, or not working.", "Foot brake is squeaking, loose, weak, or stiff.", "Parking brake is not working.", "Parking brake is loose, weak, or stiff.", "DOT Requirement – Air pressure gauge read less than 79 lb./in2 (5.5 kg/cm2) [DOT Only]"],
    "Wipers": ["Windshield washer system/wiper fluid reservoir is not working.", "Wiper blades are missing, damaged, or not working."],
    "Windshield": ["Any crack, chip, stars on the windshield >1/2 inch (excluding 1-inch boarder of windshield).", "Device or accessory is mounted on the windshield."],
    "Lights & Light Covers": ["Any red warning lights or lamps are on or flashing.", "Any yellow warning lights/lamps are on or flashing [EV only].", "Dashboard light is not working.", "Hazard light is not working.", "Turn signal is not working."],
    "Safety Accessories": ["Delivery device cradle is damaged, missing, or is mounted with a tape, zip-tie or similar.", "DOT Requirement – Spare fuses or reflec,ve triangles are missing [DOT Only]", "Fire ex,nguisher is missing, not mounted, mounted with a tape, zip-,e or similar, or the dial or needle is not in the green zone [EV and DOT Only]", "Device is not able to be stowed behind dashboard without becoming loose and no device mount is present [EV Only]", "Driver display or center display is blank or not func,oning [EV Only]"],
    "Camera or Monitor": ["Netradyne camera is hanging/disconnected from bracket", "Rear or side camera monitor is missing, broken, unsecure, obstructed, or not working.", "Sensors or cameras are dirty, or a warning light/message is present signaling an issue on the dashboard [EV Only]"],
    "Vehicle DocumentaTon [All DOT only]": ["DOT Requirement – DOT, CA BIT, or State Inspec,on s,cker is missing, damaged, illegible, or expired [DOT Only]", "DOT Requirement – Insurance informa,on, registra,on, short haul exemp,on, or cer,fica,on of lease is missing, damaged, illegible, or expired [DOT Only]"],
    "HVAC System": ["AC not blowing cold air", "Defroster or heater is not working"],
    "Steering, Horn, & Alarm": ["Horn, backup alarm, or seatbelt alarm is not working.", "Seatbelt is missing, torn, frayed, or not working.", "Steering wheel has excessive vibration.", "Steering wheel is s,ff, loose, or needs alignment.", "AVAS noise does not sound when vehicle travels under 12 mph [EV Only]"],
    "Cleanliness": ["Poggiatesta"],
  },
};

const mainButtons = Object.keys(submenuData);

interface CameraMenuProps {
  position: "left" | "right";
  activeMenu: string | null;
  activeSubmenu: string | null;
  setActiveMenu: (value: string | null) => void;
  setActiveSubmenu: (value: string | null) => void;
}

export default function CameraMenu({
  position,
  activeMenu,
  activeSubmenu,
  setActiveMenu,
  setActiveSubmenu,
}: CameraMenuProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  function onMainClick(label: string) {
    setActiveMenu(label);
    setActiveSubmenu(null);
    moveCameraTo(label);
  }

  function onSubClick(subKey: string) {
    setActiveSubmenu(subKey);
  }

  function toggleCheckbox(detail: string) {
    setCheckedItems(prev => ({
      ...prev,
      [detail]: !prev[detail],
    }));
  }

  if (position === "right") {
    return (
      <div className="menu-main">
        {mainButtons.map((label) => (
          <button
            key={label}
            onClick={() => onMainClick(label)}
            className={`menu-btn ${activeMenu === label ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (position === "left" && activeMenu) {
    return (
      <div className="menu-submenu">
        {Object.entries(submenuData[activeMenu]).map(([subKey, details]) => (
          <div key={subKey}>
            <button
              onClick={() => onSubClick(subKey)}
              className={`submenu-btn ${activeSubmenu === subKey ? "active" : ""}`}
            >
              {subKey}
            </button>

            {activeSubmenu === subKey && (
              <div className="submenu-details">
                {details.map((detail) => (
                  <label key={detail} className="detail-item">
                    <input
                      type="checkbox"
                      className="detail-checkbox"
                      checked={!!checkedItems[detail]}
                      onChange={() => toggleCheckbox(detail)}
                    />
                    <span>{detail}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
