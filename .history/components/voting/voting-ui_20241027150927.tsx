import { useWallet } from '@solana/wallet-adapter-react';
import { useVotingProgram } from './voting-data-access';
import { useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export function ProposalCreate() {
  const { createProposal } = useVotingProgram();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const isFormValid = title.trim() !== '' && description.trim() !== '';

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createProposal.mutateAsync({ title, description });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-lg shadow-lg">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
      />
      <br />
      <button
        type="button"
        className="btn btn-xs lg:btn-md btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        onClick={handleSubmit}
        disabled={createProposal.isPending || !isFormValid}
      >
        Create Proposal {createProposal.isPending && '...'}
      </button>
    </div>
  );
}

export function ProposalList() {
  const { proposals, getProgramAccount } = useVotingProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      {proposals.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : proposals.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {proposals.data?.map((account) => (
            <ProposalCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No proposals</h2>
          No proposals found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function ProposalCard({ account }: { account: PublicKey }) {
  const { vote, proposals } = useVotingProgram();
  const { publicKey } = useWallet();
  const proposal = proposals.data?.find((p) => p.publicKey.equals(account));

  const handleVote = async (voteFor: boolean) => {
    console.log('voteFor', voteFor);

    if (!publicKey || !proposal) return;

    try {
      await vote.mutateAsync({
        proposal: account,
        voteFor,
        nftMint: new PublicKey(TOKEN_PROGRAM_ID), // Replace with actual NFT mint address
        governanceTokenMint: new PublicKey(TOKEN_PROGRAM_ID), // Replace with actual governance token mint address
        governanceTokenMintAuthority: publicKey, // This might need to be a different authority
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return proposals.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

    <div className="card card-bordered border-base-300 border-4 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
  <div className="card-body items-center text-center p-6">
    <div className="space-y-6">
      <h2 className="card-title text-4xl font-bold mb-4">
        {proposal?.account.title}
      </h2>
      <p className="text-lg text-gray-200">{proposal?.account.description}</p>
      <div className="card-actions justify-around mt-6">
        <button
          className="btn btn-xs lg:btn-md btn-primary hover:bg-blue-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(true)}
          disabled={vote.isPending}
        >
          Vote For ({proposal?.account.votesFor.toString()})
        </button>
        <button
          className="btn btn-xs lg:btn-md btn-secondary hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={() => handleVote(false)}
          disabled={vote.isPending}
        >
          Vote Against ({proposal?.account.votesAgainst.toString()})
        </button>
      </div>
      <div className="text-center space-y-4 mt-4">
        <p className="text-sm">
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
            className="text-blue-200 underline hover:text-blue-400"
          />
        </p>
      </div>
    </div>
  </div>
</div>

  );
}
