const ICON_DATA = require("../../../src/icon-data.js").ICON_DATA;

function makeDuotoneIcon(key: string) {
  const d = ICON_DATA[key];
  return function DuotoneIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={d.viewBox}>
        <path d={d.secondary} fill="currentColor" opacity={0.4} />
        <path d={d.primary} fill="currentColor" />
      </svg>
    );
  };
}

export const IconMoon = makeDuotoneIcon("moon");
export const IconMug = makeDuotoneIcon("mug");
export const IconSun = makeDuotoneIcon("sun");
export const IconCouch = makeDuotoneIcon("couch");
export const IconBackpack = makeDuotoneIcon("backpack");
export const IconMailbox = makeDuotoneIcon("mailbox");
export const IconBeach = makeDuotoneIcon("beach");
export const IconRepeat = makeDuotoneIcon("repeat");
export const IconCalendar = makeDuotoneIcon("calendar");
export const IconCheck = makeDuotoneIcon("check");
export const TabNapIcon = makeDuotoneIcon("tabnap");
