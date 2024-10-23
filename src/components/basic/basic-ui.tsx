'use client';

import { attentionTokenMetadata } from '@/poa/constants';
import { usePoaProgram } from './basic-data-access'

export function BasicCreate() {
  const { attentionInitialise } = usePoaProgram();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => attentionInitialise.mutateAsync({ tokenName: attentionTokenMetadata.name })}
      disabled={attentionInitialise.isPending}
    >
      Run program{attentionInitialise.isPending && '...'}
    </button>
  );
}

export function BasicProgram() {
  const { getProgramAccount } = usePoaProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
    </div>
  );
}
