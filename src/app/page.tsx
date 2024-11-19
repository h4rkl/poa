import LeaderFeature from "@/components/leaders/leader-feature";
import styles from "./page.module.css";

import POAFeature from "@/components/dashboard/poa-feature";
import { AccountPoa } from "@/components/account/account-poa";
import { Advertisement } from "@/components/avertise";
import { ads } from "@/components/avertise/ads";

export default function Page() {
  return (
    <div className={styles.container}>
      <Advertisement />
      <POAFeature />
      <AccountPoa />
      <LeaderFeature />
    </div>
  );
}
