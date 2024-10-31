import Link from "next/link";
import React from "react";
import { ExplorerLink } from "../cluster/cluster-ui";

const About: React.FC = () => {
  const winnerCount = 100;
  const clickReward = "1 $CLICK";
  const totalSupply = "100,000";
  const coolDownSec = 10;
  const totalRewardPool = "100 SOL";
  const clickFee = "0.001 SOL";
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">How to play</h2>
        <ul className="space-y-2 list-disc pl-6">
          <li>Click the Button</li>
          <li>Approve the transaction</li>
          <li>
            The first time you approve a tx it will setup all your accounts for
            Proof of Attention
          </li>
          <li>
            Each click rewards you with {clickReward} and deposits a tiny amount of
            SOL into the reward pool
          </li>
          <li>
            Once the button is clicked there is an unbottable cooldown period of
            {coolDownSec} seconds
          </li>
          <li>You can click the button as many times as you want</li>
          <li>
            The top {winnerCount} holders of $CLICK will win a proportional share of the
            reward pool based on their $CLICK balance
          </li>
          <li>
            Any $CLICK bought on the secondary market is eligible for the reward
            pool
          </li>
        </ul>

        <div className="mt-8">
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Play &amp; Earn $CLICK Now
            </button>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 id="tokenomics" className="text-3xl font-bold mb-6">Tokenomics for $CLICK</h2>
        <p className="mb-4">
          $CLICK is the first token to be minted on PoA. It is a fungible token
          that represents the value of a single click on the platform. The token
          is designed to incentivize and validate genuine attention through a
          single interaction with a single button in the app. It is designed to
          validate the contract, the attention, and the ability for the app to
          be botted.
        </p>

        <ul className="space-y-2 list-disc pl-6">
          <li>Initial $CLICK supply: {totalSupply} </li>
          <li>Token airdrop per interaction: {clickReward}</li>
          <li>Interaction cooldown period: {coolDownSec} seconds</li>
          <li>Total possible clicks: {totalSupply} </li>
          <li>
            Reward pool address: <ExplorerLink label={process.env.NEXT_PUBLIC_REWARDS_POOL!} path={`account/${process.env.NEXT_PUBLIC_REWARDS_POOL!}`} />
          </li>
          <li>Reward pool collection per click: {clickFee}</li>
          <li>Total potential reward pool: {totalRewardPool}</li>
          <li>Winner pool: Top {winnerCount} holders of $CLICK</li>
          <li>
            Winner pool distribution strategy: a percentage of the purse
            calculated proportionally by the $CLICK balance of each holder in
            the top {winnerCount} against the total holdings of the top {winnerCount}
          </li>
          <li>
            Pool will be seeded with 10 SOL which will be returned to the Pool
            Owner Acc on completion
          </li>
        </ul>

        <p className="mt-4">
          The program is designed to create fair launch tokens on Solana, with
          transparent authorities and actions. Because each program instance
          launches with all tokens held by the contract no pre-mine can be done.
          And because there is a built-in cooldown for token release, it makes
          it much more difficult for a single person to manipulate the token
          supply.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-6">Proof of Attention (PoA)</h2>
        <p className="space-y-4">
          Proof of Attention is a Solana program that attempts to reward and
          validate users for real world attention and interaction with content
          or real-world activities. The system uses a combination of variables
          that can be adjusted including cooldown periods, reward pools, and fee
          collection to achieve this. Aiming to incentivise user engagement and
          making any application more expensive to bot and removing high
          frequency transactions to run the app at the target speed for
          engagement.
        </p>
        <p className="mt-4">
          The ultimate aim of the program is not to completely stop bots from
          engaging, but rather to level the playing field so applications can be
          engaged at a human pace.
        </p>
      </section>
    </div>
  );
};

export default About;
