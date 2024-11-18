import Link from "next/link";
import React from "react";
import { ExplorerLink } from "../cluster/cluster-ui";

const About: React.FC = () => {
  const clickFee = "0.001 SOL";
  const clickReward = "1 $CLICK";
  const coolDownSec = 7;
  const totalRewardPool = "100 SOL";
  const totalSupply = "100,000";
  const winnerCount = 10;
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">How to play</h2>
        <ul className="space-y-2 list-disc pl-6">
          <li>Click to explode the Button</li>
          <li>Approve the transaction</li>
          <li>First click will setup your accs for $CLICK</li>
          <li>
            All clicks send you {clickReward} and {clickFee} to the reward pool
          </li>
          <li>You can click once every {coolDownSec} seconds</li>
          <li>You can click the button as many times as you want</li>
          <li>
            Top {winnerCount} $CLICK holders win a share of {totalRewardPool}{" "}
            based on their $CLICK balance
          </li>
          <li>
            Any $CLICK bought on the secondary market is also eligible to win
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
        <h2 id="tokenomics" className="text-3xl font-bold mb-6">
          Tokenomics for $CLICK
        </h2>
        <p className="mb-4">
          $CLICK is the first token to be minted using{" "}
          <Link className="link" href="#proof-of-attention">
            PoA
          </Link>
          . It is a fungible token that represents the value of a single click
          on the{" "}
          <Link className="link" href="#proof-of-attention">
            PoA
          </Link>{" "}
          program. The token rewards and verifies real attention with a single
          button tap in the app. This system uses a fair launch protocol to
          ensure equal chances for both users and bots.
        </p>

        <ul className="space-y-2 list-disc pl-6">
          <li>Initial $CLICK supply: {totalSupply} </li>
          <li>Token airdrop per interaction: {clickReward}</li>
          <li>Interaction cooldown period: {coolDownSec} seconds</li>
          <li>Total possible clicks: {totalSupply} </li>

          <li>
            $CLICK token address:{" "}
            <ExplorerLink
              label={process.env.NEXT_PUBLIC_MINT!}
              path={`account/${process.env.NEXT_PUBLIC_MINT!}`}
            />
          </li>
          <li>
            Reward pool address:{" "}
            <ExplorerLink
              label={process.env.NEXT_PUBLIC_TOKEN_FEE_VAULT!}
              path={`account/${process.env.NEXT_PUBLIC_TOKEN_FEE_VAULT!}`}
            />
          </li>
          <li>Reward pool collection per click: {clickFee}</li>
          <li>Total potential reward pool: {totalRewardPool}</li>
          <li>Winner pool: Top {winnerCount} holders of $CLICK</li>
          <li>
            Token vault address:{" "}
            <ExplorerLink
              label={process.env.NEXT_PUBLIC_TOKEN_POOL_VAULT!}
              path={`account/${process.env.NEXT_PUBLIC_TOKEN_POOL_VAULT!}`}
            />
          </li>
          <li>
            Winner pool distribution strategy: a percentage of the purse
            calculated proportionally by the $CLICK balance of each holder in
            the top {winnerCount} against the total holdings of the top{" "}
            {winnerCount}
          </li>
          <li>
            Pool will be seeded with 10 SOL which will be returned to the Pool
            Owner Acc on completion
          </li>
        </ul>

        <p className="mt-4">
          The program creates fair launch tokens on Solana which can be mapped
          to different stores of attention value, using transparent authorities
          and actions to ensure fairness. Each instance starts with all tokens
          held by the contract, preventing pre-mining. Additionally, a cooldown
          period for token release discourages manipulation, and a single-button
          interaction in the app validates genuine attention, leveling the
          playing field between users and bots.
        </p>
      </section>

      <section className="mb-12">
        <h2 id="completion" className="text-4xl font-bold mb-6">
          Competition completion
        </h2>
        <p className="mt-4">
          At this stage the plan is to wait until all $CLICK has been extracted
          from the token reward pool (
          {
            <ExplorerLink
              label={process.env.NEXT_PUBLIC_TOKEN_FEE_VAULT!}
              path={`account/${process.env.NEXT_PUBLIC_TOKEN_FEE_VAULT!}`}
            />
          }
          ). But this is subject to change depending on the experiments run as
          it may make sense to have an earlier finish date.
        </p>
        <p className="mt-4">
          Whatever the case, everything will be announced on Twitter and the
          community will be notified of the completion date as soon as anything
          is decided. A countdown timer will appear on the main site once the
          final snapshot date for $CLICK holders is announced so you will know
          exactly when the snapshot is going to be taken.
        </p>
      </section>

      <section id="proof-of-attention" className="mb-12">
        <h2 className="text-4xl font-bold mb-6">Proof of Attention (PoA)</h2>
        <p className="space-y-4">
          Proof of Attention is a soon to be Open Source Solana program that
          attempts to solve fair launch rewards and validate users for genuine
          engagement and interaction with content or real-world activities. The
          program uses a combination of variables that can be adjusted including
          cooldown periods, reward pools, and fee collection to achieve this.
          Aiming to incentivise engagement and making any application more
          expensive to bot by removing high frequency transactions to line up
          with real world interaction times. This is all made possible through
          Solana&lsquo;s Proof of History mechanism which has an inbuilt clock
          in the block chain so we can validate time.
        </p>
        <p className="mt-4">
          The ultimate aim of the program is not to completely stop bots from
          engaging, but rather to level the playing field so applications can be
          engaged at a human pace.
        </p>
        <p className="mt-4">
          The Exploding Button app and $CLICK memecoin are the first in a series
          of experiments to prove the concept of PoA.
        </p>
        <h3 className="text-2xl font-semibold mt-4">
          Some possible PoA future use cases:
        </h3>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>Blinks</li>
          <li>Advertising</li>
          <li>Turn based games</li>
          <li>Fair launch meme coins</li>
          <li>Mining tokens using interactions</li>
        </ul>
        <p className="mt-4">
          The plan to Open Source the application requires a short period of
          testing before the releasing to the public via{" "}
          <Link
            target="_blank"
            className="link"
            href="https://github.com/h4rkl/poa"
          >
            harkl&lsquo;s github
          </Link>
          .
        </p>
        <div className="mt-8">
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Go Play Exploding Button
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
