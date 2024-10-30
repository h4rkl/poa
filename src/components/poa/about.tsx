import React from "react";

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">
        Proof of Attention (PoA)
      </h1>

      Proof of Attention is a Solana program that attempts to reward and validate users for real world attention and interaction 
      with content or real-world activities. The system uses a combination of variables that can be adjusted including cooldown 
      periods, reward pools, and fee collection to achieve this. Aiming to incentivise user engagement and making 
      any application more expensive to bot and removing high frequency transactions to run the app at the target speed for engagement.

      The ultimate aim of the program is not to completely stop bots from engaging, but rather to level the playing field 
      so applications can be engaged at a human pace.

      ## Tokenomics for $CLICK

      $CLICK is the first token to be minted on PoA. It is a fungible token that represents the value of a single 
      click on the platform. The token is designed to incentivize and validate genuine attention through a single 
      interaction with a single button in the app. It is designed to validate the contract, the attention, and the
      ability for the app to be botted.

      - Initial supply: 100,000
      - Token airdrop per interaction: 1 $CLICK
      - Interaction cooldown period: 30 seconds
      - Total possible clicks: 100,000
      - Reward pool address: BYUdxrVfDHJBz2tUZkuw6PxmZVwQmVwcHNU1LHZJobZW
      - Reward pool collection per click: 0.001 SOL
      - Total potential reward pool: 100 SOL
      - Winner pool: Top 100 holders of $CLICK
      - Winner pool distribution strategy: a percentage of the purse calculated proportionally by 
        the $CLICK balance of each holder in the top 100 against the total holdings of the top 100

      The program is designed to create fair launch tokens on Solana, with transparent authorities and 
      actions. Because each program instance launches with all tokens held by the contract no pre-mine 
      can be done. And because there is a built-in cooldown for token release, it makes it much more difficult for a single
      person to manipulate the token supply.

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <button className="btn btn-primary">Start Earning Rewards</button>
      </div>
    </div>
  );
};

export default About;
