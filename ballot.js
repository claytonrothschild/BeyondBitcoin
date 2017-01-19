contract Ballot {
    struct Voter {
        uint weight;
        bool voted;
        uint8 vote;
        address delegate;
    }
    struct Proposal {
        string name;
        string description;
        string presenters;
        address creator;
        uint voteCount;
    }

    address public chairperson;
    uint8 public numberOfProposals;
    mapping(address => Voter) public voters;
    mapping(uint8 => Proposal) public proposals;
    
    event ProposalAdded(uint8 proposalID, string name, string description, string presenters);

    function Ballot() {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        numberOfProposals = 0;
    }

    function giveRightToVote(address voter) {
        if (msg.sender != chairperson || voters[voter].voted) return;
        voters[voter].weight = 1;
    }

    function delegate(address to) {
        Voter sender = voters[msg.sender];
        if (sender.voted) return;
        while (voters[to].delegate != address(0) && voters[to].delegate != msg.sender)
            to = voters[to].delegate;
        if (to == msg.sender) return;
        sender.voted = true;
        sender.delegate = to;
        Voter delegate = voters[to];
        if (delegate.voted)
            proposals[delegate.vote].voteCount += sender.weight;
        else
            delegate.weight += sender.weight;
    }

    function vote(uint8 proposal) {
        Voter sender = voters[msg.sender];
        if (sender.voted || proposal >= numberOfProposals) return;
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    function getDetails(uint8 proposal) constant returns (string name, string description, string presenters, uint voteCount, address creator) {
        name = proposals[proposal].name;
        description = proposals[proposal].description;
        presenters = proposals[proposal].presenters;
        voteCount = proposals[proposal].voteCount;
        creator = proposals[proposal].creator;
    }

    function propose(string name, string description, string presenters) returns (uint8 proposalId) {
        proposals[numberOfProposals].creator = msg.sender;
        proposals[numberOfProposals].name = name;
        proposals[numberOfProposals].description = description;
        proposals[numberOfProposals].presenters = presenters;
        ProposalAdded(numberOfProposals, name, description, presenters);
        proposalId = numberOfProposals;
        numberOfProposals += 1;
    }
    
    function winningProposal() constant returns (uint8 winningProposal, string winningProposalName, string proposalDesc, string proposalPresenters, uint winningCount, uint totalVotes) {
        uint256 winningVoteCount = 0;
        for (uint8 proposal = 0; proposal < numberOfProposals; proposal++) {
            if (proposals[proposal].voteCount > winningVoteCount) {
                winningVoteCount = proposals[proposal].voteCount;
                winningProposal = proposal;
                winningProposalName = proposals[proposal].name;
                proposalDesc = proposals[proposal].description;
                proposalPresenters = proposals[proposal].presenters;
                winningCount = proposals[proposal].voteCount;
            }
            totalVotes += proposals[proposal].voteCount;
        }
    }
}
