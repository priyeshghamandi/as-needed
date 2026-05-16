"use client";

import { DesignCanvas, DCSection, DCArtboard } from "@/components/design-canvas";
import { IOSDevice } from "@/components/ios-frame";
import {
  S1_Notifications,
  S2_Details,
  S3_AcceptDecline,
  S4_MyShifts,
  S5_Availability,
  S6_Cancellation,
} from "@/components/rn-screens";

export default function RNDesignCanvasPage() {
  const screens = [
    { id: "notifs", label: "01 · Notifications", Cmp: S1_Notifications, note: "Push, in-app, and SMS unified · operational urgency at the top." },
    { id: "details", label: "02 · Shift details", Cmp: S2_Details, note: "All facts the RN needs in one scroll · compliance + map + coordinator." },
    { id: "accept", label: "03 · Accept / decline", Cmp: S3_AcceptDecline, note: "Three-state flow: confirm acknowledgements, success cascade, decline reasons." },
    { id: "shifts", label: "04 · My shifts", Cmp: S4_MyShifts, note: "Hours strip + tabs + list/cal toggle · check-in lives on the active card." },
    { id: "avail", label: "05 · Availability", Cmp: S5_Availability, note: "Quick-set, weekly grid, prefs, facility favorites, travel radius." },
    { id: "cancel", label: "06 · Cancellation", Cmp: S6_Cancellation, note: "Time-pressure framing · reason picker · auto-replacement broadcast." },
  ];

  return (
    <DesignCanvas>
      <DCSection
        id="rn-flow"
        title="RN Interaction Flow"
        subtitle="Notifications → Details → Accept → My Shifts → Availability → Cancellation"
      >
        {screens.map((s) => (
          <DCArtboard key={s.id} id={s.id} label={s.label} width={402} height={874} note={s.note}>
            <IOSDevice width={402} height={874} dark={false}>
              <s.Cmp />
            </IOSDevice>
          </DCArtboard>
        ))}
      </DCSection>
    </DesignCanvas>
  );
}
