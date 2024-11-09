import React from 'react';

interface TweetProps {
  text: string;
  children?: React.ReactNode | ((props: { handleClick: () => void }) => React.ReactNode);
}

const Tweet: React.FC<TweetProps> = ({ text, children }) => {
  const handleClick = () => {
    const tweetUrl = `https://twitter.com/intent/post?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const TwitterIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );

  if (typeof children === 'function') {
    return <>{children({ handleClick })}</>;
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center text-sm text-cyan-400 hover:text-cyan-500"
    >
      <TwitterIcon />
      {children || 'Share'}
    </button>
  );
};

export default Tweet;