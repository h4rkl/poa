import LeaderFeature from "@/components/leaders/leader-feature";
import styles from "./page.module.css";

import POAFeature from "@/components/dashboard/poa-feature";
import { AccountPoa } from "@/components/account/account-poa";
import { Advertisement } from "@/components/avertise";

export default function Page() {
  return (
    <div className={styles.container}>
      <Advertisement
        icon={"gibwork.webp"}
        title={"gibwork"}
        description={"Find Talent, Find Work on Solana"}
        url="https://gib.work/"
        bgColor={"bg-white"}
        textColor={"text-black"}
        buttonColor={"bg-violet-500"}
      />
      <POAFeature />
      <AccountPoa />
      <LeaderFeature />
    </div>
  );
}
