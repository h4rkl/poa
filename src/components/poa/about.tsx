import React from "react";

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">
        Proof of Attention (PoA)
      </h1>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">How It Works</h2>
          <p>
            Proof of Attention (PoA) is a system that rewards users for their
            attention and engagement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">Rewards</h2>
            <p>
              Users earn tokens for successfully proving their attention. The
              reward amount is fixed for each proof.
            </p>
          </div>
        </div>

        <div className="card bg-secondary text-secondary-content">
          <div className="card-body">
            <h2 className="card-title">Cooldown</h2>
            <p>
              There's a cooldown period between proofs to prevent spam and
              ensure fair distribution of rewards.
            </p>
          </div>
        </div>

        <div className="card bg-accent text-accent-content">
          <div className="card-body">
            <h2 className="card-title">Click for Attention</h2>
            <p>
              Users interact with the system by clicking or performing specific
              actions to prove their attention.
            </p>
          </div>
        </div>

        <div className="card bg-neutral text-neutral-content">
          <div className="card-body">
            <h2 className="card-title">Leaderboards</h2>
            <p>
              Track your progress and compare with others. Leaderboards showcase
              top performers in the PoA system.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <button className="btn btn-primary">Start Earning Rewards</button>
      </div>
    </div>
  );
};

export default About;
