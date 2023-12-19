// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Voting
{
    struct Candidate            //structure that is going to store name and voteCount of each candidate.
    {
        string name;
        uint256 voteCount;
    }

    Candidate [] public candidates ; //array to store candidates info
    address owner;

    mapping (address => bool) public voters; //store voters that are already voted.
    uint256 votingStart;
    uint256 votingEnd;

    constructor (string [] memory _candidateNames,uint256 _duration)
    {
        for (uint i=0;i<_candidateNames.length;i++)
        {
            candidates.push (Candidate({
                name:_candidateNames[i],
                voteCount:0
            }));
        }
        owner=msg.sender;
        votingStart=block.timestamp;
        votingEnd=block.timestamp+(_duration * 1 minutes);
    }

    modifier onlyOwner{            //to create accessibility of some functions to owner itself only;
        require(msg.sender==owner);
        _;
    }

    function  addCandidate (string memory _name)public onlyOwner   //for owner to create candidates
    {
        candidates.push (Candidate({
            name:_name,
            voteCount:0
        }));
    }


    function vote (uint256 _index) public //to ote on the basis of index
    {
        require (!voters[msg.sender],"YOU HAVE ALREADY VOTED.");
        require(_index<candidates.length,"INVALID VOTING METHOD.");

        candidates[_index].voteCount++;
        voters[msg.sender]=true;
    }

    function getAllVotesOfCandidates() public view returns (Candidate[] memory)  //get all votes of all candidates
    {
        return candidates;
    }

    function getVotingStatus() public view returns (bool)  //if voting is going on or ended,
    {
        return (block.timestamp>=votingStart && block.timestamp<votingEnd);
    }

    function getRemainingTime() public view returns (uint256)  //returns remaining time.
    {
        require(block.timestamp>=votingStart , "VOTING HASN'T STARTED YET.");
        if (block.timestamp>=votingEnd)
        {
            return 0;
        }

        return votingEnd-block.timestamp;
    }
}