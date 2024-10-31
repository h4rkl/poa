import LeaderFeature from "@/components/leaders/leader-feature";
import styles from "./page.module.css";

import POAFeature from "@/components/dashboard/poa-feature";
import { AccountPoa } from "@/components/account/account-poa";

export default function Page() {
  return (
    <div className={styles.container}>
      <POAFeature />
      <AccountPoa />
      <LeaderFeature />
    </div>
  );
}
