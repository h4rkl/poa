import LeaderFeature from "@/components/leaders/leader-feature";
import styles from "./page.module.css";

import POAFeature from "@/components/dashboard/poa-feature";

export default function Page() {
  return (
    <div className={styles.container}>
      <POAFeature />
      <LeaderFeature />
    </div>
  );
}
