import LeaderFeature from "@/components/leaders/leader-feature";
import styles from "./page.module.css";

import POAFeature from "@/components/dashboard/poa-feature";
import { AccountPoa } from "@/components/account/account-poa";
import { Advertisement } from "@/components/avertise";
import { ads } from "@/components/avertise/ads";

export default function Page() {
  return (
    <div className={styles.container}>
      {ads.map((ad, index) => (
        <Advertisement
          key={index}
          icon={ad.icon}
          title={ad.title}
          description={ad.description}
          url={ad.url}
          bgColor={ad.bgColor}
          textColor={ad.textColor}
          buttonColor={ad.buttonColor}
        />
      ))}
      <POAFeature />
      <AccountPoa />
      <LeaderFeature />
    </div>
  );
}
